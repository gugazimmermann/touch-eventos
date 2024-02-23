import { Cognito, StackContext, use } from "sst/constructs";
import { RemovalPolicy } from "aws-cdk-lib/core";
import { DynamoDBStack } from "./DynamoDBStack";

export function CognitoStack({ stack }: StackContext) {
  const { usersTable } = use(DynamoDBStack);

  const cognito = new Cognito(stack, "Cognito", {
    login: ["email"],
    cdk: {
      userPool: {
        passwordPolicy: {
          minLength: 6,
          requireLowercase: false,
          requireUppercase: false,
          requireDigits: false,
          requireSymbols: false,
        },
        userVerification: {
          emailSubject: "Touch Eventos - Verificação de Email",
          emailBody: "O seu código de verificação é: {####}",
        },
        removalPolicy:
          stack.stage === "production"
            ? RemovalPolicy.RETAIN
            : RemovalPolicy.DESTROY,
      },
    },
    defaults: {
      function: {
        timeout: 20,
        environment: { USERS_TABLE_NAME: usersTable.tableName },
        permissions: [usersTable],
      },
    },
    triggers: {
      postConfirmation:
        "packages/functions/src/cognito/postConfirmation.handler",
    },
  });

  stack.addOutputs({
    UserPoolId: cognito.userPoolId,
    IdentityPoolId: cognito.cognitoIdentityPoolId,
    UserPoolClientId: cognito.userPoolClientId,
  });

  return {
    cognito,
  };
}
