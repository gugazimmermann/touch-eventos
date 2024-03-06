import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import * as jwt from "jsonwebtoken";
import {
  IActivitiesRegister,
  IActivitiesVisitors,
  IActivitiesVisitorsSurvey,
} from "../database";
import { error } from "../error";

export interface Database {
  activities_register: IActivitiesRegister;
  activities_visitors: IActivitiesVisitors;
  activities_visitors_survey: IActivitiesVisitorsSurvey;
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
  if (!data?.activityId) return error(400, "Bad Request: Missing Activity ID");
  if (!data?.visitorID) return error(400, "Bad Request: Missing visitor ID");
  if (!data?.token) return error(400, "Bad Request: Missing Token");
  const decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  try {
    const registrationsResults = await db
      .selectFrom("activities_register")
      .select(["registrationId"])
      .where("registrationId", "=", decodedToken.id)
      .executeTakeFirst();
    if (!registrationsResults) return error(401, "Unauthorized");

    const visitorsResults = await db
      .selectFrom("activities_visitors")
      .select(["visitorId"])
      .where("visitorId", "=", data.visitorID)
      .executeTakeFirst();
    if (!visitorsResults) return error(401, "Unauthorized");

    // see if already have answer
    const answersResults = await db
      .selectFrom("activities_visitors_survey")
      .select(["visitorId"])
      .where("visitorId", "=", data.visitorID)
      .executeTakeFirst();

    if (!answersResults) {
      const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      if (data?.answers && data.answers.length) {
        const insertAnswers = data.answers.map(
          (answer: { questionId: number; answer: string | number }) => ({
            visitorId: Number(data.visitorID),
            activityId: data.activityId,
            registrationId: decodedToken.id,
            questionId: Number(answer.questionId),
            answerId: typeof answer.answer === "number" ? answer.answer : null,
            custonAnswer:
              typeof answer.answer === "string" ? answer.answer : null,
            createdAt: createdAt,
          })
        );
        await db
          .insertInto("activities_visitors_survey")
          .values(insertAnswers)
          .execute();
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ visitorID: Number(data.visitorID) }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
