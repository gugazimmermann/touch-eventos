import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const eventsTable = process.env.EVENTS_TABLE_NAME;
  const eventsRegisterTable = process.env.EVENTS_REGISTER_TABLE_NAME;
  if (!eventsTable || !eventsRegisterTable)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const eventId = event?.pathParameters?.eventId;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");

  try {
    const params: QueryCommandInput = {
      TableName: eventsTable,
      ExpressionAttributeNames: { "#userId": "userId", "#eventId": "eventId" },
      ExpressionAttributeValues: { ":userId": userId, ":eventId": eventId },
      IndexName: "UserIdEndDateIndex",
      KeyConditionExpression: "#userId = :userId",
      FilterExpression: "#eventId = :eventId",
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    if (!results.Items?.length) return error(404, "Not Found: Event not found");

    const item: {
      eventId: string;
      name: string;
      registers: Array<Record<string, any>>;
    } = {
      eventId: eventId,
      name: results.Items[0].name,
      registers: [],
    };

    const registrationsParams: QueryCommandInput = {
      TableName: eventsRegisterTable,
      ExpressionAttributeNames: { "#eventId": "eventId" },
      ExpressionAttributeValues: { ":eventId": eventId },
      IndexName: "EventIndex",
      KeyConditionExpression: "#eventId = :eventId",
    };

    let registrationsScanComplete = false;
    const registers: Array<Record<string, any>> = [];
    while (!registrationsScanComplete) {
      const registrationsResults = await dynamoDBClient.send(
        new QueryCommand(registrationsParams)
      );
      (registrationsResults?.Items || []).forEach((item) => {
        registers.push(item);
      });
      if (registrationsResults.LastEvaluatedKey) {
        registrationsParams.ExclusiveStartKey =
          registrationsResults.LastEvaluatedKey;
      } else {
        registrationsScanComplete = true;
      }
    }
    item.registers = registers;
    
    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
