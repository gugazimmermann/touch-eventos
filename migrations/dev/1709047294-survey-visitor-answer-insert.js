import { Kysely } from "kysely";
import activitiesVisitorsSurvey from '../../fake-data/activity-visitors-answers.json' with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  const batchSize = 100;
  for (let i = 0; i < activitiesVisitorsSurvey.length; i += batchSize) {
    const batch = activitiesVisitorsSurvey.slice(i, i + batchSize);
    await db.insertInto("activities_visitors_survey").values(batch).execute();
  }
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.deleteFrom("activities_visitors_survey").execute();
}

