import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { error } from "src/error";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const tableName = process.env.TABLE_NAME;
  const plansTableName = process.env.PLANS_TABLE_NAME;
  const verificationsTableName = process.env.VERIFICATIONS_TABLE_NAME;
  if (!tableName || !plansTableName || !verificationsTableName)
    return error(500, "Internal Server Error");

  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");

  const eventId = event?.pathParameters?.id;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");

  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: tableName,
    ExpressionAttributeNames: { "#userId": "userId", "#eventId": "eventId" },
    ExpressionAttributeValues: { ":userId": userId, ":eventId": eventId },
    IndexName: "UserIdEndDateIndex",
    KeyConditionExpression: "#userId = :userId",
    FilterExpression: "#eventId = :eventId",
  };

  try {
    const results: DynamoDB.DocumentClient.QueryOutput = await dynamoDb
      .query(params)
      .promise();

    if (!results.Items?.length) return error(404, "Not Found: Event not found");
    const item = results.Items[0];

    const plansParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: plansTableName,
      Key: { planId: item.planId },
    };
    const verificationsParams: DynamoDB.DocumentClient.GetItemInput = {
      TableName: verificationsTableName,
      Key: { verificationId: item.verificationId },
    };
    
    const [plansResults, verificationsResults]: [
      DynamoDB.DocumentClient.GetItemOutput,
      DynamoDB.DocumentClient.GetItemOutput
    ] = await Promise.all([
      await dynamoDb.get(plansParams).promise(),
      await dynamoDb.get(verificationsParams).promise(),
    ]);

    item.plan = plansResults.Item;
    item.verification = verificationsResults.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
