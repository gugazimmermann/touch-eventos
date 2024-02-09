import { StackContext, Table } from "sst/constructs";

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
  });

  const eventsTable = new Table(stack, "Events", {
    fields: {
      eventId: "string",
      userId: "string",
      planId: "string",
      verificationId: "string",
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
    primaryIndex: { partitionKey: "eventId" },
    globalIndexes: {
      PlanIdStartDateIndex: { partitionKey: "planId", sortKey: "createdAt" },
      UserIdEndDateIndex: { partitionKey: "userId", sortKey: "startDate" },
      LocationStartDateIndex: {
        partitionKey: "location",
        sortKey: "startDate",
      },
      StateStartDateIndex: { partitionKey: "state", sortKey: "startDate" },
      ActiveIndex: { partitionKey: "active", sortKey: "createdAt" },
    },
  });

  stack.addOutputs({
    PlansTableName: plansTable.tableName,
    VerificationsTableName: verificationsTable.tableName,
    UsersTableName: usersTable.tableName,
    PaymentsTableName: paymentsTable.tableName,
    EventsTableName: eventsTable.tableName,
  });

  return {
    plansTable,
    verificationsTable,
    usersTable,
    paymentsTable,
    eventsTable,
  };
}
