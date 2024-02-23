import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  UpdateCommand,
  type GetCommandOutput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../../aws-clients";
import { error } from "../../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesDeskTable = process.env.ACTIVITIES_DESK_TABLE_NAME;
  if (!activitiesDeskTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");
  const deskId = event?.pathParameters?.deskId;
  if (!deskId) return error(400, "Bad Request: Missing Desk Id");

  try {
    const deskResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({ TableName: activitiesDeskTable, Key: { deskId } })
    );
    if (!deskResults?.Item) return error(404, "Not Found: Desk not found");
    const desk = deskResults.Item;

    const params: UpdateCommandInput = {
      TableName: activitiesDeskTable,
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
