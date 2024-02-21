import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import {
  QueryCommand,
  GetCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../../src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const eventsDeskTable = process.env.EVENTS_DESK_TABLE_NAME;
  const eventsRegisterTable = process.env.EVENTS_REGISTER_TABLE_NAME;
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!eventsDeskTable || !eventsRegisterTable || !JWT_SECRET)
    return error(500, "Internal Server Error");
  const eventId = event?.pathParameters?.id;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");
  const data = JSON.parse(event?.body || "");
  if (!data?.token || !data?.hash)
    return error(400, "Bad Request: Missing Data");

  var decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  try {
    const deskParams: GetCommandInput = {  TableName: eventsDeskTable, Key: { deskId: decodedToken.id } };
    const deskResults: GetCommandOutput = await dynamoDBClient.send(new GetCommand(deskParams));
    if (!deskResults.Item) return error(401, "Unauthorized");

    const checkRegisterParams: QueryCommandInput = {
      TableName: eventsRegisterTable,
      ExpressionAttributeNames: {
        "#eventId": "eventId",
        "#registrationId": "registrationId",
        "#confirmed": "confirmed",
        "#gift": "gift",
        "#eventRegisterHash": "eventRegisterHash",
      },
      ExpressionAttributeValues: {
        ":eventRegisterHash": data.hash,
        ":eventId": eventId,
      },
      IndexName: "eventRegisterHash",
      KeyConditionExpression: "#eventRegisterHash = :eventRegisterHash",
      FilterExpression: "#eventId = :eventId",
      ProjectionExpression: "#registrationId, #confirmed, #gift, #eventRegisterHash",
    };
    const checkRegisterResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(checkRegisterParams)
    );
    if (!checkRegisterResults?.Items?.length) return error(404, "Not Found: Register Not Found");
    return {
      statusCode: 200,
      body: JSON.stringify({ register: checkRegisterResults.Items[0] }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
