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
  const plansTable = process.env.PLANS_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const eventsRegisterTable = process.env.EVENTS_REGISTER_TABLE_NAME;
  const eventsSurveyTable = process.env.EVENTS_SURVEY_TABLE_NAME;
  const eventsDeskTable = process.env.EVENTS_DESK_TABLE_NAME
  const eventsImagesBucket = process.env.EVENTS_IMAGES_BUCKET;
  if (
    !eventsTable ||
    !plansTable ||
    !verificationsTable ||
    !eventsRegisterTable ||
    !eventsSurveyTable ||
    !eventsDeskTable ||
    !eventsImagesBucket
  )
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const eventId = event?.pathParameters?.eventId;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");

  try {
    const params: QueryCommandInput = {
      TableName: eventsTable,
      ExpressionAttributeNames: { "#userId": "userId", "#eventId": "eventId" },
      ExpressionAttributeValues: { ":userId": userId, ":eventId": eventId },
      IndexName: "UserIdEndDateIndex",
      KeyConditionExpression: "#userId = :userId",
      FilterExpression: "#eventId = :eventId",
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    if (!results.Items?.length) return error(404, "Not Found: Event not found");
    const item = results.Items[0];

    const plansParams: GetCommandInput = {
      TableName: plansTable,
      Key: { planId: item.planId },
    };

    const verificationsParams: GetCommandInput = {
      TableName: verificationsTable,
      Key: { verificationId: item.verificationId },
    };

    const surveysParams: QueryCommandInput = {
      TableName: eventsSurveyTable,
      ExpressionAttributeNames: {
        "#surveyId": "surveyId",
        "#eventId": "eventId",
        "#language": "language",
      },
      ExpressionAttributeValues: { ":eventId": item.eventId },
      IndexName: "EventIndex",
      KeyConditionExpression: "#eventId = :eventId",
      ProjectionExpression: "#surveyId, #eventId, #language",
    };

    const deskParams: QueryCommandInput = {
      TableName: eventsDeskTable,
      ExpressionAttributeNames: { "#eventId": "eventId", "#active": "active" },
      ExpressionAttributeValues: { ":eventId": item.eventId, ":active": 1 },
      IndexName: "EventIndex",
      KeyConditionExpression: "#eventId = :eventId",
      FilterExpression: "#active = :active",
      Select: "COUNT",
    };

    const [plansResults, verificationsResults, surveysResults, deskResults]: [
      GetCommandOutput,
      GetCommandOutput,
      QueryCommandOutput,
      QueryCommandOutput
    ] = await Promise.all([
      await dynamoDBClient.send(new GetCommand(plansParams)),
      await dynamoDBClient.send(new GetCommand(verificationsParams)),
      await dynamoDBClient.send(new QueryCommand(surveysParams) ),
      await dynamoDBClient.send(new QueryCommand(deskParams))
    ]);
    item.plan = plansResults.Item;
    item.verification = verificationsResults.Item;
    item.surveys = surveysResults.Items || [];
    item.desk = deskResults.Count;

    const registrationsParams: QueryCommandInput = {
      TableName: eventsRegisterTable,
      ExpressionAttributeNames: {
        "#registrationId": "registrationId",
        "#eventId": "eventId",
        "#confirmed": "confirmed",
      },
      ExpressionAttributeValues: { ":eventId": item.eventId },
      IndexName: "EventIndex",
      KeyConditionExpression: "#eventId = :eventId",
      ProjectionExpression: "#registrationId, #eventId, #confirmed",
    };
    let registrationsScanComplete = false;
    let registrations = 0;
    let registersConfirmed = 0;
    while (!registrationsScanComplete) {
      const registrationsResults = await dynamoDBClient.send(
        new QueryCommand(registrationsParams)
      );
      registrations += registrationsResults?.Items?.length || 0;
      (registrationsResults?.Items || []).forEach((item) => {
        if (item.confirmed && item.confirmed !== "") registersConfirmed++;
      });
      if (registrationsResults.LastEvaluatedKey) {
        registrationsParams.ExclusiveStartKey =
          registrationsResults.LastEvaluatedKey;
      } else {
        registrationsScanComplete = true;
      }
    }
    item.registers = registrations;
    item.registersConfirmed = registersConfirmed;

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

    const { payment, ...itemRest } = item;
    return {
      statusCode: 200,
      body: JSON.stringify({ ...itemRest, payment: payment?.status }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
