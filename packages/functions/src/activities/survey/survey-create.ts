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
  if (!userId) return error(401, "Unauthorized");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");
  const data = JSON.parse(event?.body || "");

  try {
    await db
      .deleteFrom("activities_survey_question")
      .where("activityId", "=", activityId)
      .where("language", "=", data.lang)
      .execute();

    await db
      .deleteFrom("activities_survey_question")
      .where("activityId", "=", activityId)
      .where("language", "=", data.lang)
      .execute();

    let i = 0;
    for (const survey of data.survey) {
      i++;
      const { insertId } = await db
        .insertInto("activities_survey_question")
        .values({
          activityId: activityId,
          question: survey.question,
          required: data.required ? true : false,
          type: survey.type,
          language: data.lang,
          order: i,
          active: true,
          createdAt: `${new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")}`,
        })
        .executeTakeFirst();

      if (insertId && survey.answers.length) {
        const insertAnswers = survey.answers.map((answer: string, j: number) => ({
          activityId: activityId,
          questionId: insertId,
          answer: answer,
          language: data.lang,
          order: j,
          active: true,
          createdAt: `${new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")}`,
        }));
        await db
          .insertInto("activities_survey_answer")
          .values(insertAnswers)
          .execute();
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
