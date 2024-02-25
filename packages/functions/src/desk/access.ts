import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesDesk } from "../database";
import { error } from "../error";

export interface Database {
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
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) return error(500, "Internal Server Error");

  const activityId = event?.pathParameters?.id;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  const data = JSON.parse(event?.body || "");
  if (!data?.username || !data?.accessCode)
    return error(400, "Bad Request: Missing Data");

  try {
    const deskResults = await db
      .selectFrom("activities_desk")
      .select(["deskId", "user", "accessCode", "active"])
      .where("user", "=", data.username)
      .where("activityId", "=", activityId)
      .execute();

    if (!deskResults.length) return error(404, "Not Found: User not found");
    const item = deskResults[0];

    if (item.accessCode !== data.accessCode)
      return error(401, "Unauthorized: Wrong Access Code");
    if (!item.active) return error(401, "Unauthorized: User Inactive");
    const token = jwt.sign({ id: item.deskId }, JWT_SECRET, {
      expiresIn: 86400, // expires in 1 day
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
