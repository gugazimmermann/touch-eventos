import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSurvey } from "../context/SurveyContext";
import * as survey from "../services/survey";
import { Alert, Loading } from "../components";
import TopBar from "./TopBar";
import { format } from "date-fns";

const FinalSurvey = () => {
  const { t, i18n } = useTranslation("activity_survey");
  const { activitySlug, registrationId, language } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useSurvey();
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [activity, setActivity] = useState();

  const getData = useCallback(
    async (slug) => {
      setLoading(true);
      try {
        const activityData = state.activity
          ? state.activity
          : await survey.getActivityBySlug(slug);
        if (activityData?.error || !activityData?.activityId) {
          setWarning(t("activity_not_found"));
        } else {
          if (!state.activity) {
            dispatch({
              type: "ACTIVITY",
              payload: { activity: activityData },
            });
          }
          setActivity(activityData);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatch,
      registrationId,
      state.activity,
      state.survey,
      state.registration,
      state.token,
      t,
    ]
  );

  useEffect(() => {
    if (language) i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (!activitySlug) window.location.href = process.env.REACT_APP_SITE_URL;
    else if ((!state.token || !registrationId) && activitySlug)
      navigate(`/${activitySlug}`);
    getData(activitySlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitySlug, getData, registrationId, state.token]);

  return (
    <section className="flex flex-grow w-full">
      {loading ? (
        <div className="flex flex-grow justify-center items-center">
          <Loading size="w-20 w-20" />
        </div>
      ) : (
        <div className="container mx-auto bg-background-50 p-4">
          {error && <Alert message={error} type="danger" center={true} />}
          {warning && <Alert message={warning} type="warning" center={true} />}
          {activity && (
            <>
              <TopBar step={3} activity={activity} />
              <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-lg pb-4 mt-4">
                {activity.logo && (
                  <img
                    className="object-cover object-center w-full h-64 rounded-t-lg"
                    src={activity.logo}
                    alt="logo"
                  />
                )}
                <div className="flex items-center justify-center px-8 py-4 bg-success-500">
                  <h1 className="text-xl font-bold text-white">
                    {activity.name}
                  </h1>
                </div>
                <div className="w-full text-center p-4">
                  <h1 className="font-semibold text-lg">
                    Obrigado por Compartilhar Sua Opinião!
                  </h1>
                  <p className="my-4">
                    Agradecemos por dedicar seu tempo para preencher nossa
                    pesquisa. Sua opinião é extremamente valiosa para nós e
                    desempenha um papel crucial na melhoria de nossas atividades
                    futuras.
                  </p>
                  {activity.raffle && (
                    <h2 className="font-semibold">
                      Fique atento: o sorteio será realizado no dia{" "}
                      {format(
                        new Date(parseInt(activity.raffleDay, 10)),
                        "dd/MM/yy"
                      )}
                    </h2>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default FinalSurvey;
