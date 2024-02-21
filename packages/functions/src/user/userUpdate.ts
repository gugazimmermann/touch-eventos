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
  const usersTable = process.env.USERS_TABLE_NAME;
  const STRIPETOKEN = process.env.STRIPE_TOKEN;
  if (!usersTable || !STRIPETOKEN) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const data = JSON.parse(event?.body || "");

  try {
    const stripe = require("stripe")(STRIPETOKEN);
    let stripeCustomer = null;
    if (!data.stripeCustomerId) {
      stripeCustomer = await stripe.customers.create({
        description: userId,
        name: data.name,
        email: data.email,
      });
    } else {
      stripeCustomer = await stripe.customers.update(data.stripeCustomerId, {
        description: userId,
        name: data.name,
        email: data.email,
      });
    }
    const params: UpdateCommandInput = {
      TableName: usersTable,
      Key: { userId },
      UpdateExpression:
        "SET #active = :active, #stripeCustomerId = :stripeCustomerId, #name = :name, #documentType = :documentType, #document = :document, #email = :email, #phoneCode = :phoneCode, #phone = :phone, #addressZipCode = :addressZipCode, #addressState = :addressState, #addressCity = :addressCity, #addressStreet = :addressStreet, #addressNumber = :addressNumber, #addressNeighborhood = :addressNeighborhood, #addressComplement = :addressComplement, #addressLatitude = :addressLatitude, #addressLongitude = :addressLongitude",
      ExpressionAttributeNames: {
        "#active": "active",
        "#stripeCustomerId": "stripeCustomerId",
        "#name": "name",
        "#documentType": "documentType",
        "#document": "document",
        "#email": "email",
        "#phoneCode": "phoneCode",
        "#phone": "phone",
        "#addressZipCode": "addressZipCode",
        "#addressState": "addressState",
        "#addressCity": "addressCity",
        "#addressStreet": "addressStreet",
        "#addressNumber": "addressNumber",
        "#addressNeighborhood": "addressNeighborhood",
        "#addressComplement": "addressComplement",
        "#addressLatitude": "addressLatitude",
        "#addressLongitude": "addressLongitude",
      },
      ExpressionAttributeValues: {
        ":active": data.active,
        ":stripeCustomerId": stripeCustomer.id,
        ":name": data.name,
        ":documentType": data.documentType,
        ":document": data.document,
        ":email": data.email,
        ":phoneCode": data.phoneCode,
        ":phone": data.phone,
        ":addressZipCode": data.addressZipCode,
        ":addressState": data.addressState,
        ":addressCity": data.addressCity,
        ":addressStreet": data.addressStreet,
        ":addressNumber": data.addressNumber,
        ":addressNeighborhood": data.addressNeighborhood,
        ":addressComplement": data.addressComplement,
        ":addressLatitude": data.addressLatitude,
        ":addressLongitude": data.addressLongitude,
      },
      ReturnValues: "ALL_NEW",
    };
    const results: UpdateCommandOutput = await dynamoDBClient.send(
      new UpdateCommand(params)
    );
    return {
      statusCode: 200,
      body: JSON.stringify(results.Attributes),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
