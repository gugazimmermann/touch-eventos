import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const paymentsTable = process.env.PAYMENTS_TABLE_NAME;
  if (!paymentsTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");

  try {
    const params: QueryCommandInput = {
      TableName: paymentsTable,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
      ScanIndexForward: false,
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    return {
      statusCode: 200,
      body: JSON.stringify(results.Items),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
