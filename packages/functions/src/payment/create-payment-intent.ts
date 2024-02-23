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
  const planTable = process.env.PLAN_TABLE_NAME;
  const verificationTable = process.env.VERIFICATION_TABLE_NAME;
  const userTable = process.env.USER_TABLE_NAME;
  const STRIPETOKEN = process.env.STRIPE_TOKEN;
  if (!planTable || !verificationTable || !userTable || !STRIPETOKEN)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const data = JSON.parse(event?.body || "");
  if (!data?.planId) return error(400, "Bad Request: Missing Plan Id");

  const stripe = require("stripe")(STRIPETOKEN);
  try {
    const planParams: GetCommandInput = {
      TableName: planTable,
      Key: { planId: data.planId },
    };
    const planResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand(planParams)
    );
    if (!planResults.Item) return error(404, "Not Found: Plan not found");

    const verificationParams: GetCommandInput = {
      TableName: verificationTable,
      Key: { verificationId: data.verificationId },
    };
    const verificationResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand(verificationParams)
    );
    if (!verificationResults.Item)
      return error(404, "Not Found: Verification Type not found");

    const userParams: GetCommandInput = {
      TableName: userTable,
      Key: { userId },
    };
    const userResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand(userParams)
    );
    if (!userResults.Item) return error(404, "Not Found: User not found");

    const value = Math.round(planResults.Item.price * 100);
    const paymentIntentsParam =
      verificationResults.Item.price !== "0.00"
        ? {
            customer: userResults.Item.stripeCustomerId,
            setup_future_usage: "off_session",
            amount: value,
            currency: "brl",
          }
        : {
            amount: value,
            currency: "brl",
          };
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentsParam
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
    };
  } catch (err) {
    console.error("Stripe Error:", err);
    return error(500, "Internal Server Error: Stripe operation failed");
  }
};
