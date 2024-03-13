const activitiesLobbyItens = [
  {
    lobbyId: 1,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    user: "guga",
    accessCode: "123",
    createdAt: "2024-03-01 01:00:00",
    active: 1,
  },
];

const activitiesTicketsTypesItens = [
  {
    ticketTypeId: 1,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    value: "0.00",
    name: "Meia Entrada - Estudante",
    quantity: 666,
    description: "Necessário aprensentação da Carteirinha de Estudante.",
    lobbyInstructions: "Verificar Carteirinha de Estudante.",
    validAt: "2024-03-10 23:59:59",
    createdAt: "2024-03-01 01:00:00",
    active: 1,
  },
];

const activitiesVisitor = [
  {
    visitorId: 1011,
    name: "José Augusto Zimmermann de Negreiros",
    email: "gugazimmermann@gmail.com",
    phone: "+5547988704247",
    state: "SC",
    city: "Itajaí",
    document: "006.749.029-80",
    createdAt: "2024-03-02 22:54:00",
  },
];

const activitiesTicketsVisitorsItens = [
  {
    ticketId: 1,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    visitorId: 1011,
    ticketTypeId: 1,
    validAt: "2024-03-10 23:59:59",
    createdAt: "2024-03-01 01:00:00",
    active: 1,
  },
];

async function up(db) {
  await db.schema
    .createTable("activities_lobby")
    .addColumn("lobbyId", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("user", "varchar(255)", (col) => col.notNull())
    .addColumn("accessCode", "varchar(255)", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .addColumn("active", "boolean", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_tickets_types")
    .addColumn("ticketTypeId", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("value", "float", (col) => col.notNull())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("quantity", "integer")
    .addColumn("description", "varchar(255)")
    .addColumn("lobbyInstructions", "varchar(255)")
    .addColumn("validAt", "datetime", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .addColumn("active", "boolean", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_tickets_visitors")
    .addColumn("ticketId", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("visitorId", "integer", (col) => col.notNull())
    .addColumn("ticketTypeId", "integer", (col) => col.notNull())
    .addColumn("validAt", "datetime", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .addColumn("active", "boolean", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_tickets_visitors_used")
    .addColumn("ticketUsedId", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("ticketId", "integer", (col) => col.notNull())
    .addColumn("lobbyId", "integer", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();

  await db
    .insertInto("activities_lobby")
    .values(activitiesLobbyItens)
    .execute();

  await db
    .insertInto("activities_tickets_types")
    .values(activitiesTicketsTypesItens)
    .execute();

  await db
    .insertInto("activities_visitors")
    .values(activitiesVisitor)
    .execute();

  await db
    .insertInto("activities_tickets_visitors")
    .values(activitiesTicketsVisitorsItens)
    .execute();
}

async function down(db) {
  await db.schema.dropTable("activities_lobby").execute();
  await db.schema.dropTable("activities_tickets_types").execute();
  await db.schema.dropTable("activities_tickets_visitors").execute();
  await db.schema.dropTable("activities_tickets_visitors_used").execute();
  await db.deleteFrom("activities_lobby").execute();
  await db.deleteFrom("activities_tickets_types").execute();
  await db.deleteFrom("activities_tickets_visitors").execute();
  await db.deleteFrom("activities_tickets_visitors_used").execute();
}

module.exports = { up, down };
