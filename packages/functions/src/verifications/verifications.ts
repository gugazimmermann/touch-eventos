import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  if (!verificationsTable) return error(500, "Internal Server Error");

  try {
    const params: QueryCommandInput = {
      TableName: verificationsTable,
      IndexName: "ActiveIndex",
      KeyConditionExpression: "#active = :active",
      ExpressionAttributeNames: { "#active": "active" },
      ExpressionAttributeValues: { ":active": 1 },
      ScanIndexForward: true,
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
