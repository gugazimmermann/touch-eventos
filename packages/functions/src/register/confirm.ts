import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  UpdateCommand,
  type GetCommandOutput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { PublishCommand, SetSMSAttributesCommand } from "@aws-sdk/client-sns";
import { dynamoDBClient, sesClient, snsClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const activitiesRegisterTable = process.env.ACTIVITIES_REGISTER_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const SURVEY_URL = process.env.SURVEY_URL;
  if (!activitiesTable || !activitiesRegisterTable || !verificationsTable)
    return error(500, "Internal Server Error");

  const activityId = event?.pathParameters?.id;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  const data = JSON.parse(event?.body || "");
  if (!data.registrationId)
    return error(400, "Bad Request: Missing Registration Id");

  try {
    // get activity
    const activitiesResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: activitiesTable,
        Key: { activityId },
      })
    );
    if (!activitiesResults.Item) return error(404, "Not Found: activity not found");
    const activity = activitiesResults.Item;

    // get registration
    const registrationsResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: activitiesRegisterTable,
        Key: { registrationId: data.registrationId },
      })
    );
    if (!registrationsResults.Item)
      return error(404, "Not Found: Registration not found");
    const registration = registrationsResults.Item;

    // confirm code
    if (registration.code !== data.code.trim().toLowerCase())
      return error(400, "Bad Request: Wrong Code");

    const registerUpdateParams: UpdateCommandInput = {
      TableName: activitiesRegisterTable,
      Key: { registrationId: data.registrationId },
      UpdateExpression: "SET #language = :language, #confirmed = :confirmed",
      ExpressionAttributeNames: {
        "#language": "language",
        "#confirmed": "confirmed",
      },
      ExpressionAttributeValues: {
        ":language": data.language,
        ":confirmed": data.confirmedAt,
      },
      ReturnValues: "ALL_NEW",
    };
    await dynamoDBClient.send(new UpdateCommand(registerUpdateParams));

    // notification on confirm
    if (activity?.notificationOnConfirm === "YES") {
      // get verification
      const verificationsResults: GetCommandOutput = await dynamoDBClient.send(
        new GetCommand({
          TableName: verificationsTable,
          Key: { verificationId: activity.verificationId },
        })
      );
      if (!verificationsResults.Item)
        return error(404, "Not Found: Verification Type not found");
      const verification = verificationsResults.Item;

      // messages
      let messageSubject = `${activity.name} - Lembrete da pesquisa!`;
      let messageBody = `Olá! Não se não se esqueça de participar da nossa pesquisa${
        activity.raffle === "YES" ? " e concorrer no sorteio" : ""
      }, acesse: ${SURVEY_URL}/${activity.slug}`;
      if (data.language === "en") {
        messageSubject = `${activity.name} - Survey Reminder!`;
        messageBody = `Hello! Don't forget to participate in our survey${
          activity.raffle === "YES" ? " and enter the raffle" : ""
        }, visit: ${SURVEY_URL}/${activity.slug}`;
      } else if (data.language === "es") {
        messageSubject = `${activity.name} - ¡Recordatorio de la encuesta!`;
        messageBody = `¡Hola! No olvides participar en nuestra encuesta${
          activity.raffle === "YES" ? " y participar en el sorteo" : ""
        }, accede a: ${SURVEY_URL}/${activity.slug}`;
      }

      if (verification.type === "SMS") {
        await snsClient.send(
          new SetSMSAttributesCommand({
            attributes: {
              DefaultSMSType: 'Transactional',
            },
          }),
        );
        await snsClient.send(
          new PublishCommand({
            Message: `${messageSubject} - ${messageBody}`,
            PhoneNumber: registration.phone,
            MessageAttributes: {
                  'AWS.SNS.SMS.SMSType': {
                      DataType: 'String',
                      StringValue: 'Transactional'
                  }
              }
          })
        );
      } else {
        await sesClient.send(
          new SendEmailCommand({
            Destination: { ToAddresses: [registration.email] },
            Message: {
              Body: {
                Text: {
                  Data: messageBody,
                },
              },
              Subject: { Data: messageSubject },
            },
            Source: "no-reply@toucheventos.com.br",
          })
        );
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        registrationId: data.registrationId,
        language: data.language,
      }),
    };
  } catch (err) {
    console.error("Operation Error:", err);
    return error(500, "Internal Server Error: Operation failed");
  }
};
