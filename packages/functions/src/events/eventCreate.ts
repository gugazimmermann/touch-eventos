import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { PutCommand, type PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { dynamoDBCliente } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const data = JSON.parse(event?.body || "");
  if (!data?.userId) return error(401, "Unauthorized");
  if (userId !== data.userId) return error(400, "Bad Request: Wrong User Id");

  try {
    const params: PutCommandInput = {
      TableName: tableName,
      Item: data,
    };
    await dynamoDBCliente.send(new PutCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
