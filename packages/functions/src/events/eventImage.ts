import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  UpdateCommand,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { dynamoDBClient, s3Client } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const eventsTable = process.env.EVENTS_TABLE_NAME;
  const eventsImagesBucket = process.env.EVENTS_IMAGES_BUCKET;
  if (!eventsTable || !eventsImagesBucket)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const eventId = event?.pathParameters?.eventId;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");
  const data = JSON.parse(event?.body || "");
  if (!data?.logo) return error(400, "Bad Request: Missing Data");

  const matches = data.logo.match(/^data:(image\/\w+);base64,/);
  if (!matches || matches.length !== 2)
    return error(400, "Bad Request: Invalid Image Data");

  const filePath = `logos/${userId}/${eventId}.${
    matches[1].split("/")[1]
  }`;
  const buffer = Buffer.from(
    data.logo.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: eventsImagesBucket,
        Key: filePath,
        Body: buffer,
        ContentType: matches[1],
      })
    );

    const params: UpdateCommandInput = {
      TableName: eventsTable,
      Key: { eventId: eventId },
      UpdateExpression: "SET #image = :image",
      ExpressionAttributeNames: { "#image": "image" },
      ExpressionAttributeValues: { ":image": filePath },
      ReturnValues: "ALL_NEW",
    };
    await dynamoDBClient.send(new UpdateCommand(params));
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: eventsImagesBucket,
        Key: filePath,
      }),
      { expiresIn: 60 * 60 * 24 * 6 }
    );
    return {
      statusCode: 200,
      body: JSON.stringify(url),
    };
  } catch (err) {
    console.error("S3 Error:", err);
    return error(500, "Internal Server Error: S3 operation failed");
  }
};
