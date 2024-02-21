import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  QueryCommand,
  GetCommand,
  type QueryCommandInput,
  type QueryCommandOutput,
  type GetCommandInput,
  type GetCommandOutput,
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
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");

  const archived = event?.pathParameters?.archived ? 1 : 0;
  let filter = "attribute_not_exists(#archived) or #archived = :archived";
  if (archived) filter = "#archived = :archived";

  try {
    const params: QueryCommandInput = {
      TableName: eventsTable,
      ExpressionAttributeNames: {
        "#userId": "userId",
        "#eventId": "eventId",
        "#image": "image",
        "#name": "name",
        "#startDate": "startDate",
        "#endDate": "endDate",
        "#city": "city",
        "#state": "state",
        "#verificationId": "verificationId",
        "#active": "active",
        "#payment": "payment",
        "#archived": "archived",
      },
      ExpressionAttributeValues: { ":userId": userId, ":archived": archived },
      IndexName: "UserIdEndDateIndex",
      KeyConditionExpression: "#userId = :userId",
      ProjectionExpression:
        "#eventId, #image, #name, #startDate, #endDate, #city, #state, #verificationId, #payment, #active",
      FilterExpression: filter,
      ScanIndexForward: false,
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );

    const userEvents = [];
    if (results.Items) {
      for (const item of results.Items) {
        const verificationsParams: GetCommandInput = {
          TableName: verificationsTable,
          Key: { verificationId: item.verificationId },
        };
        const verificationsResults: GetCommandOutput =
          await dynamoDBClient.send(new GetCommand(verificationsParams));
        item.verificationType = verificationsResults?.Item?.type;

        let url = "";
        if (item.image) {
          url = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
              Bucket: eventsImagesBucket,
              Key: item.image,
            }),
            { expiresIn: 60 * 60 * 24 * 6 }
          );
        }

        const registrationsParams: QueryCommandInput = {
          TableName: eventsRegisterTable,
          ExpressionAttributeNames: { "#eventId": "eventId" },
          ExpressionAttributeValues: { ":eventId": item.eventId },
          IndexName: "EventIndex",
          KeyConditionExpression: "#eventId = :eventId",
          Select: "COUNT",
        };
        const registrationsResults: QueryCommandOutput =
          await dynamoDBClient.send(new QueryCommand(registrationsParams));

        const { payment, ...itemRest } = item;
        userEvents.push({
          ...itemRest,
          payment: payment?.status,
          visitors: registrationsResults.Count,
          logo: url,
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(userEvents),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
