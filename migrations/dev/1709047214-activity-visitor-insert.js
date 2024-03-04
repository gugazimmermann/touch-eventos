import { Kysely } from "kysely";
import activitiesVisitors from '../../fake-data/activity-visitors.json' with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  const batchSize = 100;
  for (let i = 0; i < activitiesVisitors.length; i += batchSize) {
    const batch = activitiesVisitors.slice(i, i + batchSize);
    await db.insertInto("activities_visitors").values(batch).execute();
  }
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.deleteFrom("activities_visitors").execute();
}

