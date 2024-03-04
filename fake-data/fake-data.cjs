const { faker } = require("@faker-js/faker/locale/pt_BR");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { generateRandomDate, addMinutes } = require("./time-helper.cjs");
const estadosCidades = require("./estados-e-cidades.json");
const activitiesSurveyDefaultQuestions = require("./activities-survey-default-question.json");
const activitiesSurveyDefaultAnswers = require("./activities-survey-default-answer.json");

const activitiesSurveyQuestions = require("./activities-survey-activity-question.json");
const activitiesSurveyAnswers = require("./activities-survey-activity-answer.json");

const estados = estadosCidades.estados.map((e) => e.sigla);
const cidadesProximas = [
  "Balneário Camboriú",
  "Camboriú",
  "Brusque",
  "Blumenau",
  "Itapema",
  "Porto Belo",
  "Navegantes",
  "Piçarras",
  "Barra Velha",
  "Penha",
];

function seeCity(state) {
  const random = faker.number.int(100);
  const cities = estadosCidades.estados.find((e) => e.sigla === state).cidades;
  if (state === "SC") {
    if (random < 70) {
      return "Itajaí";
    } else if (random < 90) {
      return cidadesProximas[faker.number.int(cidadesProximas.length - 1)];
    }
  }
  return cities[faker.number.int(cities.length - 1)];
}

function generateDesk(activityId, quantity) {
  const deskItems = [];
  for (let i = 0; i < quantity; i++) {
    const user = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const deskItem = {
      activityId,
      deskId: uuidv4(),
      active: faker.number.int(100) > 90 ? 0 : 1,
      createdAt: "2024-03-01 01:00:00",
      user: faker.internet
        .userName({
          firstName: user.firstName,
          lastName: user.lastName,
        })
        .toLocaleLowerCase(),
      accessCode: faker.internet
        .password({ length: 6, memorable: true })
        .toLocaleLowerCase(),
    };
    deskItems.push(deskItem);
  }
  return deskItems;
}

function generateRegister(deskItems, registerType, quantity) {
  const registerItems = [];
  for (let i = 0; i < quantity; i++) {
    const now = generateRandomDate(
      "2024-03-01T00:00:00",
      "2024-03-04T00:00:00"
    );
    const confirmedDate = addMinutes(now, faker.number.int(60));
    const hasConfirmed =
      faker.number.int(100) <= 70
        ? confirmedDate.toISOString().slice(0, 19).replace("T", " ")
        : null;
    const hasGift =
      faker.number.int(100) <= 70
        ? addMinutes(confirmedDate, faker.number.int(120))
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : null;
    const deskItem = deskItems[Math.floor(Math.random() * deskItems.length)];
    const user = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const email = faker.internet
      .email({
        firstName: user.firstName,
        lastName: user.lastName,
      })
      .toLocaleLowerCase();

    const phone = `+55${faker.string.numeric(11)}`;

    const registerItem = {
      activityId: deskItem.activityId,
      registrationId: uuidv4(),
      email: registerType === "EMAIL" ? email : null,
      phone: registerType === "SMS" ? phone : null,
      language: "pt-BR",
      code: faker.string.numeric(6),
      confirmed: hasConfirmed,
      gift: hasConfirmed ? hasGift : null,
      deskId: hasGift ? deskItem.deskId : "-",
      createdAt: now.toISOString().slice(0, 19).replace("T", " "),
      activityRegisterHash: `${deskItem.activityId}#${
        registerType === "EMAIL" ? email : phone
      }`,
    };
    registerItems.push(registerItem);
  }
  return registerItems;
}

