import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  UpdateCommand,
  type GetCommandOutput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { PublishCommand, SetSMSAttributesCommand } from "@aws-sdk/client-sns";
import { error } from "src/error";
import { dynamoDBClient, sesClient, snsClient } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const eventsTable = process.env.EVENTS_TABLE_NAME;
  const eventsRegisterTable = process.env.EVENTS_REGISTER_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const SURVEY_URL = process.env.SURVEY_URL;
  if (!eventsTable || !eventsRegisterTable || !verificationsTable)
    return error(500, "Internal Server Error");

  const eventId = event?.pathParameters?.id;
  if (!eventId) return error(400, "Bad Request: Missing Event Id");

  const data = JSON.parse(event?.body || "");
  if (!data.registrationId)
    return error(400, "Bad Request: Missing Registration Id");

  try {
    // get event
    const eventsResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: eventsTable,
        Key: { eventId },
      })
    );
    if (!eventsResults.Item) return error(404, "Not Found: Event not found");
    const event = eventsResults.Item;

    // get registration
    const registrationsResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: eventsRegisterTable,
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
      TableName: eventsRegisterTable,
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
    if (event?.notificationOnConfirm === "YES") {
      // get verification
      const verificationsResults: GetCommandOutput = await dynamoDBClient.send(
        new GetCommand({
          TableName: verificationsTable,
          Key: { verificationId: event.verificationId },
        })
      );
      if (!verificationsResults.Item)
        return error(404, "Not Found: Verification Type not found");
      const verification = verificationsResults.Item;

      // messages
      let messageSubject = `${event.name} - Lembrete da pesquisa!`;
      let messageBody = `Olá! Não se não se esqueça de participar da nossa pesquisa${
        event.raffle === "YES" ? " e concorrer no sorteio" : ""
      }, acesse: ${SURVEY_URL}/${event.slug}`;
      if (data.language === "en") {
        messageSubject = `${event.name} - Survey Reminder!`;
        messageBody = `Hello! Don't forget to participate in our survey${
          event.raffle === "YES" ? " and enter the raffle" : ""
        }, visit: ${SURVEY_URL}/${event.slug}`;
      } else if (data.language === "es") {
        messageSubject = `${event.name} - ¡Recordatorio de la encuesta!`;
        messageBody = `¡Hola! No olvides participar en nuestra encuesta${
          event.raffle === "YES" ? " y participar en el sorteo" : ""
        }, accede a: ${SURVEY_URL}/${event.slug}`;
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
            Source: "contato@touchsistemas.com.br",
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
