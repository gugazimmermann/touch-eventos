import { StackContext, RDS } from "sst/constructs";
import * as secretsManager from "aws-cdk-lib/aws-secretsmanager";

export function DatabaseStack({ stack }: StackContext) {

  const database = new RDS(stack, "Database", {
    engine: "mysql5.7",
    defaultDatabaseName: String(process.env.RDS_DATABASE),
    migrations: stack.stage === "production" ? "./migrations/production" : "./migrations/dev",
  });

  stack.addOutputs({
    databaseName: database.defaultDatabaseName,
    databaseClusterIdentifier: database.clusterIdentifier,
    databaseSecretARN: database.secretArn
  });

  return {
    database
  };
}
