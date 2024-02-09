import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDBClient = new DynamoDBClient();
const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export default dynamoDBDocumentClient;
