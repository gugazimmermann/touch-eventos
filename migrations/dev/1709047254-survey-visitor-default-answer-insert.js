import { Kysely } from "kysely";
import activityVisitorsDefaultAnswers from '../../fake-data/activity-visitors-default-answers.json' with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  const batchSize = 100;
  for (let i = 0; i < activityVisitorsDefaultAnswers.length; i += batchSize) {
    const batch = activityVisitorsDefaultAnswers.slice(i, i + batchSize);
    await db.insertInto("activities_visitors_default_survey").values(batch).execute();
  }
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.deleteFrom("activities_visitors_default_survey").execute();
}

