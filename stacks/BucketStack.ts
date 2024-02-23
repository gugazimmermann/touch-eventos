import { StackContext, Bucket } from "sst/constructs";
import { RemovalPolicy } from "aws-cdk-lib/core";

export function BucketdStack({ stack, app }: StackContext) {
  const activitiesImagesBucket = new Bucket(stack, "ActivitiesImagesBucket", {
    cdk: {
      bucket: {
        bucketName: stack.stage === "production" ? "images.toucheventos.com.br" : undefined,
        autoDeleteObjects: stack.stage !== "production",
        removalPolicy:
          stack.stage === "production"
            ? RemovalPolicy.RETAIN
            : RemovalPolicy.DESTROY,
      },
    },
  });
  stack.addOutputs({
    ActivitiesImagesBucketName: activitiesImagesBucket.bucketName,
  });

  return {
    activitiesImagesBucket,
  };
}
