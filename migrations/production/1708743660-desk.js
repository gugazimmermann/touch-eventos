import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db.schema
    .createTable("activities_desk")
    .addColumn("deskId", "varchar(255)", (col) => col.notNull())
    .addColumn("activityId", "varchar(255)", (col) => col.notNull())
    .addColumn("user", "varchar(255)", (col) => col.notNull())
    .addColumn("accessCode", "varchar(255)", (col) => col.notNull())
    .addColumn("createdAt", "datetime", (col) => col.notNull())
    .addColumn("active", "boolean", (col) => col.notNull())
    .execute();
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.schema.dropTable("activities_desk").execute();
}
