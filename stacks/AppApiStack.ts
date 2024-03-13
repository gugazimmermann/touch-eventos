import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StackContext, use, Api } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { DatabaseStack } from "./DatabaseStack";

export function AppApiStack({ stack }: StackContext) {
  const { activitiesTable } = use(DynamoDBStack);
  const { database } = use(DatabaseStack);

  const appApi = new Api(stack, "AppApi", {
    customDomain:
      stack.stage === "production"
        ? {
            domainName: "app-api.toucheventos.com.br",
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
      "POST /lobby/auth/{slug}": {
        function: {
          handler: "packages/functions/src/app/lobby/auth.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          permissions: [activitiesTable],
          bind: [database],
        },
      },
      "POST /lobby/types/{activityId}": {
        function: {
          handler: "packages/functions/src/app/lobby/types.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /lobby/sync-get/{activityId}/{limit}/{offset}": {
        function: {
          handler: "packages/functions/src/app/lobby/sync-get.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /lobby/ticket/{activityId}": {
        function: {
          handler: "packages/functions/src/app/lobby/ticket.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
      "POST /lobby/validate/{activityId}": {
        function: {
          handler: "packages/functions/src/app/lobby/validate.handler",
          environment: {
            JWT_SECRET: String(process.env.JWT_SECRET),
          },
          bind: [database],
        },
      },
    },
  });

  stack.addOutputs({
    AppApiEndpoint: appApi.url,
    AooApiEndpointDomainUrl: appApi.customDomainUrl,
  });

  return {
    appApi,
  };
}
