import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { Kysely, sql } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesVisitorsDefaultSurvey } from "../../database";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { addDays, isBefore } from "date-fns";
import { dynamoDBClient } from "../../aws-clients";
import { error } from "../../error";

export interface Database {
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

async function getActivityDetails(activitiesTable: string, activityId: string) {
  const activityResults = await dynamoDBClient.send(
    new GetCommand({
      TableName: activitiesTable,
      Key: { activityId },
    })
  );
  return activityResults.Item;
}

async function getSubscriptionEndDate(
  usersSubscriptionTable: string,
  userId: string
) {
  const params = {
    TableName: usersSubscriptionTable,
    ExpressionAttributeNames: { "#userId": "userId", "#endDate": "endDate" },
    ExpressionAttributeValues: { ":userId": userId },
    IndexName: "UserIndex",
    KeyConditionExpression: "#userId = :userId",
    ProjectionExpression: "#endDate",
    ScanIndexForward: false,
  };
  const results = await dynamoDBClient.send(new QueryCommand(params));
  return results?.Items?.[0]?.endDate;
}

function shouldShowData(activityEndDate: string, subscriptionEndDate: string) {
  const viewDataEndDate = addDays(new Date(parseInt(activityEndDate, 10)), 30);
  if (
    subscriptionEndDate &&
    isBefore(new Date(parseInt(subscriptionEndDate, 10)), new Date()) &&
    isBefore(viewDataEndDate, new Date())
  ) {
    return false;
  }
  return !isBefore(viewDataEndDate, new Date());
}


export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const usersSubscriptionTable = process.env.USERS_SUBSCRIPTION_TABLE_NAME;
  if (!activitiesTable || !usersSubscriptionTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const activity = await getActivityDetails(activitiesTable, activityId);
    if (!activity) return error(404, "Not Found: Activity not found");

    const subscriptionEndDate = await getSubscriptionEndDate(
      usersSubscriptionTable,
      String(userId)
    );
    const showData = shouldShowData(activity.endDate, subscriptionEndDate);
    if (!showData) return error(402, "Payment Required");

    const results = await db
      .selectFrom("activities_visitors_default_survey")
      .select([
        "questionId",
        "answerId",
        db.fn.count("answerId").as("totalAnswerId"),
        db.fn.count("custonAnswer").as("totalCustonAnswer"),
      ])
      .where("activityId", "=", activityId)
      .groupBy("questionId")
      .groupBy("answerId")
      .execute();

    const descriptive: Record<number, any> = {};

    for (const question of [4, 5, 7, 11]) {
      descriptive[question] = await db
        .selectFrom("activities_visitors_default_survey")
        .select(({ fn }) => [
          "questionId",
          "answerId",
          "custonAnswer",
          fn.count("custonAnswer").as("totalCustonAnswer"),
        ])
        .where("questionId", "=", question)
        .groupBy(sql.raw("LOWER(custonAnswer)"))
        .orderBy("totalCustonAnswer", "desc")
        .limit(5)
        .execute();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        all: results,
        descriptive,
      }),
    };
  } catch (err) {
    console.error("Error:", err);
    return error(500, "Internal Server Error");
  }
};
