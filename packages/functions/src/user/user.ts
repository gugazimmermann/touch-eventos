import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBCliente } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");

  try {
    const params: GetCommandInput = {
      TableName: tableName,
      Key: { userId },
    };
    const results: GetCommandOutput = await dynamoDBCliente.send(
      new GetCommand(params)
    );
    if (!results.Item) return error(404, "Not Found: Plan User found");
    return {
      statusCode: 200,
      body: JSON.stringify(results.Item),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
