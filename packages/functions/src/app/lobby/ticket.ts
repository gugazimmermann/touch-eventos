import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import {
  IActivitiesLobby,
  IActivitiesTicketsVisitors,
  IActivitiesTicketsType,
  IActivitiesVisitors,
  IActivitiesTicketsVisitorsUsed,
} from "../../database";
import { error } from "../../error";

export interface Database {
  activities_lobby: IActivitiesLobby;
  activities_tickets_visitors: IActivitiesTicketsVisitors;
  activities_tickets_types: IActivitiesTicketsType;
  activities_visitors: IActivitiesVisitors;
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

    const checkTicketResults = await db
      .selectFrom("activities_tickets_visitors")
      .select([
        "activities_tickets_visitors.ticketId",
        "activities_tickets_visitors.validAt",
        "activities_tickets_visitors.active",
      ])
      .leftJoin(
        "activities_tickets_visitors_used",
        "activities_tickets_visitors_used.ticketId",
        "activities_tickets_visitors.ticketId"
      )
      .select(["activities_tickets_visitors_used.createdAt as usedAt"])
      .leftJoin(
        "activities_tickets_types",
        "activities_tickets_types.ticketTypeId",
        "activities_tickets_visitors.ticketId"
      )
      .select([
        "activities_tickets_types.name as typeName",
        "activities_tickets_types.lobbyInstructions as typeInstructions",
      ])
      .leftJoin(
        "activities_visitors",
        "activities_visitors.visitorId",
        "activities_tickets_visitors.visitorId"
      )
      .select([
        "activities_visitors.name as visitorName",
        "activities_visitors.document as visitorDocument",
      ])
      .where("activities_tickets_visitors.ticketId", "=", data.ticketId)
      .where("activities_tickets_visitors.activityId", "=", activityId)
      .executeTakeFirst();

    if (!checkTicketResults) return error(404, "Not Found: Ticket Not Found");
    return {
      statusCode: 200,
      body: JSON.stringify(checkTicketResults),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
