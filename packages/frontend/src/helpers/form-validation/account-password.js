import { validatePassword } from "../validate";

const accountPasswordValidate = (values, setError, t) => {
  if (!validatePassword(values.currentPwd)) {
    setError(t("account_password_invalid"));
    return false;
  }
  if (!validatePassword(values.newPwd, values.repeatPwd)) {
    setError(t("account_password_invalid"));
    return false;
  }
  return true;
};

export default accountPasswordValidate;
