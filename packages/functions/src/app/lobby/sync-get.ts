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
  IActivitiesTicketsVisitorsUsed,
  IActivitiesRegister,
  IActivitiesVisitors,
  IActivitiesVisitorsDefaultSurvey,
  IActivitiesDefaultAnswer,
} from "../../database";
import { error } from "../../error";

export interface Database {
  activities_lobby: IActivitiesLobby;
  activities_tickets_visitors: IActivitiesTicketsVisitors;
  activities_tickets_types: IActivitiesTicketsType;
  activities_tickets_visitors_used: IActivitiesTicketsVisitorsUsed;
  activities_register: IActivitiesRegister;
  activities_visitors: IActivitiesVisitors;
  activities_visitors_default_survey: IActivitiesVisitorsDefaultSurvey;
  activities_survey_default_answer: IActivitiesDefaultAnswer;
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

  const limit = parseInt(event?.pathParameters?.limit || "500", 10);
  const offset = parseInt(event?.pathParameters?.offset || "0", 10);

  try {
    const deskResults = await db
      .selectFrom("activities_lobby")
      .select(["lobbyId"])
      .where("lobbyId", "=", decodedToken.id)
      .where("activityId", "=", activityId)
      .executeTakeFirst();
    if (!deskResults) return error(401, "Unauthorized");

    const ticketsResults = await db
      .selectFrom("activities_tickets_visitors")
      .select([
        "activities_tickets_visitors.ticketId",
        "activities_tickets_visitors.ticketTypeId",
        "activities_tickets_visitors.validAt",
      ])
      .leftJoin(
        "activities_tickets_visitors_used",
        "activities_tickets_visitors_used.ticketId",
        "activities_tickets_visitors.ticketId"
      )
      .where("activities_tickets_visitors.activityId", "=", activityId)
      .where("activities_tickets_visitors.active", "=", true)
      .where("activities_tickets_visitors_used.createdAt", "is", null)
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify({ tickets: ticketsResults }),
    };
  } catch (err) {
    console.error("RDS Error:", err);
    return error(500, "Internal Server Error: RDS operation failed");
  }
};
