import { Kysely } from "kysely";
import registerItems from "../../fake-data/activities-register.json" with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  const batchSize = 100;
  for (let i = 0; i < registerItems.length; i += batchSize) {
    const batch = registerItems.slice(i, i + batchSize);
    await db.insertInto("activities_register").values(batch).execute();
  }
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.deleteFrom("activities_register").execute();
}

