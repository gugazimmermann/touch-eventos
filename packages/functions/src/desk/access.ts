import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesDeskTable = process.env.ACTIVITIES_DESK_TABLE_NAME;
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!activitiesDeskTable || !JWT_SECRET)
    return error(500, "Internal Server Error");

  const activityId = event?.pathParameters?.id;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  const data = JSON.parse(event?.body || "");
  if (!data?.username || !data?.accessCode)
    return error(400, "Bad Request: Missing Data");

  try {
    const deskParams: QueryCommandInput = {
      TableName: activitiesDeskTable,
      ExpressionAttributeNames: {
        "#deskId": "deskId",
        "#user": "user",
        "#accessCode": "accessCode",
        "#active": "active",
      },
      ExpressionAttributeValues: { ":user": data.username },
      IndexName: "UserIndex",
      KeyConditionExpression: "#user = :user",
      ProjectionExpression: "#deskId, #user, #accessCode, #active",
    };
    const deskResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(deskParams)
    );
    if (!deskResults.Items?.length)
      return error(404, "Not Found: User not found");
    const item = deskResults.Items[0];

    if (item.accessCode !== data.accessCode)
      return error(401, "Unauthorized: Wrong Access Code");
    if (item.active !== 1) return error(401, "Unauthorized: User Inactive");
    const token = jwt.sign({ id: item.deskId }, JWT_SECRET, {
      expiresIn: 86400, // expires in 1 day
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
