import { Kysely } from "kysely";
import surveyQuestionItems from '../../fake-data/activities-survey-default-question.json' with { type: "json" };

/**
 * @param db {Kysely<any>}
 */
export async function up(db) {
  await db
    .insertInto("activities_survey_default_question")
    .values(surveyQuestionItems)
    .execute()
}

/**
 * @param db {Kysely<any>}
 */
export async function down(db) {
  await db.deleteFrom("activities_survey_default_question").execute();
}

