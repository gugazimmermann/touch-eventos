import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import * as jwt from "jsonwebtoken";
import {
  IActivitiesRegister,
  IActivitiesVisitors,
  IActivitiesVisitorsDefaultSurvey,
} from "../database";
import { error } from "../error";

export interface Database {
  activities_register: IActivitiesRegister;
  activities_visitors: IActivitiesVisitors;
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
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) return error(500, "Internal Server Error");

  const slug = event?.pathParameters?.slug;
  if (!slug) return error(400, "Bad Request: Missing Activity Slug");

  const data = JSON.parse(event?.body || "");
  if (!data?.activityId) return error(400, "Bad Request: Missing Activity ID");
  if (!data?.privacity)
    return error(400, "Bad Request: Missing Pricity Accepted");
  if (!data?.token) return error(400, "Bad Request: Missing Token");
  const decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  try {
    const registrationsResults = await db
      .selectFrom("activities_register")
      .select(["registrationId"])
      .where("registrationId", "=", decodedToken.id)
      .executeTakeFirst();
    if (!registrationsResults) return error(401, "Unauthorized");

    // verifify visitor exists
    let visitorId: number | null = null;
    const visitorsResults = await db
      .selectFrom("activities_visitors")
      .select(["visitorId", "email"])
      .where("email", "=", data.answers?.[1]?.answer || "")
      .executeTakeFirst();

    if (visitorsResults) {
      visitorId = Number(visitorsResults.visitorId);
    } else {
      // if not, create a new
      const newVisitor = await db
        .insertInto("activities_visitors")
        .values({
          name: data.answers?.[0]?.answer || "",
          email: data.answers?.[1]?.answer || "",
          phone: data.answers?.[2]?.answer || "",
          state: data.answers?.[3]?.answer || "",
          city: data.answers?.[4]?.answer || "",
          createdAt: data.privacity,
        })
        .executeTakeFirst();
      visitorId = Number(newVisitor.insertId);
    }

    // verifify anwser
    const visitorsDefaultSurveyResults = await db
      .selectFrom("activities_visitors_default_survey")
      .select(["visitorAnswerId", "visitorId", "activityId"])
      .where("visitorId", "=", visitorId)
      .where("activityId", "=", data.activityId)
      .executeTakeFirst();

    if (!visitorsDefaultSurveyResults) {
      const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      if (data?.answers && data.answers.length) {
        const insertAnswers = data.answers.map(
          (answer: { questionId: number; answer: string | number }) => ({
            visitorId: Number(visitorId),
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
          .insertInto("activities_visitors_default_survey")
          .values(insertAnswers)
          .execute();
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ visitorID: Number(visitorId) }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
