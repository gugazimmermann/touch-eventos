import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { GetCommand, type GetCommandOutput } from "@aws-sdk/lib-dynamodb";
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
  if (!data?.phone && !data?.email) return error(401, "Unauthorized");

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

    // verify if register
    let query = db
      .selectFrom("activities_register")
      .select(["registrationId", "confirmed"]);
    if (data?.phone) {
      query = query.where("phone", "=", data.phone);
    }
    if (data?.email) {
      query = query.where("email", "=", data.email);
    }
    const verifyRegister = await query.executeTakeFirst();

    // not found
    if (!verifyRegister) {
      return error(400, "Not Found");
    }
    // not confirmed
    if (!verifyRegister.confirmed) {
      return error(400, "Not Confirmed");
    }

    // generate confirmation code
    const code = (verifyRegister.registrationId.match(/\d/g) || [])
      .reverse()
      .join("")
      .slice(0, 6);

    // messages
    let emailSubject = `${activity.name} - Pesquisa`;
    let messageBody =
      "Seu código de acesso para a pesquisa é: {######}".replace(
        "{######}",
        code
      );

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
          PhoneNumber: data.phone,
        })
      );
    } else {
      sendCodeResponse = await sesClient.send(
        new SendEmailCommand({
          Destination: { ToAddresses: [data.email] },
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

    // sent, update registration code
    await db
      .updateTable("activities_register")
      .set({
        code,
        language: data.language,
      })
      .where("registrationId", "=", verifyRegister.registrationId)
      .executeTakeFirst();

    return {
      statusCode: 200,
      body: JSON.stringify({
        registrationId: verifyRegister.registrationId,
        language: data.language,
      }),
    };
  } catch (err) {
    console.error("Operation Error:", err);
    return error(500, "Internal Server Error: Operation failed");
  }
};
