import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDBDocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);

export default dynamoDBDocumentClient;
