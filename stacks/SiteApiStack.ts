import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StackContext, use, Api } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { BucketdStack } from "./BucketStack";

export function SiteApiStack({ stack }: StackContext) {
  const {
    eventsTable,
    plansTable,
    verificationsTable,
    eventsRegisterTable,
    eventsDeskTable,
  } = use(DynamoDBStack);
  const { eventsImagesBucket } = use(BucketdStack);

  const siteApi = new Api(stack, "SiteApi", {
    customDomain:
      stack.stage === "production"
        ? {
            domainName: "api-site-eventos.touchsistemas.com.br",
            hostedZone: "touchsistemas.com.br",
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
      "GET /event/{slug}": {
        function: {
          handler: "packages/functions/src/register/eventBySlug.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            EVENTS_REGISTER_TABLE_NAME: eventsRegisterTable.tableName,
            EVENTS_IMAGES_BUCKET: eventsImagesBucket.bucketName,
          },
          permissions: [
            eventsTable,
            verificationsTable,
            eventsRegisterTable,
            eventsImagesBucket,
          ],
        },
      },
      "POST /register/{id}": {
        function: {
          handler: "packages/functions/src/register/registerEvent.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            EVENTS_REGISTER_TABLE_NAME: eventsRegisterTable.tableName,
          },
          permissions: [
            eventsTable,
            verificationsTable,
            eventsRegisterTable,
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
      "POST /confirm/{id}": {
        function: {
          handler: "packages/functions/src/register/confirmEvent.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            EVENTS_REGISTER_TABLE_NAME: eventsRegisterTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            SURVEY_URL: String(process.env.SURVEY_URL),
          },
          permissions: [
            eventsTable,
            eventsRegisterTable,
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
      "POST /event/{id}/access": {
        function: {
          handler: "packages/functions/src/desk/access.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            EVENTS_DESK_TABLE_NAME: eventsDeskTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [eventsTable, eventsDeskTable],
        },
      },
      "POST /event/{id}/check": {
        function: {
          handler: "packages/functions/src/desk/check.handler",
          environment: {
            EVENTS_DESK_TABLE_NAME: eventsDeskTable.tableName,
            EVENTS_REGISTER_TABLE_NAME: eventsRegisterTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [eventsDeskTable, eventsRegisterTable],
        },
      },
      "POST /event/{id}/deliver": {
        function: {
          handler: "packages/functions/src/desk/deliver.handler",
          environment: {
            EVENTS_DESK_TABLE_NAME: eventsDeskTable.tableName,
            EVENTS_REGISTER_TABLE_NAME: eventsRegisterTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [eventsDeskTable, eventsRegisterTable],
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
