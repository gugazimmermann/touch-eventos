import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../../aws-clients";
import { error } from "../../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesDeskTable = process.env.ACTIVITIES_DESK_TABLE_NAME;
  const activitiesRegisterTable = process.env.ACTIVITIES_REGISTER_TABLE_NAME;
  if (!activitiesDeskTable || !activitiesRegisterTable)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const deskParams: QueryCommandInput = {
      TableName: activitiesDeskTable,
      ExpressionAttributeNames: {
        "#activityId": "activityId",
        "#deskId": "deskId",
        "#user": "user",
        "#createdAt": "createdAt",
        "#active": "active",
      },
      ExpressionAttributeValues: { ":activityId": activityId },
      IndexName: "ActivityIndex",
      KeyConditionExpression: "#activityId = :activityId",
      ProjectionExpression: "#deskId, #user, #createdAt, #active",
    };

    let scanComplete = false;
    const registers: Array<Record<string, any>> = [];

    while (!scanComplete) {
      const deskResults = await dynamoDBClient.send(
        new QueryCommand(deskParams)
      );
      (deskResults?.Items || []).forEach(async (item) => registers.push(item));
      if (deskResults.LastEvaluatedKey) {
        deskParams.ExclusiveStartKey = deskResults.LastEvaluatedKey;
      } else {
        scanComplete = true;
      }
    }

    for (const register of registers) {
      const registrationsParams: QueryCommandInput = {
        TableName: activitiesRegisterTable,
        ExpressionAttributeNames: { "#deskId": "deskId" },
        ExpressionAttributeValues: { ":deskId": register.deskId },
        IndexName: "DeskIdIndex",
        KeyConditionExpression: "#deskId = :deskId",
        Select: "COUNT",
      };
      const registrationsResults: QueryCommandOutput =
        await dynamoDBClient.send(new QueryCommand(registrationsParams));
      register.gifts = registrationsResults.Count;
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
