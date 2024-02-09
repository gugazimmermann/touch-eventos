import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  UpdateCommand,
  type UpdateCommandInput,
  type UpdateCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { error } from "src/error";
import { dynamoDBCliente } from "../aws-clients";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const data = JSON.parse(event?.body || "");
  if (!data?.userId) return error(401, "Unauthorized");
  if (userId !== data.userId) return error(400, "Bad Request: Wrong User Id");

  try {
    const params: UpdateCommandInput = {
      TableName: tableName,
      Key: { userId },
      UpdateExpression:
        "SET #active = :active, #name = :name, #documentType = :documentType, #document = :document, #email = :email, #phoneCode = :phoneCode, #phone = :phone, #addressZipCode = :addressZipCode, #addressState = :addressState, #addressCity = :addressCity, #addressStreet = :addressStreet, #addressNumber = :addressNumber, #addressNeighborhood = :addressNeighborhood, #addressComplement = :addressComplement, #addressLatitude = :addressLatitude, #addressLongitude = :addressLongitude",
      ExpressionAttributeNames: {
        "#active": "active",
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
    const results: UpdateCommandOutput = await dynamoDBCliente.send(
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
