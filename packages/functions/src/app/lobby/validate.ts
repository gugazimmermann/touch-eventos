import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import {
  IActivitiesLobby,
  IActivitiesTicketsVisitorsUsed,
} from "../../database";
import { error } from "../../error";

export interface Database {
  activities_lobby: IActivitiesLobby;
  activities_tickets_visitors_used: IActivitiesTicketsVisitorsUsed;
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
  if (!data?.token || !data?.ticketId)
    return error(400, "Bad Request: Missing Data");

  const decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: number };

  try {
    const deskResults = await db
      .selectFrom("activities_lobby")
      .select(["lobbyId"])
      .where("lobbyId", "=", decodedToken.id)
      .where("activityId", "=", activityId)
      .executeTakeFirst();
    if (!deskResults) return error(401, "Unauthorized");

    // const alreadyUsedResults = await db
    //   .selectFrom("activities_tickets_visitors_used")
    //   .select(["ticketUsedId"])
    //   .where("ticketId", "=", data.ticketId)
    //   .where("activityId", "=", activityId)
    //   .executeTakeFirst();
    // if (alreadyUsedResults) return error(403, "Forbidden: Ticket has already been used");

    const ticketsUsed = await db
      .insertInto("activities_tickets_visitors_used")
      .values({
        activityId,
        ticketId: data.ticketId,
        lobbyId: decodedToken.id,
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      })
      .executeTakeFirst();
    if (!ticketsUsed?.insertId) return error(500, "Failed to Insert Ticket");
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
