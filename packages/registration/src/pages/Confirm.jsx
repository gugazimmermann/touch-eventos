import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDays, endOfDay, isAfter, isBefore, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import * as register from "../services/register";
import { validateCode } from "../helpers/validate";
import { FormButton, InputField } from "../components/form";
import Layout from "./Layout";

const Confirm = () => {
  const { t, i18n } = useTranslation("activity_register");
  const { activitySlug, registrationId, language } = useParams();
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [allowConfirmation, setAllowConfirmation] = useState(true);
  const [activity, setActivity] = useState();
  const [confirmationCode, setConfirmationCode] = useState({
    code: "",
  });

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    if (!validateCode(confirmationCode.code)) {
      setError(t("invalid_code"));
      return;
    }
    setLoading(true);
    const payload = {
      registrationId,
      activityId: activity.activityId,
      code: confirmationCode.code,
      language: i18n.language,
      confirmedAt: `${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
    };
    const confirmResponse = await register.confirm(
      activity.activityId,
      payload
    );
    if (confirmResponse?.registrationId) {
      navigate(
        `/${activity.slug}/${confirmResponse.registrationId}/success/${confirmResponse.language}`
      );
    } else {
      if (
        confirmResponse?.error === "Not Found: Registration not found" ||
        confirmResponse?.error === "Bad Request: Wrong Code"
      ) {
        setWarning(t("invalid_code"));
      } else {
        setError(confirmResponse.error);
      }
    }
    setLoading(false);
  };

  const getData = useCallback(
    async (slug) => {
      setLoadingPage(true);
      try {
        const activityData = await register.getActivityBySlug(slug);
        if (activityData?.error || !activityData?.activityId) {
          setWarning(t("activity_not_found"));
        } else {
          const today = startOfDay(new Date());
          const startDate = startOfDay(
            new Date(parseInt(activityData.startDate, 10))
          );
          let endDate = endOfDay(
            new Date(parseInt(activityData.endDate, 10))
          );
          // TODO: somente para testes e demonstração
          if (process.env.REACT_APP_TEST_ACTIVITY === activityData.activityId) {
            endDate = addDays(today, 1);
          }
          if (isBefore(today, startDate)) {
            setInfo(t("activity_not_started"));
            setAllowConfirmation(false);
          } else if (isAfter(today, endDate)) {
            setWarning(t("activity_ended"));
            setAllowConfirmation(false);
          }

          if (!activityData?.payment) {
            if (activityData.registrations < 10) {
              setInfo(
                `${t("activity_trial_remain")} ${
                  10 - activityData.registrations
                }`
              );
            } else {
              setWarning(t("activity_trial_over"));
              setAllowConfirmation(false);
            }
          } else if (activityData.payment !== "success" || activityData.active !== 1) {
            setError(t("Cadastro não disponível"));
            setWarning(t("Entre em contato com o evento"));
            setAllowConfirmation(false)
          }

          setActivity(activityData);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoadingPage(false);
    },
    [t]
  );

  useEffect(() => {
    if (language) i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (activitySlug && registrationId) getData(activitySlug);
    else if (activitySlug && !registrationId) navigate(`/${activitySlug}`);
    else navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitySlug, registrationId, getData]);

  return (
    <Layout
      loadingPage={loadingPage}
      loading={loading}
      error={error}
      info={info}
      warning={warning}
      activity={activity}
    >
      {activity && (
        <div className="w-full text-center">
          <h1 className="text-xl font-semibold">{t("confirmationTitle")}</h1>
          <form className="w-full px-4" onSubmit={handleSubmit}>
            <InputField
              disabled={loading || !allowConfirmation}
              required={true}
              type="text"
              placeholder={t("code")}
              value="code"
              values={confirmationCode}
              setValues={setConfirmationCode}
            />
            <div className="w-full text-center mt-4">
              <FormButton
                testid="confirm-send-button"
                text={t("confirmation")}
                disabled={loading || !allowConfirmation}
                type="submit"
                size="w-3/4"
                textSize="text-base"
              />
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default Confirm;
