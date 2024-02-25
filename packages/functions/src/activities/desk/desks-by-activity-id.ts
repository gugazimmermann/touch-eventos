import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesDesk, IActivitiesRegister } from "../../database";
import { error } from "../../error";

export interface Database {
  activities_desk: IActivitiesDesk;
  activities_register: IActivitiesRegister;
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
    const desks = await db
      .selectFrom("activities_desk")
      .leftJoin(
        "activities_register",
        "activities_register.deskId",
        "activities_desk.deskId"
      )
      .select([
        "activities_desk.deskId",
        "activities_desk.user",
        "activities_desk.createdAt",
        "activities_desk.active",
        db.fn.count("activities_register.deskId").as("gifts"),
      ])
      .groupBy("activities_desk.deskId")
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify(desks),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
