import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes";
import { handleNewPassword } from "../../../services/auth";
import {
  validateEmail,
  validateCode,
  validatePassword,
} from "../../../helpers/validate";
import { Alert, Loading } from "../../../components";
import { FormButton, InputField } from "../../../components/form";
import AuthCard from "./AuthCard";

const NewPassword = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { useremail } = useParams();
  const [values, setValues] = useState({
    email: "",
    code: "",
    password: "",
    repeatpassword: "",
  });
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setError("");
    setInfo("");
    e.preventDefault();
    const { email, code, password, repeatpassword } = values;
    if (!validateEmail(email)) {
      setError(t("invalid_email"));
      return;
    }
    if (!validateCode(code)) {
      setError(t("invalid_code"));
      return;
    }
    if (!validatePassword(password, repeatpassword)) {
      setError(t("invalid_password"));
      return;
    }
    setLoading(true);
    try {
      await handleNewPassword(email, code, password);
      navigate(`/${ROUTES.AUTH.SIGNIN}/${email}`);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (useremail) {
      setValues({ ...values, email: useremail });
      setInfo(`${t("the_code_was_sent_to")} ${useremail}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const NewPasswordFooter = () => {
    return (
      <Link to={`/${ROUTES.AUTH.SIGNIN}`} className="text-sm text-white hover:underline">
        {t("back_to")} {t("signin")}
      </Link>
    );
  };

  return (
    <AuthCard title={t("new_password")} footer={<NewPasswordFooter />}>
      {loading && <Loading />}
      {info && <Alert message={info} type="info" />}
      {error && <Alert title={t("error")} message={error} type="danger" />}
      <form onSubmit={(e) => handleSubmit(e)}>
        <InputField
          disabled={loading}
          required={true}
          autocomplete="email"
          type="email"
          placeholder={t("email")}
          value="email"
          values={values}
          setValues={setValues}
        />
        <InputField
          disabled={loading}
          required={true}
          placeholder={t("code")}
          value="code"
          values={values}
          setValues={setValues}
        />
        <InputField
          disabled={loading}
          required={true}
          type="password"
          placeholder={t("password")}
          value="password"
          values={values}
          setValues={setValues}
        />
        <InputField
          disabled={loading}
          required={true}
          type="password"
          placeholder={t("repeat_password")}
          value="repeatpassword"
          values={values}
          setValues={setValues}
        />
        <div className="flex justify-center mt-4">
          <FormButton
            testid="new-password-button"
            text={t("new_password")}
            disabled={loading}
            type="submit"
          />
        </div>
      </form>
    </AuthCard>
  );
};

export default NewPassword;
