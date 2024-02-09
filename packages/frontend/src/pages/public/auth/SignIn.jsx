import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes";
import { handleSignIn } from "../../../services/auth";
import { validateEmail, validatePassword } from "../../../helpers/validate";
import { FormButton, InputField } from "../../shared/components/form";
import { Alert, Loading } from "../../shared/components";
import AuthCard from "./AuthCard";

const SignIn = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { useremail } = useParams();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    const { email, password } = values;
    if (!validateEmail(email)) {
      setError(t("invalid_email"));
      return;
    }
    if (!validatePassword(password)) {
      setError(t("invalid_password"));
      return;
    }
    setLoading(true);
    try {
      const isSignedIn = await handleSignIn(email, password);
      if (isSignedIn) navigate(`/${ROUTES.ADMIN.DASHBOARD}`);
      else setError(t("form_error"));
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (useremail) setValues({ ...values, email: useremail });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const SignInFooter = () => {
    return (
      <Link
        to={!loading && `/${ROUTES.AUTH.SIGNUP}`}
        className="text-sm text-white hover:underline"
      >
        {t("dont_have_an_account")}?
        <span className="mx-2 text-sm font-bold">{t("register")}</span>
      </Link>
    );
  };

  return (
    <AuthCard title={t("signin")} footer={<SignInFooter />}>
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
        <div className="flex items-center justify-between mt-4">
          <Link
            to={!loading && `/${ROUTES.AUTH.FORGOTPASSWORD}`}
            className="text-sm hover:underline disabled-link"
          >
            {t("forgot_password")}?
          </Link>
          <FormButton
            testid="sign-in-button"
            text={t("signin")}
            disabled={loading}
            type="submit"
          />
        </div>
      </form>
    </AuthCard>
  );
};

export default SignIn;
