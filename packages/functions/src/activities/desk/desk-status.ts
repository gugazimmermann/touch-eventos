import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesDesk } from "../../database";
import { error } from "../../error";

export interface Database {
  activities_desk: IActivitiesDesk;
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
  const deskId = event?.pathParameters?.deskId;
  if (!deskId) return error(400, "Bad Request: Missing Desk Id");

  try {
    const currentDesk = await db
      .selectFrom("activities_desk")
      .select(["active"])
      .where("deskId", "=", deskId)
      .executeTakeFirst();

    if (!currentDesk) return error(404, "Not Found: Desk not found");

    await db
      .updateTable("activities_desk")
      .set({ active: !currentDesk.active })
      .where("deskId", "=", deskId)
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
