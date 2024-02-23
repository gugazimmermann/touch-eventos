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
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const activitiesRegisterTable = process.env.ACTIVITIES_REGISTER_TABLE_NAME;
  if (!activitiesTable || !activitiesRegisterTable)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const params: QueryCommandInput = {
      TableName: activitiesTable,
      ExpressionAttributeNames: { "#userId": "userId", "#activityId": "activityId" },
      ExpressionAttributeValues: { ":userId": userId, ":activityId": activityId },
      IndexName: "UserIdEndDateIndex",
      KeyConditionExpression: "#userId = :userId",
      FilterExpression: "#activityId = :activityId",
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    if (!results.Items?.length) return error(404, "Not Found: activity not found");

    const item: {
      activityId: string;
      name: string;
      registers: Array<Record<string, any>>;
    } = {
      activityId: activityId,
      name: results.Items[0].name,
      registers: [],
    };

    const registrationsParams: QueryCommandInput = {
      TableName: activitiesRegisterTable,
      ExpressionAttributeNames: { "#activityId": "activityId" },
      ExpressionAttributeValues: { ":activityId": activityId },
      IndexName: "ActivityIndex",
      KeyConditionExpression: "#activityId = :activityId",
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
