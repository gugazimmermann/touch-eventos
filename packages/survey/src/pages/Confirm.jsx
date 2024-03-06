import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { endOfDay } from "date-fns";
import { useSurvey } from "../context/SurveyContext";
import * as survey from "../services/survey";
import { validateCode } from "../helpers/validate";
import { Alert, Loading } from "../components";
import { FormButton, InputField } from "../components/form";

const Confirm = () => {
  const { t, i18n } = useTranslation("activity_survey");
  const { activitySlug, registrationId, language } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useSurvey();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
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
    };
    const result = await survey.confirm(activity.activityId, payload);
    if (result?.token) {
      dispatch({
        type: "REGISTRATION",
        payload: { registration: result.registration },
      });
      dispatch({
        type: "REGISTRATIONID",
        payload: { registrationID: registrationId },
      });
      dispatch({
        type: "TOKEN",
        payload: { token: result.token },
      });
    } else {
      if (
        result?.error === "Not Found: Registration not found" ||
        result?.error === "Bad Request: Wrong Code"
      ) {
        setWarning(t("invalid_code"));
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  // TODO: surveyLastDay
  const getData = useCallback(
    async (slug) => {
      setLoadingPage(true);
      setError();
      setWarning();
      try {
        const activityData =
          state?.activity && state.activity?.slug === slug
            ? state.activity
            : await survey.getActivityBySlug(slug);
        if (
          activityData?.error &&
          activityData.error === "Not Found: activity not found"
        ) {
          setError(t("Atividade Não Encontrada"));
        } else if (activityData?.error) {
          setError(t("Ocorreu um erro."));
        } else if (activityData.active !== 1) {
          setWarning(t("Atividade não pode ser acessada."));
        }
        // } else if (
        //   new Date(parseInt(activityData.surveyLastDay, 10)) < endOfDay(new Date())
        // ) {
        //   setWarning(t("Pesquisa Encerrada"));
        // }
        setActivity(activityData);
        dispatch({
          type: "ACTIVITY",
          payload: { activity: activityData },
        });
      } catch (error) {
        setError(error.message);
      }
      setLoadingPage(false);
    },
    [dispatch, state.activity, t]
  );

  useEffect(() => {
    if (state.token && state.registrationID)
      navigate(`/${activitySlug}/${state.registrationID}/1/${language}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token, state.registrationID]);

  useEffect(() => {
    if (language) i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (!activitySlug) window.location.href = process.env.REACT_APP_SITE_URL;
    else if (!registrationId) navigate(`/${activitySlug}`);
    else if (state.token && state.registrationID)
      navigate(`/${activitySlug}/${state.registrationID}/1/${i18n.language}`);
    else getData(activitySlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitySlug, getData, i18n.language, state.registrationID, state.token]);

  return (
    <>
      {loadingPage ? (
        <section className="flex flex-col flex-grow w-full">
          <div className="w-full flex-grow p-4 max-w-sm mx-auto overflow-hidden bg-white animate-pulse">
            <div className="w-full h-72 bg-gray-300 rounded-t-lg" />
            <p className="w-72 h-4 mx-auto mt-4 bg-gray-200 rounded-lg" />
            <p className="w-72 h-4 mx-auto mt-4 bg-gray-200 rounded-lg" />
            <p className="w-72 h-12 mx-auto mt-8 bg-gray-200 rounded-lg" />
            <p className="w-72 h-12 mx-auto mt-8 bg-gray-200 rounded-lg" />
          </div>
        </section>
      ) : (
        <section className="flex flex-grow w-full">
          {loading ? (
            <div className="flex flex-grow justify-center items-center">
              <Loading size="w-20 w-20" />
            </div>
          ) : (
            <div className="container mx-auto bg-background-50 p-4">
              {error && <Alert message={error} type="danger" center={true} />}
              {warning && (
                <Alert message={warning} type="warning" center={true} />
              )}
              {activity && (
                <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
                  {activity.logo && (
                    <img
                      className="object-cover object-center w-full h-64"
                      src={activity.logo}
                      alt="logo"
                    />
                  )}
                  <div className="flex items-center justify-center px-8 py-4 bg-success-500">
                    <h1 className="text-xl font-bold text-white">
                      {activity.name}
                    </h1>
                  </div>

                  <div className="mt-4 w-full text-center">
                    <h1 className="text-2xl font-bold">
                      {t("Responder Pesquisa")}
                    </h1>
                    <h2 className="text-xl font-semibold mt-4">
                      {t("Código de Confirmação")}
                    </h2>

                    <form
                      className="w-3/4 mx-auto px-4 mb-8"
                      onSubmit={handleSubmit}
                    >
                      <InputField
                        disabled={loading}
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
                          text={t("Acessar Pesquisa")}
                          disabled={loading || warning || error}
                          type="submit"
                          size="w-full"
                          textSize="text-base"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default Confirm;
