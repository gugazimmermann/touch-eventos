import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  UpdateCommand,
  type UpdateCommandInput,
  type UpdateCommandOutput,
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
  const data = JSON.parse(event?.body || "");
  const activityId = event?.pathParameters?.activityId;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  try {
    const params: UpdateCommandInput = {
      TableName: activitiesTable,
      Key: { activityId },
      UpdateExpression:
        "SET #dates = :dates, #startDate = :startDate, #endDate = :endDate, #name = :name, #slug = :slug, #activityType = :activityType, #description = :description, #addressCountry = :addressCountry, #addressZipCode = :addressZipCode, #addressState = :addressState, #addressCity = :addressCity, #addressStreet = :addressStreet, #addressNumber = :addressNumber, #addressNeighborhood = :addressNeighborhood, #addressComplement = :addressComplement, #addressLatitude = :addressLatitude, #addressLongitude = :addressLongitude, #city = :city, #state = :state, #location = :location, #visitorGift = :visitorGift, #notificationOnConfirm = :notificationOnConfirm, #notificationOnActivityEnd = :notificationOnActivityEnd, #raffle = :raffle, #raffleType = :raffleType, #surveyLastDay = :surveyLastDay, #raffleDay = :raffleDay, #raffleAutomatic = :raffleAutomatic, #visitorGiftText = :visitorGiftText, #raffleText = :raffleText, #surveyText = :surveyText, #confirmationText = :confirmationText, #notificationOnConfirmText = :notificationOnConfirmText, #notificationOnEndText = :notificationOnEndText, #raffleAutomaticText = :raffleAutomaticText",
      ExpressionAttributeNames: {
        "#dates": "dates",
        "#startDate": "startDate",
        "#endDate": "endDate",
        "#name": "name",
        "#slug": "slug",
        "#activityType": "activityType",
        "#description": "description",
        "#addressCountry": "addressCountry",
        "#addressZipCode": "addressZipCode",
        "#addressState": "addressState",
        "#addressCity": "addressCity",
        "#addressStreet": "addressStreet",
        "#addressNumber": "addressNumber",
        "#addressNeighborhood": "addressNeighborhood",
        "#addressComplement": "addressComplement",
        "#addressLatitude": "addressLatitude",
        "#addressLongitude": "addressLongitude",
        "#city": "city",
        "#state": "state",
        "#location": "location",
        "#visitorGift": "visitorGift",
        "#notificationOnConfirm": "notificationOnConfirm",
        "#notificationOnActivityEnd": "notificationOnActivityEnd",
        "#raffle": "raffle",
        "#raffleType": "raffleType",
        "#surveyLastDay": "surveyLastDay",
        "#raffleDay": "raffleDay",
        "#raffleAutomatic": "raffleAutomatic",
        "#visitorGiftText": "visitorGiftText",
        "#raffleText": "raffleText",
        "#surveyText": "surveyText",
        "#confirmationText": "confirmationText",
        "#notificationOnConfirmText": "notificationOnConfirmText",
        "#notificationOnEndText": "notificationOnEndText",
        "#raffleAutomaticText": "raffleAutomaticText",
      },
      ExpressionAttributeValues: {
        ":dates": data.dates,
        ":startDate": data.startDate,
        ":endDate": data.endDate,
        ":name": data.name,
        ":slug": data.slug,
        ":activityType": data.activityType,
        ":description": data.description,
        ":addressCountry": data.addressCountry,
        ":addressZipCode": data.addressZipCode,
        ":addressState": data.addressState,
        ":addressCity": data.addressCity,
        ":addressStreet": data.addressStreet,
        ":addressNumber": data.addressNumber,
        ":addressNeighborhood": data.addressNeighborhood,
        ":addressComplement": data.addressComplement,
        ":addressLatitude": data.addressLatitude,
        ":addressLongitude": data.addressLongitude,
        ":city": data.city,
        ":state": data.state,
        ":location": data.location,
        ":visitorGift": data.visitorGift,
        ":notificationOnConfirm": data.notificationOnConfirm,
        ":notificationOnActivityEnd": data.notificationOnActivityEnd,
        ":raffle": data.raffle,
        ":raffleType": data.raffleType,
        ":surveyLastDay": data.surveyLastDay,
        ":raffleDay": data.raffleDay,
        ":raffleAutomatic": data.raffleAutomatic,
        ":visitorGiftText": data.visitorGiftText,
        ":raffleText": data.raffleText,
        ":surveyText": data.surveyText,
        ":confirmationText": data.confirmationText,
        ":notificationOnConfirmText": data.notificationOnConfirmText,
        ":notificationOnEndText": data.notificationOnEndText,
        ":raffleAutomaticText": data.raffleAutomaticText,
      },
      ReturnValues: "ALL_NEW",
    };
    const results: UpdateCommandOutput = await dynamoDBClient.send(
      new UpdateCommand(params)
    );
    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
