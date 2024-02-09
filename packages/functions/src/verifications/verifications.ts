import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { error } from "src/error";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async () => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");

  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: "ActiveIndex",
    KeyConditionExpression: "#active = :active",
    ExpressionAttributeNames: { "#active": "active" },
    ExpressionAttributeValues: { ":active": 1 },
    ScanIndexForward: true,
  };

  try {
    const results: DynamoDB.DocumentClient.QueryOutput = await dynamoDb
      .query(params)
      .promise();
    return {
      statusCode: 200,
      body: JSON.stringify(results.Items),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
