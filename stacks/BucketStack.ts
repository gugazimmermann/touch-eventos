import { StackContext, Bucket } from "sst/constructs";

export function BucketdStack({ stack, app }: StackContext) {

  const eventsImagesBucket = new Bucket(stack, "EventsImagesBucket");

  stack.addOutputs({
    eventsImagesBucketName: eventsImagesBucket.bucketName,
  });

  return {
    eventsImagesBucket,
  };
}
