import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { getTime } from "date-fns";
import {
  UpdateCommand,
  GetCommand,
  type UpdateCommandInput,
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
  if (!data?.token || !data?.registrationId)
    return error(400, "Bad Request: Missing Data");

  var decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  try {
    const deskParams: GetCommandInput = {  TableName: eventsDeskTable, Key: { deskId: decodedToken.id } };
    const deskResults: GetCommandOutput = await dynamoDBClient.send(new GetCommand(deskParams));
    if (!deskResults.Item) return error(401, "Unauthorized");

    const checkRegisterParams: GetCommandInput = {  TableName: eventsRegisterTable, Key: { registrationId: data.registrationId } };
    const checkRegisterResults: GetCommandOutput = await dynamoDBClient.send(new GetCommand(checkRegisterParams));
    if (!checkRegisterResults.Item) return error(404, "Not Found: Register Not Found");

    if (!checkRegisterResults.Item?.confirmed) return error(400, "Bad Request: Visistor Not Confirmed");
    if (checkRegisterResults.Item?.gift) return error(400, "Bad Request: Gift Already Delivered");

    const registerUpdateParams: UpdateCommandInput = {
      TableName: eventsRegisterTable,
      Key: { registrationId: data.registrationId },
      UpdateExpression: "SET #gift = :gift, #deskId = :deskId",
      ExpressionAttributeNames: {
        "#gift": "gift",
        "#deskId": "deskId",
      },
      ExpressionAttributeValues: {
        ":gift": `${getTime(new Date())}`,
        ":deskId": deskResults.Item.deskId,
      },
      ReturnValues: "ALL_NEW",
    };
    await dynamoDBClient.send(new UpdateCommand(registerUpdateParams));

    return {
      statusCode: 200,
      body: JSON.stringify({ delivered: true }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
