import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
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
    .addColumn("questionId", "varchar(255)", (col) => col.notNull())
    .addColumn("answer", "varchar(255)")
    .addColumn("language", "varchar(255)", (col) => col.notNull())
    .addColumn("order", "integer")
    .addColumn("active", "boolean", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable("activities_survey_default_question").execute();
  await db.schema.dropTable("activities_survey_default_answer").execute();
}
