import { PreSignUpTriggerHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: PreSignUpTriggerHandler = async (event) => {
  const tableName = process.env.TABLE_NAME;
  console.log("tableName", tableName);
  if (!tableName) return new Error("Internal Server Error");

  console.log("email", event.request.userAttributes?.email);
  if (!event.request.userAttributes.hasOwnProperty("email")) {
    return new Error("Bad Request: Missing User Email");
  }

  const userName = event.userName;
  const email = event.request.userAttributes.email;
  console.log("userName", event.userName);
  console.log("userName", event.request.userAttributes.email);
  try {
    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: tableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email },
    };
    console.log("params", params);
    const results: DynamoDB.DocumentClient.QueryOutput = await dynamoDb
      .query(params)
      .promise();
    console.log("results", results);
    if (results.Items && results.Items.length > 0) {
      return event;
    }
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return new Error("Internal Server Error: DynamoDB operation failed")
  }
  console.log("move on");
  try {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: tableName,
      Item: {
        userId: userName,
        email: event.request.userAttributes.email,
        createdAt: `${Date.now()}`,
        active: 1,
      },
    };
    console.log("params 2", params);
    await dynamoDb.put(params).promise();
    return event;
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return new Error("Internal Server Error: DynamoDB operation failed")
  }
};
