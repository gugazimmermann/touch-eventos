import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { error } from "src/error";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");

  const verificationId = event?.pathParameters?.id;
  if (!verificationId) return error(400, "Bad Request: Missing Verification Id");

  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: { verificationId },
  };

  try {
    const results: DynamoDB.DocumentClient.GetItemOutput = await dynamoDb
      .get(params)
      .promise();
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
