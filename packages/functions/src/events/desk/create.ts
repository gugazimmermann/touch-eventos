import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  PutCommand,
  type GetCommandOutput,
  type PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../../aws-clients";
import { error } from "../../../src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const eventsTable = process.env.EVENTS_TABLE_NAME;
  const eventsDeskTable = process.env.EVENTS_DESK_TABLE_NAME;
  if (!eventsTable || !eventsDeskTable)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const eventId = event?.pathParameters?.eventId;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");
  const data = JSON.parse(event?.body || "");

  try {
    const eventsResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: eventsTable,
        Key: { eventId },
      })
    );
    if (!eventsResults.Item) return error(404, "Not Found: Event not found");

    const eventsDeskParams: PutCommandInput = {
      TableName: eventsDeskTable,
      Item: {
        deskId: data.deskId,
        eventId: eventId,
        user: data.user,
        accessCode: data.accessCode,
        createdAt: data.createdAt,
        active: 1,
      },
    };
    await dynamoDBClient.send(new PutCommand(eventsDeskParams));

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
