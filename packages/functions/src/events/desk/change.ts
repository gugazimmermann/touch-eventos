import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  UpdateCommand,
  type GetCommandOutput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
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
  const deskId = event?.pathParameters?.deskId;
  if (!deskId) return error(400, "Bad Request: Missing Desk Id");

  try {
    const deskResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({ TableName: eventsDeskTable, Key: { deskId } })
    );
    if (!deskResults?.Item) return error(404, "Not Found: Desk not found");
    const desk = deskResults.Item;

    const params: UpdateCommandInput = {
      TableName: eventsDeskTable,
      Key: { deskId },
      UpdateExpression: "SET #active = :active",
      ExpressionAttributeNames: { "#active": "active" },
      ExpressionAttributeValues: { ":active": desk.active === 1 ? 0 : 1 },
      ReturnValues: "ALL_NEW",
    };
    await dynamoDBClient.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
