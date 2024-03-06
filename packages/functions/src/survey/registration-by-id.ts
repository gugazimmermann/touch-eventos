import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import * as jwt from "jsonwebtoken";
import { IActivitiesRegister } from "../database";
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

  const registrationId = event?.pathParameters?.id;
  if (!registrationId)
    return error(400, "Bad Request: Missing Registration ID");

  const data = JSON.parse(event?.body || "");
  if (!data?.token) return error(400, "Bad Request: Missing Token");

  const decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };
  if (decodedToken.id !== registrationId) return error(401, "Unauthorized");
  try {
    const registrationsResults = await db
      .selectFrom("activities_register")
      .select(["phone", "email"])
      .where("registrationId", "=", decodedToken.id)
      .execute();

    if (!registrationsResults.length) return error(404, "Not Found");

    return {
      statusCode: 200,
      body: JSON.stringify(registrationsResults[0]),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
