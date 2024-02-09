import { StaticSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
import { CognitoStack } from "./CognitoStack";

export function FrontendStack({ stack, app }: StackContext) {
  const { api } = use(ApiStack);
  const { cognito } = use(CognitoStack);

  const frontend = new StaticSite(stack, "Frontend", {
    path: "packages/frontend",
    buildCommand: "npm run build",
    buildOutput: "build",
    environment: {
      REACT_APP_SITE_TITLE: "Touch Eventos",
      REACT_APP_API_URL: api.url,
      REACT_APP_AWS_REGION: app.region,
      REACT_APP_USER_POOL_ID: cognito.userPoolId,
      REACT_APP_USER_POOL_CLIENT_ID: cognito.userPoolClientId,
    },
  });

  stack.addOutputs({
    FrontendUrl: frontend.url,
  });
}
