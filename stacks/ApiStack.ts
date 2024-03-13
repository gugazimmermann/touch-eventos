import { StackContext, use, Api } from "sst/constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { BucketdStack } from "./BucketStack";
import { CognitoStack } from "./CognitoStack";
import { DynamoDBStack } from "./DynamoDBStack";
import { DatabaseStack } from "./DatabaseStack";

export function ApiStack({ stack }: StackContext) {
  const { activitiesImagesBucket } = use(BucketdStack);
  const { cognito } = use(CognitoStack);
  const {
    plansTable,
    verificationsTable,
    usersTable,
    usersSubscriptionTable,
    paymentsTable,
    activitiesTable,
  } = use(DynamoDBStack);
  const { database } = use(DatabaseStack);

  const api = new Api(stack, "Api", {
    customDomain:
      stack.stage === "production"
        ? {
            domainName: "api.toucheventos.com.br",
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
    authorizers: {
      jwt: {
        type: "user_pool",
        userPool: {
          id: cognito.userPoolId,
          clientIds: [cognito.userPoolClientId],
        },
      },
    },
    defaults: {
      authorizer: "jwt",
    },
    routes: {
      "GET /user": {
        function: {
          handler: "packages/functions/src/user/user.handler",
          environment: { USERS_TABLE_NAME: usersTable.tableName },
          permissions: [usersTable],
        },
      },
      "PUT /user": {
        function: {
          handler: "packages/functions/src/user/user-update.handler",
          environment: {
            USERS_TABLE_NAME: usersTable.tableName,
            STRIPE_TOKEN: String(process.env.STRIPE_TOKEN),
          },
          permissions: [usersTable],
        },
      },
      "GET /user/payments": {
        function: {
          handler: "packages/functions/src/user/user-payments.handler",
          environment: { PAYMENTS_TABLE_NAME: paymentsTable.tableName },
          permissions: [paymentsTable],
        },
      },
      "GET /user/subscription": {
        function: {
          handler: "packages/functions/src/user/user-subscription.handler",
          environment: {
            USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName,
          },
          permissions: [usersSubscriptionTable],
        },
      },
      "GET /payment/customer-payment-methods": {
        function: {
          handler:
            "packages/functions/src/payment/customer-payment-methods.handler",
          environment: {
            USER_TABLE_NAME: usersTable.tableName,
            STRIPE_TOKEN: String(process.env.STRIPE_TOKEN),
          },
          permissions: [usersTable],
        },
      },
      "POST /payment/create-payment-intent": {
        function: {
          handler:
            "packages/functions/src/payment/create-payment-intent.handler",
          environment: {
            PLAN_TABLE_NAME: plansTable.tableName,
            VERIFICATION_TABLE_NAME: verificationsTable.tableName,
            USER_TABLE_NAME: usersTable.tableName,
            STRIPE_TOKEN: String(process.env.STRIPE_TOKEN),
          },
          permissions: [plansTable, verificationsTable, usersTable],
        },
      },
      "GET /plans": {
        function: {
          handler: "packages/functions/src/plans/plans.handler",
          environment: { PLANS_TABLE_NAME: plansTable.tableName },
          permissions: [plansTable],
        },
      },
      "GET /plans/{planId}": {
        function: {
          handler: "packages/functions/src/plans/plan-by-id.handler",
          environment: { PLANS_TABLE_NAME: plansTable.tableName },
          permissions: [plansTable],
        },
      },
      "GET /verifications": {
        function: {
          handler: "packages/functions/src/verifications/verifications.handler",
          environment: {
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
          },
          permissions: [verificationsTable],
        },
      },
      "GET /verifications/{verificationId}": {
        function: {
          handler:
            "packages/functions/src/verifications/verification-by-id.handler",
          environment: {
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
          },
          permissions: [verificationsTable],
        },
      },
      "GET /activities/list/{archived}": {
        function: {
          handler: "packages/functions/src/activities/activities-list.handler",
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
      "POST /activities/create": {
        function: {
          handler: "packages/functions/src/activities/activity-create.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            PAYMENTS_TABLE_NAME: paymentsTable.tableName,
            PLANS_TABLE_NAME: plansTable.tableName,
            USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName,
          },
          permissions: [
            activitiesTable,
            paymentsTable,
            plansTable,
            usersSubscriptionTable,
          ],
        },
      },
      "GET /activities/{activityId}": {
        function: {
          handler: "packages/functions/src/activities/activity-by-id.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            PLANS_TABLE_NAME: plansTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            ACTIVITIES_IMAGES_BUCKET: activitiesImagesBucket.bucketName,
          },
          permissions: [
            activitiesTable,
            plansTable,
            verificationsTable,
            activitiesImagesBucket,
          ],
          bind: [database],
        },
      },
      "PUT /activities/{activityId}/archive": {
        function: {
          handler: "packages/functions/src/activities/activity-archive.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
          },
          permissions: [activitiesTable],
        },
      },
      "PUT /activities/{activityId}/payment": {
        function: {
          handler: "packages/functions/src/activities/activity-payment.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            PAYMENTS_TABLE_NAME: paymentsTable.tableName,
          },
          permissions: [activitiesTable, paymentsTable],
        },
      },
      "GET /activities/verify-slug/{slug}": {
        function: {
          handler: "packages/functions/src/activities/activity-by-slug.handler",
          environment: { ACTIVITIES_TABLE_NAME: activitiesTable.tableName },
          permissions: [activitiesTable],
        },
      },
      "GET /activities/{activityId}/registers": {
        function: {
          handler:
            "packages/functions/src/activities/register/registers-by-activity-id.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName,
          },
          permissions: [activitiesTable, usersSubscriptionTable],
          bind: [database],
        },
      },
      "GET /activities/{activityId}/desk": {
        function: {
          handler:
            "packages/functions/src/activities/desk/desks-by-activity-id.handler",
          bind: [database],
        },
      },
      "POST /activities/{activityId}/image": {
        function: {
          handler: "packages/functions/src/activities/activity-image.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            ACTIVITIES_IMAGES_BUCKET: activitiesImagesBucket.bucketName,
          },
          permissions: [activitiesTable, activitiesImagesBucket],
        },
      },
      "POST /activities/{activityId}/desk": {
        function: {
          handler: "packages/functions/src/activities/desk/desk-create.handler",
          bind: [database],
        },
      },
      "PUT /activities/{activityId}/desk/{deskId}": {
        function: {
          handler: "packages/functions/src/activities/desk/desk-status.handler",
          bind: [database],
        },
      },
      "POST /activities/{activityId}/survey": {
        function: {
          handler:
            "packages/functions/src/activities/survey/survey-create.handler",
          bind: [database],
        },
      },
      "GET /activities/{activityId}/survey/{lang}": {
        function: {
          handler:
            "packages/functions/src/activities/survey/survey-by-activity-id.handler",
          bind: [database],
        },
      },
      "GET /activities/{activityId}/default-survey": {
        function: {
          handler:
            "packages/functions/src/activities/survey/default-survey.handler",
          bind: [database],
        },
      },
      "GET /activities/{activityId}/survey/registers": {
        function: {
          handler:
            "packages/functions/src/activities/survey/registers-by-activity-id.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName,
          },
          permissions: [activitiesTable, usersSubscriptionTable],
          bind: [database],
        },
      },
      "GET /activities/{activityId}/default-survey-anwsers": {
        function: {
          handler:
            "packages/functions/src/activities/survey/default-survey-anwsers-by-activity-id.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName,
          },
          permissions: [activitiesTable, usersSubscriptionTable],
          bind: [database],
        },
      },
      "GET /activities/{activityId}/survey/{lang}/anwsers": {
        function: {
          handler:
            "packages/functions/src/activities/survey/survey-anwsers-by-activity-id.handler",
          environment: {
            ACTIVITIES_TABLE_NAME: activitiesTable.tableName,
            USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName,
          },
          permissions: [activitiesTable, usersSubscriptionTable],
          bind: [database],
        },
      },
      "GET /activities/{activityId}/survey/{lang}/register-download-count": {
        function: {
          handler:
            "packages/functions/src/activities/survey/survey-anwsers-registers-download-count.handler",
          bind: [database],
        },
      },
      "GET /activities/{activityId}/survey/{lang}/register-download/{limit}/{offset}":
        {
          function: {
            handler:
              "packages/functions/src/activities/survey/survey-anwsers-registers-download.handler",
            bind: [database],
          },
        },
      "GET /activities/{activityId}/survey/{lang}/default-download-count": {
        function: {
          handler:
            "packages/functions/src/activities/survey/survey-anwsers-default-download-count.handler",
          bind: [database],
        },
      },
      "GET /activities/{activityId}/survey/{lang}/default-download/{limit}/{offset}":
        {
          function: {
            handler:
              "packages/functions/src/activities/survey/survey-anwsers-default-download.handler",
            bind: [database],
          },
        },
      "GET /activities/{activityId}/survey/{lang}/activity-download-count": {
        function: {
          handler:
            "packages/functions/src/activities/survey/survey-anwsers-activity-download-count.handler",
          bind: [database],
        },
      },
      "GET /activities/{activityId}/survey/{lang}/activity-download/{limit}/{offset}":
        {
          function: {
            handler:
              "packages/functions/src/activities/survey/survey-anwsers-activity-download.handler",
            bind: [database],
          },
        },
    },
  });

  cognito.attachPermissionsForAuthUsers(stack, [api]);

  stack.addOutputs({
    ApiEndpoint: api.url,
    ApiEndpointDomainUrl: api.customDomainUrl,
  });

  return {
    api,
  };
}
