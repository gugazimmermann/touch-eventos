const surveyQuestionItems = [
  {
    questionId: 1,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Como você ficou sabendo do nosso evento?",
    required: false,
    type: "single",
    language: "pt-BR",
    order: 1,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 2,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Qual é a sua avaliação geral do evento?",
    required: true,
    type: "single",
    language: "pt-BR",
    order: 2,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 3,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Os estandes de expositores atenderam às suas expectativas?",
    required: true,
    type: "single",
    language: "pt-BR",
    order: 3,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 4,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Quais categorias de móveis e decoração mais interessaram você?",
    required: true,
    type: "multiple",
    language: "pt-BR",
    order: 4,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 5,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question:
      "Você realizou alguma compra ou pretende realizar futuramente com base no que viu no evento?",
    required: true,
    type: "single",
    language: "pt-BR",
    order: 5,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 6,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Como você avalia a variedade de food-trucks disponíveis?",
    required: false,
    type: "single",
    language: "pt-BR",
    order: 6,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 7,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question:
      "O entretenimento (bandas tocando) contribuiu para uma experiência positiva no evento?",
    required: false,
    type: "objective",
    language: "pt-BR",
    order: 7,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 8,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Você enfrentou algum problema durante o evento?",
    required: true,
    type: "multiple",
    language: "pt-BR",
    order: 8,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 9,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Você recomendaria o nosso evento para amigos ou familiares?",
    required: true,
    type: "objective",
    language: "pt-BR",
    order: 9,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 10,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Quais melhorias você sugere para a próxima edição do evento?",
    required: false,
    type: "multiple",
    language: "pt-BR",
    order: 10,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
  {
    questionId: 11,
    activityId: "f3420389-26e8-4025-a00b-5080d2684ef3",
    question: "Deseja sugerir alguma outra melhoria?",
    required: false,
    type: "descriptive",
    language: "pt-BR",
    order: 11,
    active: 1,
    createdAt: "2024-02-25 22:33:34",
  },
];

async function up(db) {
  await db
    .insertInto("activities_survey_question")
    .values(surveyQuestionItems)
    .execute();
}

async function down(db) {
  await db.deleteFrom("activities_survey_question").execute();
}

module.exports = { up, down };
