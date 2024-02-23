import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StackContext, use, Api } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { BucketdStack } from "./BucketStack";

export function SiteApiStack({ stack }: StackContext) {
  const {
    activitiesTable,
    plansTable,
    verificationsTable,
    activitiesRegisterTable,
    activitiesDeskTable,
  } = use(DynamoDBStack);
  const { activitiesImagesBucket } = use(BucketdStack);

  const siteApi = new Api(stack, "SiteApi", {
    customDomain:
      stack.stage === "production"
        ? {
            domainName: "site-api.toucheventos.com.br",
            hostedZone: "toucheventos.com.br",
            cdk: {
              certificate: Certificate.fromCertificateArn(
                stack,
                "RegistrationCertificate",
                String(process.env.DOMAIN_CERT_ARM)
              ),
            },
          }
        : undefined,
    routes: {
      "GET /plans": {
        function: {
          handler: "packages/functions/src/plans/plans.handler",
          environment: { TABLE_NAME: plansTable.tableName },
          permissions: [plansTable],
        },
      },
      "GET /verifications": {
        function: {
          handler: "packages/functions/src/verifications/verifications.handler",
          environment: { TABLE_NAME: verificationsTable.tableName },
          permissions: [verificationsTable],
        },
      },
      "POST /contact": {
        function: {
          handler: "packages/functions/src/site/contact.handler",
          permissions: [
            new PolicyStatement({
              actions: ["ses:SendEmail", "SES:SendRawEmail"],
              resources: ["*"],
            }),
          ],
        },
      },
      "GET /register/activity/{slug}": {
        function: {
          handler: "packages/functions/src/register/activity-by-slug.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            ACTIVITIES_REGISTER_TABLE_NAME: activitiesRegisterTable.tableName,
            ACTIVITIES_IMAGES_BUCKET: activitiesImagesBucket.bucketName,
          },
          permissions: [
            activitiesTable,
            verificationsTable,
            activitiesRegisterTable,
            activitiesImagesBucket,
          ],
        },
      },
      "POST /register/registration/{id}": {
        function: {
          handler: "packages/functions/src/register/registration.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            ACTIVITIES_REGISTER_TABLE_NAME: activitiesRegisterTable.tableName,
          },
          permissions: [
            activitiesTable,
            verificationsTable,
            activitiesRegisterTable,
            new PolicyStatement({
              actions: ["ses:SendEmail", "SES:SendRawEmail"],
              resources: ["*"],
            }),
            new PolicyStatement({
              actions: ["sns:SetSMSAttributes", "sns:Publish"],
              resources: ["*"],
            }),
          ],
        },
      },
      "POST /register/confirm/{id}": {
        function: {
          handler: "packages/functions/src/register/confirm.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            ACTIVITIES_REGISTER_TABLE_NAME: activitiesRegisterTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            SURVEY_URL: String(process.env.SURVEY_URL),
          },
          permissions: [
            activitiesTable,
            activitiesRegisterTable,
            verificationsTable,
            new PolicyStatement({
              actions: ["ses:SendEmail", "SES:SendRawEmail"],
              resources: ["*"],
            }),
            new PolicyStatement({
              actions: ["sns:SetSMSAttributes", "sns:Publish"],
              resources: ["*"],
            }),
          ],
        },
      },
      "GET /desk/activity/{slug}": {
        function: {
          handler: "packages/functions/src/desk/activity-by-slug.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            ACTIVITIES_REGISTER_TABLE_NAME: activitiesRegisterTable.tableName,
            ACTIVITIES_IMAGES_BUCKET: activitiesImagesBucket.bucketName,
          },
          permissions: [
            activitiesTable,
            verificationsTable,
            activitiesRegisterTable,
            activitiesImagesBucket,
          ],
        },
      },
      "POST /desk/{id}/access": {
        function: {
          handler: "packages/functions/src/desk/access.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            ACTIVITIES_DESK_TABLE_NAME: activitiesDeskTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [activitiesTable, activitiesDeskTable],
        },
      },
      "POST /desk/{id}/check": {
        function: {
          handler: "packages/functions/src/desk/check.handler",
          environment: {
            ACTIVITIES_DESK_TABLE_NAME: activitiesDeskTable.tableName,
            ACTIVITIES_REGISTER_TABLE_NAME: activitiesRegisterTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [activitiesDeskTable, activitiesRegisterTable],
        },
      },
      "POST /desk/{id}/deliver": {
        function: {
          handler: "packages/functions/src/desk/deliver.handler",
          environment: {
            ACTIVITIES_DESK_TABLE_NAME: activitiesDeskTable.tableName,
            ACTIVITIES_REGISTER_TABLE_NAME: activitiesRegisterTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [activitiesDeskTable, activitiesRegisterTable],
        },
      },
    },
  });

  stack.addOutputs({
    SiteApiEndpoint: siteApi.url,
    SiteApiEndpointDomainUrl: siteApi.customDomainUrl,
  });

  return {
    siteApi,
  };
}
