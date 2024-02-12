import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes";
import {
  handleConfirmEmail,
  handleResendSignUpCode,
} from "../../../services/auth";
import { validateEmail, validateCode } from "../../../helpers/validate";
import { Alert, Loading } from "../../../components";
import { FormButton, InputField } from "../../../components/form";
import AuthCard from "./AuthCard";

const ConfirmEmail = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { useremail } = useParams();
  const [values, setValues] = useState({
    email: "",
    code: "",
  });
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setError("");
    setInfo("");
    setSuccess("");
    e.preventDefault();
    const { email, code } = values;
    if (!validateEmail(email)) {
      setError(t("invalid_email"));
      return;
    }
    if (!validateCode(code)) {
      setError(t("invalid_code"));
      return;
    }
    setLoading(true);
    try {
      const isSignUpComplete = await handleConfirmEmail(email, code);
      if (isSignUpComplete) navigate(`/${ROUTES.AUTH.SIGNIN}/${email}`);
      else setError(t("form_error"));
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleSendCode = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    const { email } = values;
    if (!validateEmail(email)) {
      setError(t("invalid_email"));
      return;
    }
    try {
      const destination = await handleResendSignUpCode(email);
      if (destination) setSuccess(`${t("the_code_was_sent_to")} ${email}`);
      else setError(t("form_error"));
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

  const ConfirmEmailFooter = () => {
    return (
      <Link
        to={!loading && `/${ROUTES.AUTH.SIGNIN}`}
        className="text-sm text-white hover:underline"
      >
        {t("back_to")} {t("signin")}
      </Link>
    );
  };

  return (
    <AuthCard title={t("confirm_email")} footer={<ConfirmEmailFooter />}>
      {loading && <Loading />}
      {info && <Alert message={info} type="info" />}
      {error && <Alert title={t("error")} message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}
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
        <div className="flex items-center justify-between mt-4 gap-4">
          <FormButton
            testid="resend-code-button"
            text={t("resend_code")}
            disabled={loading}
            onClick={() => handleSendCode()}
            color="text-white bg-secondary-500"
          />
          <FormButton
            testid="confirm-email-button"
            text={t("confirm_email")}
            disabled={loading}
            type="submit"
          />
        </div>
      </form>
    </AuthCard>
  );
};

export default ConfirmEmail;