function generateVisitors(activityId, confirmedRegisters) {
  const activitiesVisitors = [];
  const activitiesVisitorsDefaultAnswers = [];
  const activitiesVisitorsAnswers = [];
  let index = 0;

  for (let confirmedRegister of confirmedRegisters) {
    if (faker.number.int(100) <= 75) {
      index++;
      const answerDate = generateRandomDate(
        confirmedRegister.confirmed.replace(" ", "T"),
        "2024-03-04T00:00:00"
      );
      const user = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      const email = faker.internet
        .email({ firstName: user.firstName, lastName: user.lastName })
        .toLocaleLowerCase();
      const phone = confirmedRegister.phone;
      const visitorEstate =
        faker.number.int(100) < 70
          ? "SC"
          : estados[faker.number.int(estados.length - 1)];
      const visitorCity = seeCity(visitorEstate);

      const activitiesVisitor = {
        visitorId: index,
        name: `${user.firstName} ${user.lastName}`,
        email,
        phone,
        state: visitorEstate,
        city: visitorCity,
        createdAt: answerDate.toISOString().slice(0, 19).replace("T", " "),
      };

      for (const sdq of activitiesSurveyDefaultQuestions) {
        const da = {
          visitorId: index,
          activityId,
          registrationId: confirmedRegister.registrationId,
          questionId: sdq.questionId,
          answerId: null,
          custonAnswer: null,
          createdAt: answerDate.toISOString().slice(0, 19).replace("T", " "),
        };

        if (sdq.type === "special") {
          if (sdq.questionId === 1) {
            da.custonAnswer = activitiesVisitor.name;
          } else if (sdq.questionId === 2) {
            da.custonAnswer = activitiesVisitor.email;
          } else if (sdq.questionId === 3) {
            da.custonAnswer = activitiesVisitor.phone;
          } else if (sdq.questionId === 4) {
            da.custonAnswer = activitiesVisitor.state;
          } else if (sdq.questionId === 5) {
            da.custonAnswer = activitiesVisitor.city;
          }
          activitiesVisitorsDefaultAnswers.push(da);
        } else if (sdq.type === "single" || sdq.type === "objective") {
          const answers = activitiesSurveyDefaultAnswers
            .filter((a) => a.questionId === sdq.questionId)
            .map((a) => a.answerId);
          da.answerId = answers[faker.number.int(answers.length - 1)];
          activitiesVisitorsDefaultAnswers.push({ ...da });

          if (da.answerId === 4) {
            activitiesVisitorsDefaultAnswers.push({
              ...da,
              answerId: null,
              questionId: 7,
              custonAnswer: faker.person.gender(),
            });
          }
        } else if (sdq.type === "multiple") {
          const answers = activitiesSurveyDefaultAnswers
            .filter((a) => a.questionId === sdq.questionId)
            .map((a) => a.answerId);

          faker.helpers.shuffle(answers);
          const selectedAnswers = answers.slice(
            0,
            faker.number.int({ min: 1, max: answers.length - 1 })
          );
          for (const selectedAnswer of selectedAnswers) {
            activitiesVisitorsDefaultAnswers.push({
              ...da,
              answerId: selectedAnswer,
            });
          }
        } else if (sdq.type === "descriptive") {
          if (sdq.questionId === 11) {
            da.custonAnswer = faker.person.jobType();
          }
          activitiesVisitorsDefaultAnswers.push(da);
        }
      }

      for (const sq of activitiesSurveyQuestions) {
        const sa = {
          visitorId: index,
          activityId,
          registrationId: confirmedRegister.registrationId,
          questionId: sq.questionId,
          answerId: null,
          custonAnswer: null,
          createdAt: answerDate.toISOString().slice(0, 19).replace("T", " "),
        };
        if (sq.required) {
          if (faker.number.int(100) > 70) continue;
        }
        if (sq.type === "single" || sq.type === "objective") {
          const answers = activitiesSurveyAnswers
            .filter((a) => a.questionId === sq.questionId)
            .map((a) => a.answerId);
          sa.answerId = answers[faker.number.int(answers.length - 1)];
          activitiesVisitorsAnswers.push({ ...sa });
        } else if (sq.type === "multiple") {
          const answers = activitiesSurveyAnswers
            .filter((a) => a.questionId === sq.questionId)
            .map((a) => a.answerId);
          faker.helpers.shuffle(answers);
          const selectedAnswers = answers.slice(
            0,
            faker.number.int({ min: 1, max: answers.length - 1 })
          );
          for (const selectedAnswer of selectedAnswers) {
            activitiesVisitorsAnswers.push({
              ...sa,
              answerId: selectedAnswer,
            });
          }
        } else if (sq.type === "descriptive") {
          if (sq.questionId === 11) {
            sa.custonAnswer = faker.lorem.sentence();
          }
          activitiesVisitorsAnswers.push(sa);
        }
      }

      activitiesVisitors.push(activitiesVisitor);
    }
  }
  return {
    activitiesVisitors,
    activitiesVisitorsDefaultAnswers,
    activitiesVisitorsAnswers,
  };
}

const activityIndex = process.argv.indexOf("--activity");
if (activityIndex < 0) {
  console.log("No Activity ID, use --activity");
  process.exit(1);
}

const registerTypeIndex = process.argv.indexOf("--type");
if (registerTypeIndex < 0) {
  console.log("No Register Type, use --type SMS||EMAIL");
  process.exit(1);
}
if (
  process.argv[registerTypeIndex + 1] !== "EMAIL" &&
  process.argv[registerTypeIndex + 1] !== "SMS"
) {
  console.log("Wrong Register Type, use --type SMS||EMAIL");
  process.exit(1);
}

const quantityIndex = process.argv.indexOf("--quantity");
if (activityIndex < 0) {
  console.log("No Quantity, use --quantity");
  process.exit(1);
}

const deskItems = generateDesk(process.argv[activityIndex + 1], 50);

fs.writeFileSync("activities-desk.json", JSON.stringify(deskItems, null, 2));

const registerItems = generateRegister(
  deskItems,
  process.argv[registerTypeIndex + 1],
  process.argv[quantityIndex + 1]
);

fs.writeFileSync(
  "activities-register.json",
  JSON.stringify(registerItems, null, 2)
);

const confirmedRegisters = registerItems.filter((x) => x.confirmed);

const {
  activitiesVisitors,
  activitiesVisitorsDefaultAnswers,
  activitiesVisitorsAnswers,
} = generateVisitors(process.argv[activityIndex + 1], confirmedRegisters);

fs.writeFileSync(
  "activity-visitors.json",
  JSON.stringify(activitiesVisitors, null, 2)
);

fs.writeFileSync(
  "activity-visitors-default-answers.json",
  JSON.stringify(activitiesVisitorsDefaultAnswers, null, 2)
);

fs.writeFileSync(
  "activity-visitors-answers.json",
  JSON.stringify(activitiesVisitorsAnswers, null, 2)
);
