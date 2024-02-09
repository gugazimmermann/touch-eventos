import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBCliente } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2 = async () => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");

  try {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: "ActiveIndex",
      KeyConditionExpression: "#active = :active",
      ExpressionAttributeNames: { "#active": "active" },
      ExpressionAttributeValues: { ":active": 1 },
      ScanIndexForward: true,
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
