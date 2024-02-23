import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "../error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const userTable = process.env.USER_TABLE_NAME;
  const STRIPETOKEN = process.env.STRIPE_TOKEN;
  if (!userTable || !STRIPETOKEN) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const stripe = require("stripe")(STRIPETOKEN);

  try {
    const userParams: GetCommandInput = {
      TableName: userTable,
      Key: { userId },
    };
    const userResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand(userParams)
    );
    if (!userResults.Item) return error(404, "Not Found: User not found");
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: userResults.Item.stripeCustomerId,
      type: "card",
    });
    const customerPaymentMethods = [];
    if (paymentMethods?.data?.length) {
      paymentMethods?.data.sort(
        (a: { created: number }, b: { created: number }) =>
          b.created - a.created
      );
      for (const data of paymentMethods?.data) {
        customerPaymentMethods.push({
          brand: data.card.brand,
          expiration: `${data.card.exp_month}/${data.card.exp_year}`,
          last4: data.card.last4,
          created: data.created,
        });
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ paymentMethods: customerPaymentMethods }),
    };
  } catch (err) {
    console.error("Stripe Error:", err);
    return error(500, "Internal Server Error: Stripe operation failed");
  }
};
