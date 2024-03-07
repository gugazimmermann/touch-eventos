import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely, sql } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import {
  IActivitiesRegister,
  IActivitiesVisitors,
  IActivitiesVisitorsDefaultSurvey,
  IActivitiesDefaultAnswer,
} from "../../database";
import { error } from "../../error";

export interface Database {
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
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const results = await db
      .selectFrom("activities_register as ar")
      .leftJoin("activities_visitors as av", "av.phone", "ar.phone")
      .innerJoin("activities_visitors_default_survey as ds", (join) =>
        join
          .onRef("ds.visitorId", "=", "av.visitorId")
          .on("ds.questionId", "=", 6)
      )
      .innerJoin("activities_visitors_default_survey as ds2", (join) =>
        join
          .onRef("ds2.visitorId", "=", "av.visitorId")
          .on("ds2.questionId", "=", 7)
      )
      .innerJoin("activities_visitors_default_survey as ds3", (join) =>
        join
          .onRef("ds3.visitorId", "=", "av.visitorId")
          .on("ds3.questionId", "=", 8)
      )
      .select(sql`count(*)`.as("count"))
      .where("av.name", "is not", null)
      .where("ar.activityId", "=", activityId)
      .executeTakeFirst();

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error("Error:", err);
    return error(500, "Internal Server Error");
  }
};
