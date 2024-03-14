import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import * as jwt from "jsonwebtoken";
import { IActivitiesLobby } from "../../database";
import { dynamoDBClient } from "../../aws-clients";
import { error } from "../../error";

export interface Database {
  activities_lobby: IActivitiesLobby;
}

const db = new Kysely<Database>({
  dialect: new DataApiDialect({
    mode: "mysql",
    driver: {
      database: RDS.Database.defaultDatabaseName,
      secretArn: RDS.Database.secretArn,
      resourceArn: RDS.Database.clusterArn,
      client: new RDSData({}),
    },
  }),
});

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  if (!JWT_SECRET || !activitiesTable)
    return error(500, "Internal Server Error");

  const slug = event?.pathParameters?.slug;
  if (!slug) return error(400, "Bad Request: Missing Activity Slug");

  const data = JSON.parse(event?.body || "");
  if (!data?.user && !data?.code)
    return error(400, "Bad Request: Missing Parameters");

  try {
    // const activitiesParams: QueryCommandInput = {
    //   TableName: activitiesTable,
    //   ExpressionAttributeNames: {
    //     "#activityId": "activityId",
    //     "#active": "active",
    //     "#payment": "payment",
    //     "#name": "name",
    //     "#slug": "slug",
    //     "#multiple": "multiple",
    //   },
    //   ExpressionAttributeValues: { ":slug": slug },
    //   IndexName: "SlugIndex",
    //   KeyConditionExpression: "#slug = :slug",
    //   ProjectionExpression: "#activityId, #active, #payment, #name, #slug, #multiple",
    // };
    // const activitiesResults: QueryCommandOutput = await dynamoDBClient.send(
    //   new QueryCommand(activitiesParams)
    // );
    // if (!activitiesResults?.Items?.length) return error(404, "Not Found: Activity Not Found");
    // const activity = activitiesResults.Items[0];

    const activity = {
      activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
      name: "Festival de Música",
      slug: "festival-de-musica",
      multiple: false,
      payment: {
        status: "success",
      },
      active: 1,
    };

    const lobbyResult = await db
      .selectFrom("activities_lobby")
      .select(["lobbyId"])
      .where("user", "=", data.user)
      .where("accessCode", "=", data.code)
      .where("active", "=", true)
      .where("activityId", "=", activity.activityId)
      .executeTakeFirst();

    if (!lobbyResult) return error(401, "Unauthorized");

    const token = jwt.sign({ id: lobbyResult.lobbyId }, JWT_SECRET, {
      expiresIn: 86400, // expires in 1 day
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ token, activity }),
    };
  } catch (err) {
    console.error("Operation Error:", err);
    return error(500, "Internal Server Error: Operation failed");
  }
};
