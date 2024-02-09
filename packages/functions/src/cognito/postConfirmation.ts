import { PreSignUpTriggerHandler } from "aws-lambda";
import {
  QueryCommand,
  PutCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  type PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBCliente } from "../aws-clients";

export const handler: PreSignUpTriggerHandler = async (event) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return new Error("Internal Server Error");
  if (!event.request.userAttributes.hasOwnProperty("email")) {
    return new Error("Bad Request: Missing User Email");
  }

  const userName = event.userName;
  const email = event.request.userAttributes.email;

  try {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };
    const results: QueryCommandOutput = await dynamoDBCliente.send(
      new QueryCommand(params)
    );
    if (results.Items && results.Items.length > 0) return event;
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return new Error("Internal Server Error: DynamoDB operation failed");
  }

  try {
    const params: PutCommandInput = {
      TableName: tableName,
      Item: {
        userId: userName,
        email: event.request.userAttributes.email,
        createdAt: `${Date.now()}`,
        active: 1,
      },
    };
    await dynamoDBCliente.send(new PutCommand(params));
    return event;
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return new Error("Internal Server Error: DynamoDB operation failed");
  }
};
