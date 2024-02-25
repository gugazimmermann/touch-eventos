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
  if (!data?.token || !data?.registrationId)
    return error(400, "Bad Request: Missing Data");

  var decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  try {
    const deskResults = await db
      .selectFrom("activities_desk")
      .select(["deskId"])
      .where("deskId", "=", decodedToken.id)
      .where("activityId", "=", activityId)
      .execute();
    if (!deskResults.length) return error(401, "Unauthorized");

    const registerResults = await db
      .selectFrom("activities_register")
      .select(["registrationId", "confirmed", "gift"])
      .where("registrationId", "=", data.registrationId)
      .where("activityId", "=", activityId)
      .execute();

    if (!registerResults.length) return error(404, "Not Found: Register Not Found");

    if (!registerResults[0].confirmed) return error(400, "Bad Request: Visistor Not Confirmed");
    if (registerResults[0].gift) return error(400, "Bad Request: Gift Already Delivered");

    await db
    .updateTable("activities_register")
    .set({
      gift: `${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
      deskId: deskResults[0].deskId,
    })
    .where("registrationId", "=", registerResults[0].registrationId)
    .executeTakeFirst();

    return {
      statusCode: 200,
      body: JSON.stringify({ delivered: true }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
