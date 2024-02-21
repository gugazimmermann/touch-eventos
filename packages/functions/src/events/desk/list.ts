import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { QueryCommand, type QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../../aws-clients";
import { error } from "../../../src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const eventsDeskTable = process.env.EVENTS_DESK_TABLE_NAME;
  if (!eventsDeskTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const eventId = event?.pathParameters?.eventId;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");

  try {
    const deskParams: QueryCommandInput = {
      TableName: eventsDeskTable,
      ExpressionAttributeNames: {
        "#eventId": "eventId",
        "#deskId": "deskId",
        "#user": "user",
        "#createdAt": "createdAt",
        "#active": "active",
      },
      ExpressionAttributeValues: { ":eventId": eventId },
      IndexName: "EventIndex",
      KeyConditionExpression: "#eventId = :eventId",
      ProjectionExpression: "#deskId, #user, #createdAt, #active",
    };

    let scanComplete = false;
    const registers: Array<Record<string, any>> = [];

    while (!scanComplete) {
      const deskResults = await dynamoDBClient.send(
        new QueryCommand(deskParams)
      );
      (deskResults?.Items || []).forEach((item) => registers.push(item));
      if (deskResults.LastEvaluatedKey) {
        deskParams.ExclusiveStartKey = deskResults.LastEvaluatedKey;
      } else {
        scanComplete = true;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(registers),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
