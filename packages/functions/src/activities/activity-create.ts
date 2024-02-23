import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { addMonths, getTime, isAfter } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  type PutCommandInput,
  type GetCommandInput,
  type GetCommandOutput,
  type QueryCommandInput,
  type UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBClient } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const activitiesTable = process.env.ACTIVITIES_TABLE_NAME;
  const paymentsTable = process.env.PAYMENTS_TABLE_NAME;
  const plansTable = process.env.PLANS_TABLE_NAME;
  const usersSubscriptionTable = process.env.USERS_SUBSCRIPTION_TABLE_NAME;
  if (!activitiesTable || !paymentsTable || !plansTable || !usersSubscriptionTable)
    return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const data = JSON.parse(event?.body || "");

  try {
    const activityParams: PutCommandInput = {
      TableName: activitiesTable,
      Item: data,
    };
    await dynamoDBClient.send(new PutCommand(activityParams));

    if (data.payment) {
      const paymentParams: PutCommandInput = {
        TableName: paymentsTable,
        Item: data.payment,
      };
      await dynamoDBClient.send(new PutCommand(paymentParams));

      const plansParams: GetCommandInput = {
        TableName: plansTable,
        Key: { planId: data.planId },
      };
      const plansResults: GetCommandOutput = await dynamoDBClient.send(
        new GetCommand(plansParams)
      );
      if (!plansResults.Item) return error(404, "Not Found: Plan not found");
      const plan = plansResults.Item;

      if (plan.type === "Múltiplas Atividades") {
        const startDate = new Date();
        const endDate = addMonths(
          startDate,
          plan.duration === "Semestral" ? 6 : 12
        );
        const usersSubscription = {
          usersSubscriptionId: data.payment.paymentIntentId,
          userId,
          paymentId: data.payment.paymentId,
          planId: plan.planId,
          startDate: `${getTime(startDate)}`,
          endDate: `${getTime(endDate)}`,
        };
        const usersSubscriptionParams: PutCommandInput = {
          TableName: usersSubscriptionTable,
          Item: usersSubscription,
        };
        await dynamoDBClient.send(new PutCommand(usersSubscriptionParams));
      }
    } else {
      const usersSubscriptionParams: QueryCommandInput = {
        TableName: usersSubscriptionTable,
        ExpressionAttributeNames: {
          "#userId": "userId",
          "#paymentId": "paymentId",
          "#endDate": "endDate",
        },
        ExpressionAttributeValues: { ":userId": userId },
        IndexName: "UserIndex",
        KeyConditionExpression: "#userId = :userId",
        ProjectionExpression: "#paymentId, #endDate",
        ScanIndexForward: false,
      };
      const usersSubscriptionResults = await dynamoDBClient.send(
        new QueryCommand(usersSubscriptionParams)
      );
      let currentSubscription = null;
      if (
        usersSubscriptionResults.Items &&
        usersSubscriptionResults.Items.length
      ) {
        const today = new Date();
        for (const subscription of usersSubscriptionResults.Items) {
          const endDate = new Date(parseInt(subscription.endDate, 10));
          if (isAfter(endDate, today)) {
            currentSubscription = subscription;
            break;
          }
        }
      }
      if (currentSubscription) {
        const userPaymentParams: GetCommandInput = {
          TableName: paymentsTable,
          Key: { paymentId: currentSubscription.paymentId },
        };
        const userPaymentResults: GetCommandOutput = await dynamoDBClient.send(
          new GetCommand(userPaymentParams)
        );
        if (!userPaymentResults.Item)
          return error(404, "Not Found: Payment not found");
        const userPayment = userPaymentResults.Item;
        const newUserPayment = {
          ...userPayment,
          paymentId: uuidv4(),
          value: 0,
          date: `${getTime(new Date())}`,
        };
        const newUserPaymentParams: PutCommandInput = {
          TableName: paymentsTable,
          Item: newUserPayment,
        };
        await dynamoDBClient.send(new PutCommand(newUserPaymentParams));

        const updateActivityParams: UpdateCommandInput = {
          TableName: activitiesTable,
          Key: { activityId: data.activityId },
          UpdateExpression: "SET #payment = :payment",
          ExpressionAttributeNames: { "#payment": "payment" },
          ExpressionAttributeValues: { ":payment": newUserPayment },
          ReturnValues: "ALL_NEW",
        };
        await dynamoDBClient.send(new UpdateCommand(updateActivityParams));
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ created: true }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
