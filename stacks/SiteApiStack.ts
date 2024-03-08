import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StackContext, use, Api } from "sst/constructs";
import { BucketdStack } from "./BucketStack";
import { DynamoDBStack } from "./DynamoDBStack";
import { DatabaseStack } from "./DatabaseStack";

export function SiteApiStack({ stack }: StackContext) {
  const { activitiesImagesBucket } = use(BucketdStack);
  const { activitiesTable, plansTable, verificationsTable } =
    use(DynamoDBStack);
  const { database } = use(DatabaseStack);

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
            ACTIVITIES_IMAGES_BUCKET: activitiesImagesBucket.bucketName,
          },
          permissions: [
            activitiesTable,
            verificationsTable,
            activitiesImagesBucket,
          ],
          bind: [database],
        },
      },
      "POST /register/registration/{id}": {
        function: {
          handler: "packages/functions/src/register/registration.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
          },
          permissions: [
            activitiesTable,
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
          bind: [database],
        },
      },
      "POST /register/confirm/{id}": {
        function: {
          handler: "packages/functions/src/register/confirm.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            SURVEY_URL: String(process.env.SURVEY_URL),
          },
          permissions: [
            activitiesTable,
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
          bind: [database],
        },
      },
      "GET /desk/activity/{slug}": {
        function: {
          handler: "packages/functions/src/desk/activity-by-slug.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            ACTIVITIES_IMAGES_BUCKET: activitiesImagesBucket.bucketName,
          },
          permissions: [
            activitiesTable,
            verificationsTable,
            activitiesImagesBucket,
          ],
        },
      },
      "POST /desk/{id}/access": {
        function: {
          handler: "packages/functions/src/desk/access.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /desk/{id}/check": {
        function: {
          handler: "packages/functions/src/desk/check.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /desk/{id}/deliver": {
        function: {
          handler: "packages/functions/src/desk/deliver.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "GET /survey/activity/{slug}": {
        function: {
          handler: "packages/functions/src/survey/activity-by-slug.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            ACTIVITIES_IMAGES_BUCKET: activitiesImagesBucket.bucketName,
          },
          permissions: [
            activitiesTable,
            verificationsTable,
            activitiesImagesBucket,
          ],
          bind: [database],
        },
      },
      "POST /survey/auth/{id}": {
        function: {
          handler: "packages/functions/src/survey/auth.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
          },
          permissions: [
            activitiesTable,
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
          bind: [database],
        },
      },
      "POST /survey/confirm/{id}": {
        function: {
          handler: "packages/functions/src/survey/confirm.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [activitiesTable],
          bind: [database],
        },
      },
      "POST /survey/registration/{id}": {
        function: {
          handler: "packages/functions/src/survey/registration-by-id.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /survey/survey/{slug}/default-survey": {
        function: {
          handler: "packages/functions/src/survey/default-survey.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /survey/survey/{slug}/default-answers": {
        function: {
          handler: "packages/functions/src/survey/default-answers.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /survey/survey/{slug}/activity-survey": {
        function: {
          handler: "packages/functions/src/survey/activity-survey.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [activitiesTable],
          bind: [database],
        },
      },
      "POST /survey/survey/{slug}/activity-answers": {
        function: {
          handler: "packages/functions/src/survey/activity-answers.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
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
