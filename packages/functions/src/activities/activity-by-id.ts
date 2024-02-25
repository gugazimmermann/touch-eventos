import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  GetCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Kysely, sql } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { dynamoDBClient, s3Client } from "../aws-clients";
import { IActivitiesRegister, IActivitiesDesk } from "../database";
import { error } from "../error";

export interface Database {
  activities_register: IActivitiesRegister;
  activities_desk: IActivitiesDesk;
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
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const plansTable = process.env.PLANS_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const activitiesImagesBucket = process.env.ACTIVITIES_IMAGES_BUCKET;
  if (
    !activitiesTable ||
    !plansTable ||
    !verificationsTable ||
    !activitiesImagesBucket
  )
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const params: QueryCommandInput = {
      TableName: activitiesTable,
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#activityId": "activityId",
      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":activityId": activityId,
      },
      IndexName: "UserIdEndDateIndex",
      KeyConditionExpression: "#userId = :userId",
      FilterExpression: "#activityId = :activityId",
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    if (!results.Items?.length)
      return error(404, "Not Found: activity not found");
    const item = results.Items[0];

    const plansParams: GetCommandInput = {
      TableName: plansTable,
      Key: { planId: item.planId },
    };

    const verificationsParams: GetCommandInput = {
      TableName: verificationsTable,
      Key: { verificationId: item.verificationId },
    };

    const [plansResults, verificationsResults]: [
      GetCommandOutput,
      GetCommandOutput
    ] = await Promise.all([
      await dynamoDBClient.send(new GetCommand(plansParams)),
      await dynamoDBClient.send(new GetCommand(verificationsParams)),
    ]);
    item.plan = plansResults.Item;
    item.verification = verificationsResults.Item;

    const deskResults = await db
      .selectFrom("activities_desk")
      .select(({ fn }) => [fn.count<number>("deskId").as("desk_count")])
      .where("activityId", "=", item.activityId)
      .where("active", "=", true)
      .execute();

    item.desk = deskResults?.[0]?.desk_count;

    const registerResults = await db
      .selectFrom("activities_register")
      .select([
        sql<number>`count(registrationId)`.as("registration_count"),
        "confirmed",
      ])
      .where("activityId", "=", item.activityId)
      .groupBy("confirmed")
      .execute();

    item.registers = registerResults.reduce((acc, cur) => acc + cur.registration_count, 0);
    item.registersConfirmed = registerResults.find(x => x.confirmed)?.registration_count || 0;

    item.surveys = [];

    if (item.image) {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: activitiesImagesBucket,
          Key: item.image,
        }),
        { expiresIn: 60 * 60 * 24 * 6 }
      );
      item.logo = url;
    }

    const { payment, ...itemRest } = item;
    return {
      statusCode: 200,
      body: JSON.stringify({ ...itemRest, payment: payment?.status }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
