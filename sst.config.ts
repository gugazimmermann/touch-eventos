import { SSTConfig } from "sst";
import { DynamoDBStack } from "./stacks/DynamoDBStack";
import { ApiStack } from "./stacks/ApiStack";
import { FrontendStack } from "./stacks/FrontendStack";
import { CognitoStack } from "./stacks/CognitoStack";

export default {
  config(_input) {
    return {
      name: "touch-eventos",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app
      .stack(DynamoDBStack)
      .stack(CognitoStack)
      .stack(ApiStack)
      .stack(FrontendStack);
  },
} satisfies SSTConfig;
