import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import * as jwt from "jsonwebtoken";
import {
  IActivitiesRegister,
  IActivitiesVisitors,
  IActivitiesQuestion,
  IActivitiesAnswer,
} from "../database";
import { error } from "../error";

export interface Database {
  activities_register: IActivitiesRegister;
  activities_visitors: IActivitiesVisitors;
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
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) return error(500, "Internal Server Error");

  const slug = event?.pathParameters?.slug;
  if (!slug) return error(400, "Bad Request: Missing Activity Slug");

  const data = JSON.parse(event?.body || "");
  if (!data?.token) return error(400, "Bad Request: Missing Token");
  const decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  if (!data?.visitorID) return error(400, "Bad Request: Missing Visitor ID");

  try {
    const registrationsResults = await db
      .selectFrom("activities_register")
      .select(["registrationId"])
      .where("registrationId", "=", decodedToken.id)
      .execute();
    if (!registrationsResults.length) return error(401, "Unauthorized");

    const visitorResults = await db
      .selectFrom("activities_visitors")
      .select(["visitorId"])
      .where("visitorId", "=", data.visitorID)
      .execute();
    if (!visitorResults.length) return error(401, "Unauthorized");

    const results = await db
      .selectFrom("activities_survey_question")
      .leftJoin(
        (eb) =>
          eb
            .selectFrom("activities_survey_answer")
            .select([
              "questionId",
              "answerId",
              "answer",
              "order as answerOrder",
            ])
            .where("activities_survey_answer.active", "=", true)
            .where("activities_survey_answer.language", "=", "pt-BR")
            .orderBy("activities_survey_answer.order", "asc")
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
      .where("activities_survey_question.language", "=", "pt-BR")
      .where("activities_survey_question.active", "=", true)
      .orderBy("activities_survey_question.order", "asc")
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
