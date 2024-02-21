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
      SlugIndex: { partitionKey: "slug" },
    },
  });

  const eventsRegisterTable = new Table(stack, "EventsRegister", {
    fields: {
      registrationId: "string",
      eventId: "string",
      email: "string",
      phone: "string",
      language: "string",
      code: "string",
      confirmed: "string",
      gift: "string",
      deskId: "string",
      createdAt: "string",
      eventRegisterHash: "string",
    },
    primaryIndex: { partitionKey: "registrationId" },
    globalIndexes: {
      EventIndex: { partitionKey: "eventId" },
      EventDateIndex: { partitionKey: "eventId", sortKey: "createdAt" },
      eventRegisterHash: { partitionKey: "eventRegisterHash" },
    },
  });

  const eventsSurveyTable = new Table(stack, "EventsSurvey", {
    fields: {
      surveyId: "string",
      eventId: "string",
      language: "string",
      createdAt: "string",
    },
    primaryIndex: { partitionKey: "surveyId" },
    globalIndexes: {
      EventIndex: { partitionKey: "eventId" },
      EventDateIndex: { partitionKey: "eventId", sortKey: "createdAt" },
      LanguageIndex: { partitionKey: "language" },
    },
  });

  const eventsDeskTable = new Table(stack, "EventsDesk", {
    fields: {
      deskId: "string",
      eventId: "string",
      user: "string",
      accessCode: "string",
      createdAt: "string",
      active: "number",
    },
    primaryIndex: { partitionKey: "deskId" },
    globalIndexes: {
      EventIndex: { partitionKey: "eventId" },
      UserIndex: { partitionKey: "user" },
    },
  });

  stack.addOutputs({
    PlansTableName: plansTable.tableName,
    VerificationsTableName: verificationsTable.tableName,
    UsersTableName: usersTable.tableName,
    UsersSubscriptionTable: usersSubscriptionTable.tableName,
    PaymentsTableName: paymentsTable.tableName,
    EventsTableName: eventsTable.tableName,
    EventsRegisterTableName: eventsRegisterTable.tableName,
    EventsSurveyTable: eventsSurveyTable.tableName,
    EventsDeskTable: eventsDeskTable.tableName,
    
  });

  return {
    plansTable,
    verificationsTable,
    usersTable,
    usersSubscriptionTable,
    paymentsTable,
    eventsTable,
    eventsRegisterTable,
    eventsSurveyTable,
    eventsDeskTable
  };
}
