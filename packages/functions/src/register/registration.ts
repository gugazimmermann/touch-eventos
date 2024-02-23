import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  type GetCommandOutput,
  type PutCommandInput,
  type QueryCommandInput,
  type QueryCommandOutput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import {
  SendEmailCommand,
  type SendEmailCommandOutput,
} from "@aws-sdk/client-ses";
import {
  PublishCommand,
  SetSMSAttributesCommand,
  type PublishCommandOutput,
} from "@aws-sdk/client-sns";
import { dynamoDBClient, sesClient, snsClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  const activitiesRegisterTable = process.env.ACTIVITIES_REGISTER_TABLE_NAME;
  if (!activitiesTable || !verificationsTable || !activitiesRegisterTable)
    return error(500, "Internal Server Error");

  const activityId = event?.pathParameters?.id;
  if (!activityId) return error(400, "Bad Request: Missing Activity Id");

  const data = JSON.parse(event?.body || "");
  if (!data?.check) return error(401, "Unauthorized");

  try {
    // get activity
    const activitiesResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: activitiesTable,
        Key: { activityId },
      })
    );
    if (!activitiesResults.Item) return error(404, "Not Found: Activity not found");
    const activity = activitiesResults.Item;

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

    // validate correct verification data
    if (verification.type === "SMS") {
      if (!data?.phone) return error(400, "Unauthorized");
    } else {
      if (!data?.email) return error(400, "Unauthorized");
    }

    // generate confirmation code
    const code = (data.registrationId.match(/\d/g) || [])
      .reverse()
      .join("")
      .slice(0, 6);

    // create dynbamoDB hash
    const activityRegisterHash = `${activityId}#${
      verification.type === "SMS" ? data.phone : data.email
    }`;

    // create registration item
    const registerItem = {
      registrationId: data.registrationId,
      activityId: activityId,
      email: data?.email || "-",
      phone: data?.phone || "-",
      language: data.language,
      code,
      confirmed: "",
      gift: "",
      createdAt: data.createdAt,
      activityRegisterHash,
    };

    // verify if already registered
    const verifyRegisterParams: QueryCommandInput = {
      TableName: activitiesRegisterTable,
      ExpressionAttributeNames: {
        "#activityRegisterHash": "activityRegisterHash",
        "#activityId": "activityId",
      },
      ExpressionAttributeValues: {
        ":activityRegisterHash": activityRegisterHash,
        ":activityId": activityId,
      },
      IndexName: "ActivityRegisterHash",
      KeyConditionExpression: "#activityRegisterHash = :activityRegisterHash",
      FilterExpression: "#activityId = :activityId",
    };
    const verifyRegisterResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(verifyRegisterParams)
    );

    // registration already in database
    let alreadyExists = false;
    if (verifyRegisterResults.Items?.length) {
      // registration already confirmed
      if (verifyRegisterResults.Items[0].confirmed)
        return error(400, "Already Registered");
      alreadyExists = true;
      registerItem.registrationId =
        verifyRegisterResults.Items[0].registrationId;
    }

    // messages
    let messageSubject = "Finalize seu registro em";
    let messageBody = "Código de Confirmação:";
    if (registerItem.language === "en") {
      messageSubject = "Complete your registration at";
      messageBody = "Confirmation Code:";
    } else if (registerItem.language === "es") {
      messageSubject = "Finaliza tu registro en";
      messageBody = "Código de Confirmación:";
    }

    let sendCodeResponse:
      | PublishCommandOutput
      | SendEmailCommandOutput
      | undefined = undefined;

    if (verification.type === "SMS") {
      await snsClient.send(
        new SetSMSAttributesCommand({
          attributes: { DefaultSMSType: "Transactional" },
        })
      );
      sendCodeResponse = await snsClient.send(
        new PublishCommand({
          Message: `${messageSubject} ${activity.name}. ${messageBody} ${registerItem.code}`,
          PhoneNumber: registerItem.phone,
        })
      );
    } else {
      sendCodeResponse = await sesClient.send(
        new SendEmailCommand({
          Destination: { ToAddresses: [registerItem.email] },
          Message: {
            Body: {
              Text: {
                Data: `
      ${messageSubject} ${activity.name}\n\n
      ${messageBody} ${registerItem.code}
                `,
              },
            },
            Subject: { Data: `${messageSubject} ${activity.name}` },
          },
          Source: "no-reply@toucheventos.com.br",
        })
      );
    }
    if (!sendCodeResponse?.MessageId) {
      return error(500, "Internal Server Error: Failed to send Code");
    }

    // sent, save the registration if not exists, update if exists
    if (!alreadyExists) {
      const registerParams: PutCommandInput = {
        TableName: activitiesRegisterTable,
        Item: registerItem,
      };
      await dynamoDBClient.send(new PutCommand(registerParams));
    } else {
      const registerUpdateParams: UpdateCommandInput = {
        TableName: activitiesRegisterTable,
        Key: { registrationId: registerItem.registrationId },
        UpdateExpression:
          "SET #email = :email, #phone = :phone, #language = :language, #code = :code, #confirmed = :confirmed, #createdAt = :createdAt",
        ExpressionAttributeNames: {
          "#email": "email",
          "#phone": "phone",
          "#language": "language",
          "#code": "code",
          "#confirmed": "confirmed",
          "#createdAt": "createdAt",
        },
        ExpressionAttributeValues: {
          ":email": registerItem.email,
          ":phone": registerItem.phone,
          ":language": registerItem.language,
          ":code": registerItem.code,
          ":confirmed": registerItem.confirmed,
          ":createdAt": registerItem.createdAt,
        },
        ReturnValues: "ALL_NEW",
      };
      await dynamoDBClient.send(new UpdateCommand(registerUpdateParams));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        registrationId: registerItem.registrationId,
        language: registerItem.language,
      }),
    };
  } catch (err) {
    console.error("Operation Error:", err);
    return error(500, "Internal Server Error: Operation failed");
  }
};
