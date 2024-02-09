import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBCliente } from "../aws-clients";

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

  try {
    const params: QueryCommandInput = {
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
