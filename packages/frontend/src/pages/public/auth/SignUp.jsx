import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes";
import { handleSignUp } from "../../../services/auth";
import { validateEmail, validatePassword } from "../../../helpers/validate";
import { FormButton, InputField } from "../../shared/components/form";
import { Alert, Loading } from "../../../components/shared";
import AuthCard from "./AuthCard";

const SignUp = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
    repeatpassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    const { email, password, repeatpassword } = values;
    if (!validateEmail(email)) {
      setError(t("invalid_email"));
      return;
    }
    if (!validatePassword(password, repeatpassword)) {
      setError(t("invalid_password"));
      return;
    }
    setLoading(true);
    try {
      const userId = await handleSignUp(email, password);
      if (userId) navigate(`/${ROUTES.AUTH.CONFIRMEMAIL}/${email}`);
      else setError(t("form_error"));
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const SignUpFooter = () => {
    return (
      <Link
        to={!loading && `/${ROUTES.AUTH.SIGNIN}`}
        className="text-sm text-white hover:underline"
      >
        {t("already_have_an_account")}?
        <span className="mx-2 text-sm font-bold">{t("signin")}</span>
      </Link>
    );
  };

  return (
    <AuthCard title={t("signup")} footer={<SignUpFooter />}>
      {loading && <Loading />}
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
            testid="sign-up-button"
            text={t("signup")}
            disabled={loading}
            type="submit"
          />
        </div>
      </form>
    </AuthCard>
  );
};

export default SignUp;
