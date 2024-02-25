import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
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
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable("activities_register").execute();
}
