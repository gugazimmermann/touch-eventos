import { StackContext, use, Api } from "sst/constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { DynamoDBStack } from "./DynamoDBStack";
import { CognitoStack } from "./CognitoStack";
import { BucketdStack } from "./BucketStack";

export function ApiStack({ stack }: StackContext) {
  const {
    plansTable,
    verificationsTable,
    usersTable,
    usersSubscriptionTable,
    paymentsTable,
    eventsTable,
    eventsRegisterTable,
    eventsSurveyTable,
    eventsDeskTable,
  } = use(DynamoDBStack);
  const { cognito } = use(CognitoStack);
  const { eventsImagesBucket } = use(BucketdStack);

  const api = new Api(stack, "Api", {
    customDomain: stack.stage === "production" ? {
      domainName: "api-eventos.touchsistemas.com.br",
      hostedZone: "touchsistemas.com.br",
      cdk: {
        certificate: Certificate.fromCertificateArn(
          stack,
          "RegistrationCertificate",
          String(process.env.DOMAIN_CERT_ARM)
        ),
      },
    }: undefined,
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
          handler: "packages/functions/src/user/userUpdate.handler",
          environment: {
            USERS_TABLE_NAME: usersTable.tableName,
            STRIPE_TOKEN: String(process.env.STRIPE_TOKEN),
          },
          permissions: [usersTable],
        },
      },
      "GET /user/payments": {
        function: {
          handler: "packages/functions/src/user/payments.handler",
          environment: { PAYMENTS_TABLE_NAME: paymentsTable.tableName },
          permissions: [paymentsTable],
        },
      },
      "GET /user/subscription": {
        function: {
          handler: "packages/functions/src/user/subscription.handler",
          environment: { USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName },
          permissions: [usersSubscriptionTable],
        },
      },
      "GET /payment/customer-payment-methods": {
        function: {
          handler:
            "packages/functions/src/payment/customerPaymentMethods.handler",
          environment: {
            USER_TABLE_NAME: usersTable.tableName,
            STRIPE_TOKEN: String(process.env.STRIPE_TOKEN),
          },
          permissions: [usersTable],
        },
      },
      "POST /payment/create-payment-intent": {
        function: {
          handler: "packages/functions/src/payment/createPaymentIntent.handler",
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
          handler: "packages/functions/src/plans/planById.handler",
          environment: { PLANS_TABLE_NAME: plansTable.tableName },
          permissions: [plansTable],
        },
      },
      "GET /verifications": {
        function: {
          handler: "packages/functions/src/verifications/verifications.handler",
          environment: { VERIFICATIONS_TABLE_NAME: verificationsTable.tableName },
          permissions: [verificationsTable],
        },
      },
      "GET /verifications/{verificationId}": {
        function: {
          handler:
            "packages/functions/src/verifications/verificationById.handler",
          environment: { VERIFICATIONS_TABLE_NAME: verificationsTable.tableName },
          permissions: [verificationsTable],
        },
      },
      "GET /events/list/{archived}": {
        function: {
          handler: "packages/functions/src/events/eventsList.handler",
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
      "GET /events/{eventId}": {
        function: {
          handler: "packages/functions/src/events/eventById.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            PLANS_TABLE_NAME: plansTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
            EVENTS_REGISTER_TABLE_NAME: eventsRegisterTable.tableName,
            EVENTS_SURVEY_TABLE_NAME: eventsSurveyTable.tableName,
            EVENTS_DESK_TABLE_NAME: eventsDeskTable.tableName,
            EVENTS_IMAGES_BUCKET: eventsImagesBucket.bucketName,
          },
          permissions: [
            eventsTable,
            plansTable,
            verificationsTable,
            eventsRegisterTable,
            eventsSurveyTable,
            eventsDeskTable,
            eventsImagesBucket,
          ],
        },
      },
      "GET /events/{eventId}/registers": {
        function: {
          handler: "packages/functions/src/events/eventRegistersById.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            EVENTS_REGISTER_TABLE_NAME: eventsRegisterTable.tableName,
          },
          permissions: [eventsTable, eventsRegisterTable],
        },
      },
      "GET /events/{eventId}/desk": {
        function: {
          handler: "packages/functions/src/events/desk/list.handler",
          environment: {
            EVENTS_DESK_TABLE_NAME: eventsDeskTable.tableName,
          },
          permissions: [eventsDeskTable],
        },
      },
      "GET /events/verify-slug/{slug}": {
        function: {
          handler: "packages/functions/src/events/eventVerifySlug.handler",
          environment: { EVENTS_TABLE_NAME: eventsTable.tableName },
          permissions: [eventsTable],
        },
      },
      "POST /events/create": {
        function: {
          handler: "packages/functions/src/events/eventCreate.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            PAYMENTS_TABLE_NAME: paymentsTable.tableName,
            PLANS_TABLE_NAME: plansTable.tableName,
            USERS_SUBSCRIPTION_TABLE_NAME: usersSubscriptionTable.tableName,
          },
          permissions: [eventsTable, paymentsTable, plansTable, usersSubscriptionTable],
        },
      },
      "POST /events/{eventId}/image": {
        function: {
          handler: "packages/functions/src/events/eventImage.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            EVENTS_IMAGES_BUCKET: eventsImagesBucket.bucketName,
          },
          permissions: [eventsTable, eventsImagesBucket],
        },
      },
      "POST /events/{eventId}/desk": {
        function: {
          handler: "packages/functions/src/events/desk/create.handler",
          environment: {
            EVENTS_TABLE_NAME: eventsTable.tableName,
            EVENTS_DESK_TABLE_NAME: eventsDeskTable.tableName,
          },
          permissions: [eventsTable, eventsDeskTable],
        },
      },
      "PUT /events/{eventId}/desk/{deskId}": {
        function: {
          handler: "packages/functions/src/events/desk/change.handler",
          environment: {
            EVENTS_DESK_TABLE_NAME: eventsDeskTable.tableName,
          },
          permissions: [eventsDeskTable],
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
