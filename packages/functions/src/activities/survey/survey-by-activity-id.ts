import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesQuestion, IActivitiesAnswer } from "../../database";
import { error } from "../../error";

export interface Database {
  activities_survey_question: IActivitiesQuestion;
  activities_survey_answer: IActivitiesAnswer;
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
  const lang = event?.pathParameters?.lang;
  if (!lang) return error(400, "Bad Request: Missing Language");

  try {
    const results = await db
      .selectFrom("activities_survey_question")
      .leftJoin(
        (eb) =>
          eb
            .selectFrom("activities_survey_answer")
            .select(["questionId", "answerId", "answer", "order"])
            .where("activities_survey_answer.active", "=", true)
            .where("activities_survey_answer.language", "=", lang)
            .orderBy('order', 'asc')
            .as("answers"),
        (join) =>
          join.onRef(
            "answers.questionId",
            "=",
            "activities_survey_question.questionId"
          )
      )
      .selectAll("answers")
      .select([
        "activities_survey_question.questionId",
        "activities_survey_question.question",
        "activities_survey_question.required",
        "activities_survey_question.type",
        "activities_survey_question.order",
      ])
      .where("activities_survey_question.activityId", "=", activityId)
      .where("activities_survey_question.language", "=", lang)
      .where("activities_survey_question.active", "=", true)
      .orderBy('activities_survey_question.order', 'asc')
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
