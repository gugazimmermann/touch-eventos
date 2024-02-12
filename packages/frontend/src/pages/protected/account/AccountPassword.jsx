import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { handleUpdateCurrentUserPassword } from "../../../services/auth";
import { accountPasswordValidate } from "../../../helpers/form-validation";
import { Alert, Loading } from "../../../components";
import { FormButton, InputField } from "../../../components/form";

const AccountPassword = ({ confirmEmail }) => {
  const { t } = useTranslation("account");
  const [values, setValues] = useState({
    currentPwd: "",
    newPwd: "",
    repeatPwd: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    setError("");
    setSuccess("");
    e.preventDefault();
    if (!accountPasswordValidate(values, setError, t)) return;
    setLoading(true);
    try {
      await handleUpdateCurrentUserPassword(values.currentPwd, values.newPwd);
      setSuccess(t("account_password_success"));
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (confirmEmail) setInfo(t("account_update_info"));
  }, [confirmEmail, t]);

  return (
    <>
      {loading && <Loading />}
      {error && <Alert message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}
      {info && <Alert message={info} type="info" />}
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="grid grid-cols-3 gap-4">
          <InputField
            disabled={loading || confirmEmail}
            required={true}
            type="password"
            placeholder={t("account_password_current")}
            value="currentPwd"
            values={values}
            setValues={setValues}
          />
          <InputField
            disabled={loading || confirmEmail}
            required={true}
            type="password"
            placeholder={t("account_password_new")}
            value="newPwd"
            values={values}
            setValues={setValues}
          />
          <InputField
            disabled={loading || confirmEmail}
            required={true}
            type="password"
            placeholder={t("account_password_new_repeat")}
            value="repeatPwd"
            values={values}
            setValues={setValues}
          />
        </div>
        <div className="flex justify-center mt-4">
          <FormButton
            testid="account-change-password-button"
            text={t("account_password_change")}
            disabled={loading || confirmEmail}
            type="submit"
          />
        </div>
      </form>
    </>
  );
};

export default AccountPassword;
