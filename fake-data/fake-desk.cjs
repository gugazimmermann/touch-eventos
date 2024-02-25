const { faker } = require("@faker-js/faker/locale/pt_BR");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

function generateData(activityId, quantity) {
  const now = new Date();

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
      createdAt: now.toISOString().slice(0, 19).replace('T', ' '),
      user: faker.internet.userName({
        firstName: user.firstName,
        lastName: user.lastName,
      }).toLocaleLowerCase(),
      accessCode: faker.internet.password({ length: 6, memorable: true }).toLocaleLowerCase(),
    };
    deskItems.push(deskItem)
  }
  return deskItems;
}

const activityIndex = process.argv.indexOf("--activity");
if (activityIndex < 0) {
  console.log("No Activity ID");
  process.exit(1);
}

const quantityIndex = process.argv.indexOf("--quantity");
const quantityValue = quantityIndex > -1 ? process.argv[quantityIndex + 1] : 10;

const deskItems = generateData(process.argv[activityIndex + 1], quantityValue);

fs.writeFileSync("activities-desk.json", JSON.stringify(deskItems, null, 2));
