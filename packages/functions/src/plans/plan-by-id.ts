import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const plansTable = process.env.PLANS_TABLE_NAME;
  if (!plansTable) return error(500, "Internal Server Error");
  const planId = event?.pathParameters?.planId;
  if (!planId) return error(400, "Bad Request: Missing Plan Id");

  try {
    const params: GetCommandInput = {
      TableName: plansTable,
      Key: { planId },
    };
    const results: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand(params)
    );
    if (!results.Item) return error(404, "Not Found: Plan not found");
    return {
      statusCode: 200,
      body: JSON.stringify(results.Item),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
