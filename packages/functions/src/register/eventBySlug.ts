import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  QueryCommand,
  type GetCommandOutput,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { dynamoDBClient, s3Client } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const eventsTable = process.env.EVENTS_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const eventsRegisterTable = process.env.EVENTS_REGISTER_TABLE_NAME;
  const eventsImagesBucket = process.env.EVENTS_IMAGES_BUCKET;
  if (
    !eventsTable ||
    !verificationsTable ||
    !eventsRegisterTable ||
    !eventsImagesBucket
  )
    return error(500, "Internal Server Error");
  const slug = event?.pathParameters?.slug;
  if (!slug) return error(400, "Bad Request: Missing Event Slug");

  try {
    const eventsParams: QueryCommandInput = {
      TableName: eventsTable,
      ExpressionAttributeNames: { "#slug": "slug" },
      ExpressionAttributeValues: { ":slug": slug },
      IndexName: "SlugIndex",
      KeyConditionExpression: "#slug = :slug",
    };
    const eventsResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(eventsParams)
    );
    if (!eventsResults?.Items?.length) return error(404, "Not Found: Event not found");

    const item = eventsResults.Items[0];

    const verificationsResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: verificationsTable,
        Key: { verificationId: item.verificationId },
      })
    );
    item.verification = verificationsResults.Item;

    if (item.image) {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: eventsImagesBucket,
          Key: item.image,
        }),
        { expiresIn: 60 * 60 * 24 * 6 }
      );
      item.logo = url;
    }

    const registrationsParams: QueryCommandInput = {
      TableName: eventsRegisterTable,
      ExpressionAttributeNames: { "#eventId": "eventId" },
      ExpressionAttributeValues: { ":eventId": item.eventId },
      IndexName: "EventIndex",
      KeyConditionExpression: "#eventId = :eventId",
      Select: "COUNT",
    };
    const registrationsResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(registrationsParams)
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        eventId: item.eventId,
        active: item.active,
        payment: item?.payment?.status,
        endDate: item.endDate,
        startDate: item.startDate,
        dates: item.dates,
        name: item.name,
        slug: item.slug,
        logo: item.logo,
        verification: item.verification.type,
        visitorGift: item.visitorGift,
        visitorGiftTextPTBR: item.visitorGiftTextPTBR,
        visitorGiftTextEN: item.visitorGiftTextEN,
        visitorGiftTextES: item.visitorGiftTextES,
        raffle: item.raffle,
        raffleType: item.raffleType,
        raffleTextPTBR: item.raffleTextPTBR,
        raffleTextEN: item.raffleTextEN,
        raffleTextES: item.raffleTextES,
        registrations: registrationsResults.Count,
      }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
