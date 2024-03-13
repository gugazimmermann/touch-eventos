import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { addMonths, getTime, isAfter } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  type PutCommandInput,
  type GetCommandInput,
  type GetCommandOutput,
  type QueryCommandInput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const paymentsTable = process.env.PAYMENTS_TABLE_NAME;
  if (!activitiesTable || !paymentsTable)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");
  const data = JSON.parse(event?.body || "");
  if (!data?.payment) return error(400, "Bad Request: Missing Payment");

  try {
    const activityResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: activitiesTable,
        Key: { activityId },
      })
    );
    const activity = activityResults.Item;
    if (!activity) return error(404, "Not Found: Activity not found");

    const paymentParams: PutCommandInput = {
      TableName: paymentsTable,
      Item: {...data.payment, userId},
    };
    await dynamoDBClient.send(new PutCommand(paymentParams));

    const updateActivityParams: UpdateCommandInput = {
      TableName: activitiesTable,
      Key: { activityId: activityId },
      UpdateExpression: "SET #payment = :payment, #active = :active",
      ExpressionAttributeNames: { "#payment": "payment", "#active": "active" },
      ExpressionAttributeValues: {
        ":payment": data.payment,
        ":active": data.active,
      },
      ReturnValues: "ALL_NEW",
    };
    await dynamoDBClient.send(new UpdateCommand(updateActivityParams));

    return {
      statusCode: 200,
      body: JSON.stringify({ created: true }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
