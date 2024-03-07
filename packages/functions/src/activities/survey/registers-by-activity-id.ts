import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely, sql } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesRegister, IActivitiesVisitorsDefaultSurvey } from "../../database";
import { error } from "../../error";

export interface Database {
  activities_register: IActivitiesRegister;
  activities_visitors_default_survey: IActivitiesVisitorsDefaultSurvey;
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
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const total = await db
      .selectFrom("activities_register")
      .select([
        sql`DATE_FORMAT(createdAt, '%Y-%m-%d %H:00')`.as("date_time"),
        sql`COUNT(*)`.as("total_registers"),
        sql`SUM(CASE WHEN confirmed IS NOT NULL THEN 1 ELSE 0 END)`.as(
          "total_confirmed"
        ),
        sql`SUM(CASE WHEN gift IS NOT NULL THEN 1 ELSE 0 END)`.as("total_gift"),
      ])
      .where('activityId', '=', activityId)
      .groupBy("date_time")
      .orderBy("date_time")
      .execute();

    const gender = await db
      .selectFrom("activities_visitors_default_survey")
      .select([
        sql`COUNT(activities_visitors_default_survey.answerId)`.as("total_answer"),
        "activities_visitors_default_survey.answerId as answer"
      ])
      .innerJoin("activities_register", "activities_register.registrationId", "activities_visitors_default_survey.registrationId")
      .select([sql`DATE_FORMAT(activities_register.createdAt, '%Y-%m-%d %H:00')`.as("date_time"),])
      .where('activities_visitors_default_survey.activityId', '=', activityId)
      .where('activities_visitors_default_survey.questionId', '=', 6)
      .groupBy("date_time")
      .groupBy("answer")
      .orderBy("date_time")
      .execute();

      const age = await db
      .selectFrom("activities_visitors_default_survey")
      .select([
        sql`COUNT(activities_visitors_default_survey.answerId)`.as("total_answer"),
        "activities_visitors_default_survey.answerId as answer"
      ])
      .innerJoin("activities_register", "activities_register.registrationId", "activities_visitors_default_survey.registrationId")
      .select([sql`DATE_FORMAT(activities_register.createdAt, '%Y-%m-%d %H:00')`.as("date_time"),])
      .where('activities_visitors_default_survey.activityId', '=', activityId)
      .where('activities_visitors_default_survey.questionId', '=', 8)
      .groupBy("date_time")
      .groupBy("answer")
      .orderBy("date_time")
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify({
        total,
        gender,
        age
      }),
    };
  } catch (err) {
    console.error("Error:", err);
    return error(500, "Internal Server Error");
  }
};
