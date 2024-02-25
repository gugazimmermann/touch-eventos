import { Kysely } from "kysely";
import deskItems from '../../fake-data/activities-desk.json' with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db
    .insertInto("activities_desk")
    .values(deskItems)
    .execute()
}

