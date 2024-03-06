import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { GetCommand, type GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesRegister } from "../database";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../error";

export interface Database {
  activities_register: IActivitiesRegister;
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

  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  if (!activitiesTable) return error(500, "Internal Server Error");

  const activityId = event?.pathParameters?.id;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  const data = JSON.parse(event?.body || "");
  if (!data.registrationId)
    return error(400, "Bad Request: Missing Registration Id");

  try {
    // get activity
    const activitiesResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: activitiesTable,
        Key: { activityId },
      })
    );
    if (!activitiesResults.Item)
      return error(404, "Not Found: activity not found");

    // get registration
    const registrationsResults = await db
      .selectFrom("activities_register")
      .select(["registrationId", "code", "phone", "email"])
      .where("registrationId", "=", data.registrationId)
      .where("activityId", "=", activityId)
      .execute();

    if (!registrationsResults.length) return error(404, "Not Found");
    const registration = registrationsResults[0];

    // confirm code
    if (registration.code !== data.code.trim().toLowerCase())
      return error(400, "Bad Request: Wrong Code");

    const token = jwt.sign({ id: registration.registrationId }, JWT_SECRET, {
      expiresIn: 86400, // expires in 1 day
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        registration: {
          phone: registration.phone,
          email: registration.email,
        },
      }),
    };
  } catch (err) {
    console.error("Operation Error:", err);
    return error(500, "Internal Server Error: Operation failed");
  }
};
