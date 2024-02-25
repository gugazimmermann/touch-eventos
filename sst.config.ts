import { SSTConfig } from "sst";
import { BucketdStack } from "./stacks/BucketStack";
import { DynamoDBStack } from "./stacks/DynamoDBStack";
import { DatabaseStack } from "./stacks/DatabaseStack";
import { CognitoStack } from "./stacks/CognitoStack";
import { ApiStack } from "./stacks/ApiStack";
import { SiteApiStack } from "./stacks/SiteApiStack";
import { FrontendStack } from "./stacks/FrontendStack";

export default {
  config(_input) {
    return {
      name: "touch-eventos",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app
      .stack(BucketdStack)
      .stack(DynamoDBStack)
      .stack(DatabaseStack)
      .stack(CognitoStack)
      .stack(ApiStack)
      .stack(SiteApiStack)
      .stack(FrontendStack);
  },
} satisfies SSTConfig;
