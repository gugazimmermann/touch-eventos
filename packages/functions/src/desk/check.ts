import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesDesk, IActivitiesRegister } from "../database";
import { error } from "../error";

export interface Database {
  activities_desk: IActivitiesDesk;
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
  const activityId = event?.pathParameters?.id;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");
  const data = JSON.parse(event?.body || "");
  if (!data?.token || !data?.hash) return error(400, "Bad Request: Missing Data");

  var decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  try {
    const deskResults = await db
      .selectFrom("activities_desk")
      .select(["deskId"])
      .where("deskId", "=", decodedToken.id)
      .where("activityId", "=", activityId)
      .execute();
    if (!deskResults.length) return error(401, "Unauthorized");

    const checkRegisterResults = await db
    .selectFrom("activities_register")
    .select(["registrationId", "confirmed", "gift", "activityRegisterHash"])
    .where("activityRegisterHash", "=", data.hash)
    .where("activityId", "=", activityId)
    .execute();

    if (!checkRegisterResults.length) return error(404, "Not Found: Register Not Found");
    return {
      statusCode: 200,
      body: JSON.stringify({ register: checkRegisterResults[0] }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
