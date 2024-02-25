const { faker } = require("@faker-js/faker/locale/pt_BR");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const deskItems = require("./activities-desk.json");

function generateData(deskItems, registerType, quantity) {
  const now = new Date();

  const registerItems = [];
  for (let i = 0; i < quantity; i++) {
    const user = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
    const hasConfirmed =
      faker.number.int(100) <= 70 ? now.toISOString().slice(0, 19).replace('T', ' ') : null;
    const hasGift =
      faker.number.int(100) <= 70 ? now.toISOString().slice(0, 19).replace('T', ' ') : null;
    const deskItem = deskItems[Math.floor(Math.random() * deskItems.length)];

    const email = faker.internet.email({
      firstName: user.firstName,
      lastName: user.lastName,
    }).toLocaleLowerCase();

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
      createdAt: now.toISOString().slice(0, 19).replace('T', ' '),
      activityRegisterHash: `${deskItem.activityId}#${
        registerType === "EMAIL" ? email : phone
      }`,
    };
    registerItems.push(registerItem);
  }
  return registerItems;
}

const registerTypeIndex = process.argv.indexOf("--type");
if (registerTypeIndex < 0) {
  console.log("No Register Type");
  process.exit(1);
}
if (
  process.argv[registerTypeIndex + 1] !== "EMAIL" &&
  process.argv[registerTypeIndex + 1] !== "SMS"
) {
  console.log("Wrong Register Type, can be EMAIL or SMS");
  process.exit(1);
}
const registerType = process.argv[registerTypeIndex + 1];

const quantityIndex = process.argv.indexOf("--quantity");
const quantityValue = quantityIndex > -1 ? process.argv[quantityIndex + 1] : 10;

const registerItems = generateData(deskItems, registerType, quantityValue);

fs.writeFileSync(
  "activities-register.json",
  JSON.stringify(registerItems, null, 2)
);
