import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  GetCommand,
  QueryCommand,
  type GetCommandOutput,
  type QueryCommandInput,
  type QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { IActivitiesRegister } from "../database";
import { dynamoDBClient, s3Client } from "../aws-clients";
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
  const activitiesImagesBucket = process.env.ACTIVITIES_IMAGES_BUCKET;
  if (!activitiesTable || !verificationsTable || !activitiesImagesBucket)
    return error(500, "Internal Server Error");
  const slug = event?.pathParameters?.slug;
  if (!slug) return error(400, "Bad Request: Missing Activity Slug");

  try {
    const activitiesParams: QueryCommandInput = {
      TableName: activitiesTable,
      ExpressionAttributeNames: {
        "#activityId": "activityId",
        "#active": "active",
        "#payment": "payment",
        "#name": "name",
        "#slug": "slug",
        "#image": "image",
        "#verificationId": "verificationId",
        "#raffle": "raffle",
        "#raffleDay": "raffleDay",
        "#surveyLastDay": "surveyLastDay",
      },
      ExpressionAttributeValues: { ":slug": slug },
      IndexName: "SlugIndex",
      KeyConditionExpression: "#slug = :slug",
      ProjectionExpression:
        "#activityId, #active, #payment, #name, #slug, #image, #verificationId, #raffle, #raffleDay, #surveyLastDay",
    };
    const activitiesResults: QueryCommandOutput = await dynamoDBClient.send(
      new QueryCommand(activitiesParams)
    );
    if (!activitiesResults?.Items?.length)
      return error(404, "Not Found: activity not found");
    const item = activitiesResults.Items[0];

    const verificationsResults: GetCommandOutput = await dynamoDBClient.send(
      new GetCommand({
        TableName: verificationsTable,
        Key: { verificationId: item.verificationId },
      })
    );
    item.verification = verificationsResults.Item;

    if (item.image) {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: activitiesImagesBucket,
          Key: item.image,
        }),
        { expiresIn: 60 * 60 * 24 * 6 }
      );
      item.logo = url;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        activityId: item.activityId,
        active: item.active,
        payment: item?.payment?.status,
        name: item.name,
        slug: item.slug,
        logo: item.logo,
        verification: item.verification.type,
        raffle: item.raffle,
        raffleDay: item.raffleDay,
        surveyLastDay: item.surveyLastDay
      }),
    };
  } catch (err) {
    console.error("DynamoDB Error:", err);
    return error(500, "Internal Server Error: DynamoDB operation failed");
  }
};
