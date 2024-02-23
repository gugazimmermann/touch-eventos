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
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const activitiesRegisterTable = process.env.ACTIVITIES_REGISTER_TABLE_NAME;
  const activitiesImagesBucket = process.env.ACTIVITIES_IMAGES_BUCKET;
  if (
    !activitiesTable ||
    !verificationsTable ||
    !activitiesRegisterTable ||
    !activitiesImagesBucket
  )
    return error(500, "Internal Server Error");
  const slug = event?.pathParameters?.slug;
  if (!slug) return error(400, "Bad Request: Missing Activity Slug");

  try {
    const activitiesParams: QueryCommandInput = {
      TableName: activitiesTable,
      ExpressionAttributeNames: {
        "#activityId": "activityId",
        "#active": "active",
        "#payment": "payment",
        "#endDate": "endDate",
        "#startDate": "startDate",
        "#name": "name",
        "#slug": "slug",
        "#logo": "logo",
        "#verificationId": "verificationId",
        "#visitorGift": "visitorGift",
        "#visitorGiftTextPTBR": "visitorGiftTextPTBR",
        "#visitorGiftTextEN": "visitorGiftTextEN",
        "#visitorGiftTextES": "visitorGiftTextES",
        "#raffle": "raffle",
        "#raffleType": "raffleType",
        "#raffleTextPTBR": "raffleTextPTBR",
        "#raffleTextEN": "raffleTextEN",
        "#raffleTextES": "raffleTextES",
      },
      ExpressionAttributeValues: { ":slug": slug },
      IndexName: "SlugIndex",
      KeyConditionExpression: "#slug = :slug",
      ProjectionExpression:
        "#activityId, #active, #payment, #endDate, #startDate, #name, #slug, #logo, #verificationId, #visitorGift, #visitorGiftTextPTBR, #visitorGiftTextEN, #visitorGiftTextES, #raffle, #raffleType, #raffleTextPTBR, #raffleTextEN, #raffleTextES",
    };
    const activitiesResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(activitiesParams)
    );
    if (!activitiesResults?.Items?.length)
      return error(404, "Not Found: activity not found");
    const item = activitiesResults.Items[0];

    if (item.active !== 1 && item.payment) return error(400, "Bad Request: Activity Not Active");

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
          Bucket: activitiesImagesBucket,
          Key: item.image,
        }),
        { expiresIn: 60 * 60 * 24 * 6 }
      );
      item.logo = url;
    }

    const registrationsParams: QueryCommandInput = {
      TableName: activitiesRegisterTable,
      ExpressionAttributeNames: { "#activityId": "activityId" },
      ExpressionAttributeValues: { ":activityId": item.activityId },
      IndexName: "ActivityIndex",
      KeyConditionExpression: "#activityId = :activityId",
      Select: "COUNT",
    };
    const registrationsResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(registrationsParams)
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        activityId: item.activityId,
        active: item.active,
        payment: item?.payment?.status,
        endDate: item.endDate,
        startDate: item.startDate,
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
