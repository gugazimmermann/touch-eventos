import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { useSurvey } from "../context/SurveyContext";
import * as survey from "../services/survey";
import usePhoneCode from "../hooks/usePhoneCode";
import maskPhone from "../helpers/mask-phone";
import { validateEmail, validatePhone } from "../helpers/validate";
import { Alert, Loading } from "../components";
import { FormButton, InputField } from "../components/form";

const Auth = () => {
  const { t, i18n } = useTranslation("activity_survey");
  const { activitySlug } = useParams();
  const navigate = useNavigate();
  const { PhoneCodeSelect } = usePhoneCode();
  const { state, dispatch } = useSurvey();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [activity, setActivity] = useState();
  const [registrationPhone, setRegistrationPhone] = useState({
    phoneCode: "",
    phone: "",
  });
  const [registrationEmail, setRegistrationEmail] = useState({
    email: "",
  });

  const handleSubmit = async (e) => {
    setError("");
    setWarning("")
    e.preventDefault();
    const payload = {
      activityId: activity.activityId,
      email: "",
      phone: "",
      language: i18n.language,
    };
    if (activity.verification === "SMS") {
      const phone = registrationPhone.phone.replace(/\D+/g, "");
      if (!validatePhone(phone)) {
        setError(t("invalid_phone"));
        return;
      }
      const phoneCode = registrationPhone.phoneCode || "+55";
      payload.phone = `${phoneCode}${phone}`;
    } else {
      if (!validateEmail(registrationEmail.email)) {
        setError(t("invalid_email"));
        return;
      }
      payload.email = registrationEmail.email;
    }
    setLoading(true);
    const response = await survey.auth(activity.activityId, payload);
    if (response?.registrationId) {
      navigate(
        `/${activity.slug}/${response.registrationId}/${response.language}`
      );
    } else {
      if (response.error === "Not Found") {
        setError(t("Cadastro Não Encontrado"));
      } else if (response.error === "Not Confirmed") {
        setError(t("Cadastro Não Confirmado"));
      } else {
        setError(t("enter_error"));
      }
    }
    setLoading(false);
  };

  const getData = useCallback(
    async (slug) => {
      setLoadingPage(true);
      setError("");
      setWarning("");
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
        }

        if (
          (activityData?.payment && activityData.payment !== "success") ||
          (activityData.payment === "success" && activityData.active !== 1)
        ) {
          setError(t("Pesquisa não disponível"));
          setWarning(t("Entre em contato com o evento"));
        }

        let surveyLastDay = endOfDay(
          new Date(parseInt(activityData.surveyLastDay, 10))
        );
        // TODO: somente para testes e demonstração
        if (process.env.REACT_APP_TEST_ACTIVITY === activityData.activityId) {
          surveyLastDay = addDays(startOfDay(new Date()), 1);
        }
        if (surveyLastDay < startOfDay(new Date())) {
          setWarning(t("Pesquisa Encerrada"));
        }
         

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
    if (!activitySlug) window.location.href = process.env.REACT_APP_SITE_URL;
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
        <section className="flex flex-col flex-grow w-full">
          {loading ? (
            <div className="flex flex-grow justify-center items-center">
              <Loading size="w-20 w-20" />
            </div>
          ) : (
            <div className="container mx-auto flex-grow bg-background-50 p-4">
              {error && <Alert message={error} type="danger" center={true} />}
              {warning && (
                <Alert message={warning} type="warning" center={true} />
              )}
              {activity && (
                <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-lg">
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
                      {activity.verification === "SMS"
                        ? t("Telefone Cadastrado")
                        : t("Email Cadastrado")}
                    </h2>
                    <form className="w-full p-4" onSubmit={handleSubmit}>
                      {activity.verification === "SMS" ? (
                        <div className="flex flex-row gap-2">
                          <div className="w-1/3">
                            <PhoneCodeSelect
                              disabled={loading}
                              value="phoneCode"
                              values={registrationPhone}
                              setValues={setRegistrationPhone}
                            />
                          </div>
                          <div className="w-2/3">
                            <InputField
                                disabled={loading}
                              required={
                                activity.verification === "SMS" ? true : false
                              }
                              autocomplete="phone"
                              placeholder={t("phone")}
                              value="phone"
                              values={registrationPhone}
                              setValues={setRegistrationPhone}
                              mask={maskPhone}
                            />
                          </div>
                        </div>
                      ) : (
                        <InputField
                        disabled={loading}
                          required={
                            activity.verification !== "SMS" ? true : false
                          }
                          autocomplete="email"
                          type="email"
                          placeholder={t("email")}
                          value="email"
                          values={registrationEmail}
                          setValues={setRegistrationEmail}
                        />
                      )}
                      <div className="w-full text-center py-4">
                        <FormButton
                          testid="submit-button"
                          text={t("Entrar")}
                          disabled={loading}
                          type="submit"
                          size="w-3/4"
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

export default Auth;
