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
  if (!userId) return error(400, "Bad Request: Missing User Id");

  const archived = event?.pathParameters?.archived ? 1 : 0;
  let filter = "attribute_not_exists(#archived) or #archived = :archived";
  if (archived) filter = "#archived = :archived";

  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: tableName,
    ExpressionAttributeNames: {
      "#userId": "userId",
      "#eventId": "eventId",
      "#name": "name",
      "#startDate": "startDate",
      "#endDate": "endDate",
      "#city": "city",
      "#state": "state",
      "#verificationType": "verificationType",
      "#active": "active",
      "#archived": "archived",
    },
    ExpressionAttributeValues: { ":userId": userId, ":archived": archived },
    IndexName: "UserIdEndDateIndex",
    KeyConditionExpression: "#userId = :userId",
    ProjectionExpression:
      "#eventId, #name, #startDate, #endDate, #city, #state, #verificationType, #active",
    FilterExpression: filter,
    ScanIndexForward: false,
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
