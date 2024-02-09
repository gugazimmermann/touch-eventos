import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBCliente } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");

  try {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
      ScanIndexForward: false,
    };
    const results: QueryCommandOutput = await dynamoDBCliente.send(
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
