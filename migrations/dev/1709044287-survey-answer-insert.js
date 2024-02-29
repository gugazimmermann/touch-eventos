import { Kysely } from "kysely";
import surveyAnswerItems from '../../fake-data/activities-survey-activity-answer.json' with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db
    .insertInto("activities_survey_answer")
    .values(surveyAnswerItems)
    .execute()
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.deleteFrom("activities_survey_answer").execute();
}

