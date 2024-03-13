import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesLobby, IActivitiesTicketsType } from "../../database";
import { error } from "../../error";

export interface Database {
  activities_lobby: IActivitiesLobby;
  activities_tickets_types: IActivitiesTicketsType;
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
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");
  const data = JSON.parse(event?.body || "");
  if (!data?.token) return error(400, "Bad Request: Missing Data");
  const decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: number };

  try {
    const deskResults = await db
      .selectFrom("activities_lobby")
      .select(["lobbyId"])
      .where("lobbyId", "=", decodedToken.id)
      .where("activityId", "=", activityId)
      .executeTakeFirst();
    if (!deskResults) return error(401, "Unauthorized");

    const typesResults = await db
      .selectFrom("activities_tickets_types")
      .select(["ticketTypeId", "name", "lobbyInstructions", "active"])
      .where("activityId", "=", activityId)
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify({ types: typesResults }),
    };
  } catch (err) {
    console.error("RDS Error:", err);
    return error(500, "Internal Server Error: RDS operation failed");
  }
};
