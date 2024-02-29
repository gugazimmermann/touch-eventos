import { Kysely } from "kysely";
import surveyQuestionItems from '../../fake-data/activities-survey-default-answer.json' with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db
    .insertInto("activities_survey_default_answer")
    .values(surveyQuestionItems)
    .execute()
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.deleteFrom("activities_survey_default_answer").execute();
}

