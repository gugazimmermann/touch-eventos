async function up(db) {
  await db.schema
    .createTable("activities_desk")
    .addColumn("deskId", "varchar(255)", (col) => col.notNull())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("user", "varchar(255)", (col) => col.notNull())
    .addColumn("accessCode", "varchar(255)", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .addColumn("active", "boolean", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_register")
    .addColumn("registrationId", "varchar(255)", (col) => col.notNull())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("email", "varchar(255)")
    .addColumn("phone", "varchar(255)")
    .addColumn("language", "varchar(255)", (col) => col.notNull())
    .addColumn("code", "varchar(255)", (col) => col.notNull())
    .addColumn("confirmed", "datetime")
    .addColumn("gift", "datetime")
    .addColumn("deskId", "varchar(255)")
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .addColumn("activityRegisterHash", "varchar(255)", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_survey_default_question")
    .addColumn("questionId", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    .addColumn("question", "varchar(255)", (col) => col.notNull())
    .addColumn("required", "boolean")
    .addColumn("type", "varchar(255)", (col) => col.notNull())
    .addColumn("language", "varchar(255)", (col) => col.notNull())
    .addColumn("order", "integer")
    .addColumn("active", "boolean", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_survey_default_answer")
    .addColumn("answerId", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("questionId", "integer", (col) => col.notNull())
    .addColumn("answer", "varchar(255)")
    .addColumn("language", "varchar(255)", (col) => col.notNull())
    .addColumn("order", "integer")
    .addColumn("active", "boolean", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_survey_question")
    .addColumn("questionId", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("question", "varchar(255)", (col) => col.notNull())
    .addColumn("required", "boolean")
    .addColumn("type", "varchar(255)", (col) => col.notNull())
    .addColumn("language", "varchar(255)", (col) => col.notNull())
    .addColumn("order", "integer")
    .addColumn("active", "boolean", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_survey_answer")
    .addColumn("answerId", "integer", (col) => col.autoIncrement().primaryKey())
    .addColumn("questionId", "integer", (col) => col.notNull())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("answer", "varchar(255)")
    .addColumn("language", "varchar(255)", (col) => col.notNull())
    .addColumn("order", "integer")
    .addColumn("active", "boolean", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_visitors")
    .addColumn("visitorId", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("email", "varchar(255)", (col) => col.notNull())
    .addColumn("phone", "varchar(255)", (col) => col.notNull())
    .addColumn("state", "varchar(255)", (col) => col.notNull())
    .addColumn("city", "varchar(255)", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_visitors_default_survey")
    .addColumn("visitorAnswerId", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    .addColumn("visitorId", "integer", (col) => col.notNull())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("registrationId", "varchar(255)", (col) => col.notNull())
    .addColumn("questionId", "integer", (col) => col.notNull())
    .addColumn("answerId", "integer")
    .addColumn("custonAnswer", "varchar(255)")
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("activities_visitors_survey")
    .addColumn("visitorAnswerId", "integer", (col) =>
      col.autoIncrement().primaryKey()
    )
    .addColumn("visitorId", "integer", (col) => col.notNull())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("registrationId", "varchar(255)", (col) => col.notNull())
    .addColumn("questionId", "integer", (col) => col.notNull())
    .addColumn("answerId", "integer")
    .addColumn("custonAnswer", "varchar(255)")
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();
}

async function down(db) {
  await db.schema.dropTable("activities_desk").execute();
  await db.schema.dropTable("activities_register").execute();
  await db.schema.dropTable("activities_survey_default_question").execute();
  await db.schema.dropTable("activities_survey_default_answer").execute();
  await db.schema.dropTable("activities_survey_question").execute();
  await db.schema.dropTable("activities_survey_answer").execute();
  await db.schema.dropTable("activities_visitors").execute();
  await db.schema.dropTable("activities_visitors_default_survey").execute();
  await db.schema.dropTable("activities_visitors_survey").execute();
}

module.exports = { up, down };
