import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  GetCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBCliente } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const tableName = process.env.TABLE_NAME;
  const plansTableName = process.env.PLANS_TABLE_NAME;
  const verificationsTableName = process.env.VERIFICATIONS_TABLE_NAME;
  if (!tableName || !plansTableName || !verificationsTableName)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const eventId = event?.pathParameters?.id;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");

  try {
    const params: QueryCommandInput = {
      TableName: tableName,
      ExpressionAttributeNames: { "#userId": "userId", "#eventId": "eventId" },
      ExpressionAttributeValues: { ":userId": userId, ":eventId": eventId },
      IndexName: "UserIdEndDateIndex",
      KeyConditionExpression: "#userId = :userId",
      FilterExpression: "#eventId = :eventId",
    };
    const results: QueryCommandOutput = await dynamoDBCliente.send(
      new QueryCommand(params)
    );
    if (!results.Items?.length) return error(404, "Not Found: Event not found");
    const item = results.Items[0];
   
    const plansParams: GetCommandInput = {
      TableName: plansTableName,
      Key: { planId: item.planId },
    };
    const verificationsParams: GetCommandInput = {
      TableName: verificationsTableName,
      Key: { verificationId: item.verificationId },
    };
    const [plansResults, verificationsResults]: [
      GetCommandOutput,
      GetCommandOutput
    ] = await Promise.all([
      await dynamoDBCliente.send(new GetCommand(plansParams)),
      await dynamoDBCliente.send(new GetCommand(verificationsParams)),
    ]);
    item.plan = plansResults.Item;
    item.verification = verificationsResults.Item;
    
    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
