import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBClient } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const usersTable = process.env.USERS_TABLE_NAME;
  if (!usersTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");

  try {
    const params: GetCommandInput = {
      TableName: usersTable,
      Key: { userId },
    };
    const results: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand(params)
    );
    if (!results.Item) return error(404, "Not Found: User not found");
    return {
      statusCode: 200,
      body: JSON.stringify(results.Item),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
