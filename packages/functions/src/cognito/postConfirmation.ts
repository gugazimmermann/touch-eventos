import { PreSignUpTriggerHandler } from "aws-lambda";
import {
  QueryCommand,
  PutCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  type PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";

export const handler: PreSignUpTriggerHandler = async (event) => {
  const usersTable = process.env.USERS_TABLE_NAME;
  if (!usersTable) return new Error("Internal Server Error");
  if (!event.request.userAttributes.hasOwnProperty("email")) {
    return new Error("Bad Request: Missing User Email");
  }

  const userName = event.userName;
  const email = event.request.userAttributes.email;

  try {
    const params: QueryCommandInput = {
      TableName: usersTable,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    if (results.Items && results.Items.length > 0) return event;
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return new Error("Internal Server Error: DynamoDB operation failed");
  }

  try {
    const params: PutCommandInput = {
      TableName: usersTable,
      Item: {
        userId: userName,
        email: event.request.userAttributes.email,
        createdAt: `${Date.now()}`,
        active: 1,
      },
    };
    await dynamoDBClient.send(new PutCommand(params));
    return event;
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return new Error("Internal Server Error: DynamoDB operation failed");
  }
};
