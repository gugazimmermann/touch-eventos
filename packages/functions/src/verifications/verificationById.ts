import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBClient } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  if (!verificationsTable) return error(500, "Internal Server Error");
  const verificationId = event?.pathParameters?.verificationId;
  if (!verificationId)
    return error(400, "Bad Request: Missing Verification Id");

  try {
    const params: GetCommandInput = {
      TableName: verificationsTable,
      Key: { verificationId },
    };
    const results: GetCommandOutput = await dynamoDBClient.send(
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
