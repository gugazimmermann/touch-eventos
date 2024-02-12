import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes";
import { handleForgotPassword } from "../../../services/auth";
import { validateEmail } from "../../../helpers/validate";
import { Alert, Loading } from "../../../components";
import { FormButton, InputField } from "../../../components/form";
import AuthCard from "./AuthCard";

const ForgotPassword = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    const { email } = values;
    if (!validateEmail(email)) {
      setError(t("invalid_email"));
      return;
    }
    setLoading(true);
    try {
      const useremail = await handleForgotPassword(email);
      if (useremail) navigate(`/${ROUTES.AUTH.NEWPASSWORD}/${email}`);
      else setError(t("form_error"));
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const ForgotPasswordFooter = () => {
    return (
      <Link to={`/${ROUTES.AUTH.SIGNIN}`} className="text-sm text-white hover:underline">
        {t("back_to")} {t("signin")}
      </Link>
    );
  };

  return (
    <AuthCard title={t("forgot_password")} footer={<ForgotPasswordFooter />}>
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
        <div className="flex justify-center mt-4">
          <FormButton
            testid="forgot-password-button"
            text={t("send_code")}
            disabled={loading}
            type="submit"
          />
        </div>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
