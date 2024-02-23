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
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesDeskTable = process.env.ACTIVITIES_DESK_TABLE_NAME;
  const activitiesRegisterTable = process.env.ACTIVITIES_REGISTER_TABLE_NAME;
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!activitiesDeskTable || !activitiesRegisterTable || !JWT_SECRET)
    return error(500, "Internal Server Error");
  const activityId = event?.pathParameters?.id;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");
  const data = JSON.parse(event?.body || "");
  if (!data?.token || !data?.hash)
    return error(400, "Bad Request: Missing Data");

  var decodedToken = jwt.verify(data.token, JWT_SECRET) as { id: string };

  try {
    const deskParams: GetCommandInput = {  TableName: activitiesDeskTable, Key: { deskId: decodedToken.id } };
    const deskResults: GetCommandOutput = await dynamoDBClient.send(new GetCommand(deskParams));
    if (!deskResults.Item) return error(401, "Unauthorized");

    const checkRegisterParams: QueryCommandInput = {
      TableName: activitiesRegisterTable,
      ExpressionAttributeNames: {
        "#activityId": "activityId",
        "#registrationId": "registrationId",
        "#confirmed": "confirmed",
        "#gift": "gift",
        "#activityRegisterHash": "activityRegisterHash",
      },
      ExpressionAttributeValues: {
        ":activityRegisterHash": data.hash,
        ":activityId": activityId,
      },
      IndexName: "ActivityRegisterHash",
      KeyConditionExpression: "#activityRegisterHash = :activityRegisterHash",
      FilterExpression: "#activityId = :activityId",
      ProjectionExpression: "#registrationId, #confirmed, #gift, #activityRegisterHash",
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
