import * as EmailValidator from "email-validator";

const isValidEmail = (email) => EmailValidator.validate(email);

export default isValidEmail;
