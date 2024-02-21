import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { isAfter } from "date-fns";
import { QueryCommand, type QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../../src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const usersSubscriptionTable = process.env.USERS_SUBSCRIPTION_TABLE_NAME;
  if (!usersSubscriptionTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");

  try {
    const usersSubscriptionParams: QueryCommandInput = {
      TableName: usersSubscriptionTable,
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#planId": "planId",
        "#startDate": "startDate",
        "#endDate": "endDate",
      },
      ExpressionAttributeValues: { ":userId": userId },
      IndexName: "UserIndex",
      KeyConditionExpression: "#userId = :userId",
      ProjectionExpression: "#planId, #startDate, #endDate",
      ScanIndexForward: false,
    };
    const usersSubscriptionResults = await dynamoDBClient.send(
      new QueryCommand(usersSubscriptionParams)
    );

    let currentSubscription = null;
    if (usersSubscriptionResults.Items && usersSubscriptionResults.Items.length) {
      const today = new Date();
      for (const subscription of usersSubscriptionResults.Items) {
        const endDate = new Date(parseInt(subscription.endDate, 10));
        if (isAfter(endDate, today)) {
          currentSubscription = subscription;
          break;
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        subscription: currentSubscription,
      }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
