import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  UpdateCommand,
  type GetCommandOutput,
  type UpdateCommandInput,
  type UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  if (!activitiesTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const activityResult: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: activitiesTable,
        Key: { activityId },
      })
    );

    const archived = activityResult.Item?.archived ? 0 : 1;

    const params: UpdateCommandInput = {
      TableName: activitiesTable,
      Key: { activityId },
      UpdateExpression: "SET #archived = :archived",
      ExpressionAttributeNames: { "#archived": "archived" },
      ExpressionAttributeValues: { ":archived": archived },
      ReturnValues: "ALL_NEW",
    };
    const results: UpdateCommandOutput = await dynamoDBClient.send(
      new UpdateCommand(params)
    );

    return {
      statusCode: 200,
      body: JSON.stringify(results?.Attributes),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
