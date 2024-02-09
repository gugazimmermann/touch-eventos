import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBCliente } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");
  const verificationId = event?.pathParameters?.id;
  if (!verificationId)
    return error(400, "Bad Request: Missing Verification Id");

  try {
    const params: GetCommandInput = {
      TableName: tableName,
      Key: { verificationId },
    };
    const results: GetCommandOutput = await dynamoDBCliente.send(
      new GetCommand(params)
    );
    if (!results.Item) return error(404, "Not Found: Verification not found");
    return {
      statusCode: 200,
      body: JSON.stringify(results.Item),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
