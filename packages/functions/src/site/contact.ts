import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const data = JSON.parse(event?.body || "");
  if (!data?.email) return error(400, "Bad Request: Missing Data");
  try {
    const response = await sesClient.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: ["contato@toucheventos.com.br"],
        },
        Message: {
          Body: {
            Text: {
              Data: `
Nome: ${data.name}
Email: ${data.email}
Mensagem: ${data.message}
          `,
            },
          },
          Subject: { Data: "Touch Eventos - Contato" },
        },
        Source: "contato@toucheventos.com.br",
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.error("SES Error:", err);
    return error(500, "Internal Server Error: SES operation failed");
  }
};
