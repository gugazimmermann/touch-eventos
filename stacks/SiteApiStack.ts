import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { StackContext, use, Api } from "sst/constructs";
import { DynamoDBStack } from "./DynamoDBStack";

export function SiteApiStack({ stack }: StackContext) {
  const { plansTable, verificationsTable } = use(DynamoDBStack);

  const siteApi = new Api(stack, "SiteApi", {
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
    },
  });

  stack.addOutputs({
    SiteApiEndpoint: siteApi.url,
  });

  return {
    siteApi,
  };
}
