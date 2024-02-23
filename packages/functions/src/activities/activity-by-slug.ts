import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  if (!activitiesTable) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const slug = event?.pathParameters?.slug;
  if (!slug) return error(400, "Missing Data: Missing Slug");

  try {
    const params: QueryCommandInput = {
      TableName: activitiesTable,
      ExpressionAttributeNames: { "#slug": "slug" },
      ExpressionAttributeValues: { ":slug": slug },
      IndexName: "SlugIndex",
      KeyConditionExpression: "#slug = :slug",
      Select: "COUNT",
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ available: results.Count === 0 }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
