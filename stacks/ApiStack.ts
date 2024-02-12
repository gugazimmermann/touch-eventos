import { StackContext, use, Api } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";
import { CognitoStack } from "./CognitoStack";
import { BucketdStack } from "./BucketStack";

export function ApiStack({ stack }: StackContext) {
  const {
    plansTable,
    verificationsTable,
    usersTable,
    paymentsTable,
    eventsTable,
  } = use(DynamoDBStack);
  const { cognito } = use(CognitoStack);
  const { eventsImagesBucket } = use(BucketdStack);

  const api = new Api(stack, "Api", {
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
          environment: { TABLE_NAME: usersTable.tableName },
          permissions: [usersTable],
        },
      },
      "PUT /user": {
        function: {
          handler: "packages/functions/src/user/userUpdate.handler",
          environment: { TABLE_NAME: usersTable.tableName },
          permissions: [usersTable],
        },
      },
      "GET /payments": {
        function: {
          handler: "packages/functions/src/payments/payments.handler",
          environment: { TABLE_NAME: paymentsTable.tableName },
          permissions: [paymentsTable],
        },
      },
      "GET /plans": {
        function: {
          handler: "packages/functions/src/plans/plans.handler",
          environment: { TABLE_NAME: plansTable.tableName },
          permissions: [plansTable],
        },
      },
      "GET /plan/{id}": {
        function: {
          handler: "packages/functions/src/plans/planById.handler",
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
      "GET /verification/{id}": {
        function: {
          handler:
            "packages/functions/src/verifications/verificationById.handler",
          environment: { TABLE_NAME: verificationsTable.tableName },
          permissions: [verificationsTable],
        },
      },
      "POST /events": {
        function: {
          handler: "packages/functions/src/events/eventCreate.handler",
          environment: { TABLE_NAME: eventsTable.tableName },
          permissions: [eventsTable],
        },
      },
      "GET /events/{archived}": {
        function: {
          handler: "packages/functions/src/events/events.handler",
          environment: { TABLE_NAME: eventsTable.tableName },
          permissions: [eventsTable],
        },
      },
      "GET /event/{id}": {
        function: {
          handler: "packages/functions/src/events/eventById.handler",
          environment: {
            TABLE_NAME: eventsTable.tableName,
            PLANS_TABLE_NAME: plansTable.tableName,
            VERIFICATIONS_TABLE_NAME: verificationsTable.tableName,
          },
          permissions: [eventsTable, plansTable, verificationsTable],
        },
      },
      "POST /events/image": {
        function: {
          handler: "packages/functions/src/events/eventImage.handler",
          environment: {
            BUCKET: eventsImagesBucket.bucketName,
          },
          permissions: [eventsImagesBucket],
        },
      },
    },
  });

  cognito.attachPermissionsForAuthUsers(stack, [api]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return {
    api,
  };
}
