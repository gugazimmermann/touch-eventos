import { StackContext, Table } from "sst/constructs";
import { RemovalPolicy } from "aws-cdk-lib/core";

export function DynamoDBStack({ stack }: StackContext) {
  const plansTable = new Table(stack, "Plans", {
    fields: {
      planId: "string",
      order: "number",
      type: "string",
      duration: "string",
      maxDays: "number",
      maxDiff: "number",
      description: "string",
      price: "string",
      createdAt: "string",
      active: "number",
    },
    primaryIndex: { partitionKey: "planId" },
    globalIndexes: {
      ActiveIndex: { partitionKey: "active", sortKey: "order" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const verificationsTable = new Table(stack, "Verifications", {
    fields: {
      verificationId: "string",
      order: "number",
      type: "string",
      description: "string",
      price: "string",
      createdAt: "string",
      active: "number",
    },
    primaryIndex: { partitionKey: "verificationId" },
    globalIndexes: {
      ActiveIndex: { partitionKey: "active", sortKey: "order" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const usersTable = new Table(stack, "Users", {
    fields: {
      userId: "string",
      email: "string",
      createdAt: "string",
      active: "number",
    },
    primaryIndex: { partitionKey: "userId" },
    globalIndexes: {
      EmailIndex: { partitionKey: "email" },
      ActiveIndex: { partitionKey: "active", sortKey: "createdAt" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const usersSubscriptionTable = new Table(stack, "UsersSubscription", {
    fields: {
      usersSubscriptionId: "string",
      userId: "string",
      paymentId: "string",
      planId: "string",
      startDate: "string",
      endDate: "string",
    },
    primaryIndex: { partitionKey: "usersSubscriptionId" },
    globalIndexes: {
      UserIndex: { partitionKey: "userId", sortKey: "endDate" },
      PlanIndex: { partitionKey: "planId", sortKey: "endDate" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });
  
  const paymentsTable = new Table(stack, "Payments", {
    fields: {
      paymentId: "string",
      userId: "string",
      date: "string",
      plan: "string",
      value: "string",
      status: "string",
    },
    primaryIndex: { partitionKey: "paymentId" },
    globalIndexes: {
      UserIdIndex: { partitionKey: "userId", sortKey: "date" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const activitiesTable = new Table(stack, "Activities", {
    fields: {
      activityId: "string",
      userId: "string",
      planId: "string",
      verificationId: "string",
      slug: "string",
      visitorGift: "number",
      raffle: "number",
      raffleType: "string",
      startDate: "string",
      endDate: "string",
      city: "string",
      state: "string",
      location: "string",
      createdAt: "string",
      active: "number",
    },
    primaryIndex: { partitionKey: "activityId" },
    globalIndexes: {
      PlanIdStartDateIndex: { partitionKey: "planId", sortKey: "createdAt" },
      UserIdEndDateIndex: { partitionKey: "userId", sortKey: "startDate" },
      LocationStartDateIndex: {
        partitionKey: "location",
        sortKey: "startDate",
      },
      StateStartDateIndex: { partitionKey: "state", sortKey: "startDate" },
      ActiveIndex: { partitionKey: "active", sortKey: "createdAt" },
      SlugIndex: { partitionKey: "slug" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const activitiesRegisterTable = new Table(stack, "ActivitiesRegister", {
    fields: {
      registrationId: "string",
      activityId: "string",
      email: "string",
      phone: "string",
      language: "string",
      code: "string",
      confirmed: "string",
      gift: "string",
      deskId: "string",
      createdAt: "string",
      activityRegisterHash: "string",
    },
    primaryIndex: { partitionKey: "registrationId" },
    globalIndexes: {
      ActivityIndex: { partitionKey: "activityId" },
      ActivityDateIndex: { partitionKey: "activityId", sortKey: "createdAt" },
      ActivityRegisterHash: { partitionKey: "activityRegisterHash" },
      DeskIdIndex: { partitionKey: "deskId" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const activitiesSurveyTable = new Table(stack, "ActivitiesSurvey", {
    fields: {
      surveyId: "string",
      activityId: "string",
      language: "string",
      createdAt: "string",
    },
    primaryIndex: { partitionKey: "surveyId" },
    globalIndexes: {
      ActivityIndex: { partitionKey: "activityId" },
      ActivityDateIndex: { partitionKey: "activityId", sortKey: "createdAt" },
      LanguageIndex: { partitionKey: "language" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  const activitiesDeskTable = new Table(stack, "ActivitiesDesk", {
    fields: {
      deskId: "string",
      activityId: "string",
      user: "string",
      accessCode: "string",
      createdAt: "string",
      active: "number",
    },
    primaryIndex: { partitionKey: "deskId" },
    globalIndexes: {
      ActivityIndex: { partitionKey: "activityId" },
      UserIndex: { partitionKey: "user" },
    },
    cdk: {
      table: {
        removalPolicy: stack.stage === "production"  ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
    },
  });

  stack.addOutputs({
    PlansTableName: plansTable.tableName,
    VerificationsTableName: verificationsTable.tableName,
    UsersTableName: usersTable.tableName,
    UsersSubscriptionTable: usersSubscriptionTable.tableName,
    PaymentsTableName: paymentsTable.tableName,
    ActivitiesTableName: activitiesTable.tableName,
    ActivitiesRegisterTableName: activitiesRegisterTable.tableName,
    ActivitiesSurveyTable: activitiesSurveyTable.tableName,
    ActivitiesDeskTable: activitiesDeskTable.tableName,
  });

  return {
    plansTable,
    verificationsTable,
    usersTable,
    usersSubscriptionTable,
    paymentsTable,
    activitiesTable,
    activitiesRegisterTable,
    activitiesSurveyTable,
    activitiesDeskTable
  };
}
