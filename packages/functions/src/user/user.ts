import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { error } from "src/error";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");
  
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");

  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: { userId },
  };

  try {
    const results: DynamoDB.DocumentClient.GetItemOutput = await dynamoDb
      .get(params)
      .promise();
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
