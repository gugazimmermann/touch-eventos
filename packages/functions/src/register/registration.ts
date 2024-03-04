import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  type GetCommandOutput,
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
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesRegister } from "../database";
import { dynamoDBClient, sesClient, snsClient } from "../aws-clients";
import { error } from "../error";

export interface Database {
  activities_register: IActivitiesRegister;
}

const db = new Kysely<Database>({
  dialect: new DataApiDialect({
    mode: "mysql",
    driver: {
      database: RDS.Database.defaultDatabaseName,
      secretArn: RDS.Database.secretArn,
      resourceArn: RDS.Database.clusterArn,
      client: new RDSData({}),
    },
  }),
});

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const verificationsTable = process.env.VERIFICATIONS_TABLE_NAME;
  if (!activitiesTable || !verificationsTable)
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
    if (!activitiesResults.Item)
      return error(404, "Not Found: Activity not found");
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
      email: data?.email || null,
      phone: data?.phone || null,
      language: data.language,
      code,
      confirmed: null,
      gift: null,
      deskId: null,
      createdAt: data.createdAt,
      activityRegisterHash,
    };

    // verify if already registered
    const verifyRegister = await db
      .selectFrom("activities_register")
      .select(["registrationId", "confirmed"])
      .where("registrationId", "=", data.registrationId)
      .where("activityId", "=", activityId)
      .execute();

    // registration already in database
    let alreadyExists = false;
    if (verifyRegister.length) {
      // registration already confirmed
      if (verifyRegister[0].confirmed) return error(400, "Already Registered");
      alreadyExists = true;
      registerItem.registrationId = verifyRegister[0].registrationId;
    }

    // messages
    let emailSubject = `${activity.name} - Cadastro`;
    let messageBody = activity.confirmationText.replace("{######}", registerItem.code);
    // if (registerItem.language === "en") {
    //   messageSubject = "Complete your registration at";
    //   messageBody = "Confirmation Code:";
    // } else if (registerItem.language === "es") {
    //   messageSubject = "Finaliza tu registro en";
    //   messageBody = "Código de Confirmación:";
    // }

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
          Message: messageBody,
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
                Data: messageBody,
              },
            },
            Subject: { Data: emailSubject },
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
      await db
        .insertInto("activities_register")
        .values({
          registrationId: registerItem.registrationId,
          activityId: registerItem.activityId,
          email: registerItem.email,
          phone: registerItem.phone,
          language: registerItem.language,
          code: registerItem.code,
          confirmed: registerItem.confirmed,
          gift: registerItem.gift,
          deskId: registerItem.deskId,
          createdAt: data.createdAt,
          activityRegisterHash: registerItem.activityRegisterHash,
        })
        .executeTakeFirst();
    } else {
      await db
        .updateTable("activities_register")
        .set({
          code: registerItem.code,
          language: registerItem.language,
        })
        .where("registrationId", "=", registerItem.registrationId)
        .executeTakeFirst();
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
