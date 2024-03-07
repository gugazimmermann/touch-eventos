import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
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

  const limit = parseInt(event?.pathParameters?.limit || "50", 10);
  const offset = parseInt(event?.pathParameters?.offset || "0", 10);

  try {
    const results = await db
      .selectFrom("activities_register as ar")
      .select(["ar.createdAt as Cadastro"])
      .leftJoin("activities_visitors as av", "av.phone", "ar.phone")
      .select(["av.name as Nome", "av.email as Email", "av.phone as Telefone", "av.city as Cidade", "av.state as Estado"])
      .innerJoin("activities_visitors_default_survey as ds", (join) =>
        join
          .onRef("ds.visitorId", "=", "av.visitorId")
          .on("ds.questionId", "=", 6)
      )
      .leftJoin(
        "activities_survey_default_answer as da",
        "da.answerId",
        "ds.answerId"
      )
      .select(["da.answer as Gênero"])
      .innerJoin("activities_visitors_default_survey as ds2", (join) =>
        join
          .onRef("ds2.visitorId", "=", "av.visitorId")
          .on("ds2.questionId", "=", 7)
      )
      .select(["ds2.custonAnswer as Gênero - Outros"])
      .innerJoin("activities_visitors_default_survey as ds3", (join) =>
        join
          .onRef("ds3.visitorId", "=", "av.visitorId")
          .on("ds3.questionId", "=", 8)
      )
      .leftJoin(
        "activities_survey_default_answer as da3",
        "da3.answerId",
        "ds3.answerId"
      )
      .select(["da3.answer as Faixa Etária"])
      .where("av.name", 'is not', null)
      .where("ar.activityId", "=", activityId)
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error("Error:", err);
    return error(500, "Internal Server Error");
  }
};
