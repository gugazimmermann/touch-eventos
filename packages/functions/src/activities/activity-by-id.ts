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
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const plansTable = process.env.PLANS_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const activitiesRegisterTable = process.env.ACTIVITIES_REGISTER_TABLE_NAME;
  const activitiesSurveyTable = process.env.ACTIVITIES_SURVEY_TABLE_NAME;
  const activitiesDeskTable = process.env.ACTIVITIES_DESK_TABLE_NAME
  const activitiesImagesBucket = process.env.ACTIVITIES_IMAGES_BUCKET;
  if (
    !activitiesTable ||
    !plansTable ||
    !verificationsTable ||
    !activitiesRegisterTable ||
    !activitiesSurveyTable ||
    !activitiesDeskTable ||
    !activitiesImagesBucket
  )
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(400, "Bad Request: Missing User Id");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const params: QueryCommandInput = {
      TableName: activitiesTable,
      ExpressionAttributeNames: { "#userId": "userId", "#activityId": "activityId" },
      ExpressionAttributeValues: { ":userId": userId, ":activityId": activityId },
      IndexName: "UserIdEndDateIndex",
      KeyConditionExpression: "#userId = :userId",
      FilterExpression: "#activityId = :activityId",
    };
    const results: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(params)
    );
    if (!results.Items?.length) return error(404, "Not Found: activity not found");
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
      TableName: activitiesSurveyTable,
      ExpressionAttributeNames: {
        "#surveyId": "surveyId",
        "#activityId": "activityId",
        "#language": "language",
      },
      ExpressionAttributeValues: { ":activityId": item.activityId },
      IndexName: "ActivityIndex",
      KeyConditionExpression: "#activityId = :activityId",
      ProjectionExpression: "#surveyId, #activityId, #language",
    };

    const deskParams: QueryCommandInput = {
      TableName: activitiesDeskTable,
      ExpressionAttributeNames: { "#activityId": "activityId", "#active": "active" },
      ExpressionAttributeValues: { ":activityId": item.activityId, ":active": 1 },
      IndexName: "ActivityIndex",
      KeyConditionExpression: "#activityId = :activityId",
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
      TableName: activitiesRegisterTable,
      ExpressionAttributeNames: {
        "#registrationId": "registrationId",
        "#activityId": "activityId",
        "#confirmed": "confirmed",
      },
      ExpressionAttributeValues: { ":activityId": item.activityId },
      IndexName: "ActivityIndex",
      KeyConditionExpression: "#activityId = :activityId",
      ProjectionExpression: "#registrationId, #activityId, #confirmed",
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
          Bucket: activitiesImagesBucket,
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