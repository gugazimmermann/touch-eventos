import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  PutCommand,
  type GetCommandOutput,
  type PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../../aws-clients";
import { error } from "../../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const activitiesDeskTable = process.env.ACTIVITIES_DESK_TABLE_NAME;
  if (!activitiesTable || !activitiesDeskTable)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");
  const data = JSON.parse(event?.body || "");

  try {
    const activitiesResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: activitiesTable,
        Key: { activityId },
      })
    );
    if (!activitiesResults.Item) return error(404, "Not Found: activity not found");

    const activitiesDeskParams: PutCommandInput = {
      TableName: activitiesDeskTable,
      Item: {
        deskId: data.deskId,
        activityId: activityId,
        user: data.user,
        accessCode: data.accessCode,
        createdAt: data.createdAt,
        active: 1,
      },
    };
    await dynamoDBClient.send(new PutCommand(activitiesDeskParams));

    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
