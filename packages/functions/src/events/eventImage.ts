import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../aws-clients";
import { error } from "src/error";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const bucket = process.env.BUCKET;
  if (!bucket) return error(500, "Internal Server Error");
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) return error(401, "Unauthorized");
  const data = JSON.parse(event?.body || "");
  if (userId !== data?.userId) return error(400, "Bad Request: Wrong User Id");
  if (!data?.userId || !data?.eventId || !data?.logo)
    return error(400, "Bad Request: Missing Data");

  const matches = data.logo.match(/^data:(image\/\w+);base64,/);
  if (!matches || matches.length !== 2)
    return error(400, "Bad Request: Invalid Image Data");

  const ContentType = matches[1];
  const extension = ContentType.split("/")[1];
  const filePath = `logos/${data.userId}/${data.eventId}.${extension}`;

  const base64Data = data.logo.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filePath,
        Body: buffer,
        ContentType: ContentType,
      })
    );
    const url = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: bucket,
      Key: filePath,
    }), { expiresIn: 60 * 60 * 24 });
    return {
      statusCode: 200,
      body: JSON.stringify(url),
    };
  } catch (err) {
    console.error("S3 Error:", err);
    return error(500, "Internal Server Error: S3 operation failed");
  }
};
