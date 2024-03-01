import { StackContext, Bucket } from "sst/constructs";
import { RemovalPolicy } from "aws-cdk-lib/core";
import * as s3 from "aws-cdk-lib/aws-s3";

export function BucketdStack({ stack, app }: StackContext) {
  const devBucket = {
    autoDeleteObjects: true,
    removalPolicy: RemovalPolicy.DESTROY,
  };

  const prodBucket = s3.Bucket.fromBucketArn(stack, "ImagesBucket", "arn:aws:s3:::images.toucheventos.com.br");

  const activitiesImagesBucket = new Bucket(stack, "ActivitiesImagesBucket", {
    cdk: {
      bucket: stack.stage === "production" ? prodBucket : devBucket,
    },
  });
  stack.addOutputs({
    ActivitiesImagesBucketName: activitiesImagesBucket.bucketName,
  });

  return {
    activitiesImagesBucket,
  };
}
