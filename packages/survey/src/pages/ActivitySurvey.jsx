import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import { useSurvey } from "../context/SurveyContext";
import * as survey from "../services/survey";
import { Alert, Loading } from "../components";
import TopBar from "./TopBar";

const ActivitySurvey = () => {
  const { t, i18n } = useTranslation("activity_survey");
  const { activitySlug, registrationId, language } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useSurvey();
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [info, setInfo] = useState("");
  const [activity, setActivity] = useState();
  const [activitySurvey, setActivitySurvey] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [requiredQuestions, setRequiredQuestions] = useState([]);

  const transformAnwsers = () => {
    let transformedArray = [];
    for (const key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        const value = formValues[key];
        if (typeof value === "object" && !Array.isArray(value)) {
          for (const innerKey in value) {
            if (value.hasOwnProperty(innerKey)) {
              if (value[innerKey] === true) {
                transformedArray.push({
                  questionId: parseInt(key),
                  answer: parseInt(innerKey),
                });
              }
            }
          }
        } else {
          transformedArray.push({
            questionId: parseInt(key),
            answer: value,
          });
        }
      }
    }

    return transformedArray;
  };

  const handleInputChange = (questionId, newValue) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [questionId]: newValue,
    }));
  };

  const handleCheckboxChange = (questionId, answerId, checked) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [questionId]: {
        ...prevValues[questionId],
        [answerId]: checked,
      },
    }));
  };

  const formatSurveyData = (data) => {
    const sortedData = data.sort((a, b) => {
      if (a.order === b.order)
        return (a.answerOrder || 0) - (b.answerOrder || 0);
      return a.order - b.order;
    });
    const grouped = sortedData.reduce((acc, current) => {
      if (!acc[current.questionId]) {
        acc[current.questionId] = {
          questionId: current.questionId,
          question: current.question,
          type: current.type,
          required: current.required,
          answers: [],
        };
      }
      acc[current.questionId].answers.push({
        answerId: current.answerId,
        answer: current.answer,
      });
      return acc;
    }, {});
    setActivitySurvey(Object.values(grouped));
    const surveyFormValues = localStorage.getItem("surveyFormValues");
    if (surveyFormValues) setFormValues(JSON.parse(surveyFormValues));
  };

  const verifyRequired = (anwsers) => {
    const cleanAnwsers = anwsers.filter((a) => a.answer);
    const allRequiredQuestions = [];
    activitySurvey.forEach((q) => {
      if (q.required) allRequiredQuestions.push(q);
    });
    const requiredQuestions = allRequiredQuestions.filter(
      (q) => !cleanAnwsers.some((a) => a.questionId === q.questionId)
    );
    const alerts = requiredQuestions.map((r) => r.question);
    if (!alerts.length) return false;
    else {
      setRequiredQuestions(alerts);
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRequiredQuestions([]);
    setError();
    setWarning();
    const defaultAnswers = transformAnwsers();
    localStorage.setItem("surveyFormValues", JSON.stringify(formValues));
    const required = verifyRequired(defaultAnswers);
    if (!required) {
      const payload = {
        token: state.token,
        visitorID: state.visitor,
        activityId: activity.activityId,
        answers: defaultAnswers,
      };
      const result = await survey.sendActivityAnswers(activitySlug, payload);
      if (result.visitorID) {
        navigate(`/${activitySlug}/${registrationId}/3/${i18n.language}`);
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const getData = useCallback(
    async (slug) => {
      setLoading(true);
      const payload = { token: state.token, visitorID: state.visitor };
      try {
        const [activityData, activitySurveyData] = await Promise.all([
          state.activity
            ? state.activity
            : await survey.getActivityBySlug(slug),
          state.survey
            ? state.survey
            : await survey.getActivitySurvey(slug, payload),
        ]);
        if (
          activityData?.error ||
          activitySurveyData?.error ||
          !activityData?.activityId
        ) {
          setWarning(t("activity_not_found"));
        } else {
          if (!state.activity) {
            dispatch({
              type: "ACTIVITY",
              payload: { activity: activityData },
            });
          }
          if (!state.survey) {
            dispatch({
              type: "SURVEY",
              payload: { survey: activitySurveyData },
            });
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
           if (activitySurveyData.length) {
            formatSurveyData(activitySurveyData);
          } else {
            setInfo("Nenhuma pesquisa cadastrada pela atividade.")
          }
          
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
          {activity && (
            <>
              <TopBar step={2} activity={activity} />
              {(error || warning || info) && (
                <div className="mt-4">
                  {error && (
                    <Alert message={error} type="danger" center={true} />
                  )}
                  {warning && (
                    <Alert message={warning} type="warning" center={true} />
                  )}
                  {info && (
                    <Alert message={info} type="info" center={true} />
                  )}
                </div>
              )}
              {requiredQuestions.length > 0 && (
                <div className="w-full mt-2">
                  <Alert
                    title="Obrigatórias"
                    message={requiredQuestions.join(" / ")}
                    type="danger"
                  />
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                className="flex flex-wrap justify-center items-start mt-4"
              >
                {activitySurvey.map((question, i) => (
                  <div
                    key={`${question.question}#${i}`}
                    className="w-1/2 xl:w-1/3 px-2 my-4"
                  >
                    <label
                      htmlFor={question.question}
                      className="block leading-6 font-semibold"
                    >
                      {question.question}{" "}
                      {question.required && (
                        <span className="text-danger-500">*</span>
                      )}
                    </label>
                    <div className="mt-2">
                      {(question.type === "single" ||
                        question.type === "objective") && (
                        <div className="space-y-2">
                          {question.answers.map((answer, j) => (
                            <div
                              key={`${i}#${j}`}
                              className="flex flex-row items-center justify-start"
                            >
                              <input
                                id={answer.answerId}
                                name={answer.answerId}
                                // required={question.required}
                                type="radio"
                                checked={
                                  formValues?.[question.questionId] ===
                                  answer.answerId
                                }
                                value={formValues[question.questionId] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    question.questionId,
                                    answer.answerId
                                  )
                                }
                                className="h-4 w-4 mr-2 block text-text-700 placeholder-text-500 bg-white border rounded-lg"
                              />
                              <label
                                htmlFor={answer.answerId}
                                className="w-full leading-6"
                              >
                                {answer.answer}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      {question.type === "multiple" && (
                        <div className="space-y-2">
                          {question.answers.map((answer, j) => (
                            <div
                              key={`${i}#${j}`}
                              className="flex flex-row items-center justify-start"
                            >
                              <input
                                id={`${question.questionId}#${answer.answerId}`}
                                name={`${question.questionId}#${answer.answerId}`}
                                type="checkbox"
                                checked={
                                  !!formValues[question.questionId]?.[
                                    answer.answerId
                                  ]
                                }
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    question.questionId,
                                    answer.answerId,
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 mr-2 block text-text-700 placeholder-text-500 bg-white border rounded-lg"
                              />
                              <label
                                htmlFor={`${question.questionId}#${answer.answerId}`}
                                className="w-full leading-6"
                              >
                                {answer.answer}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      {question.type === "descriptive" && (
                        <textarea
                          className="w-full px-4 py-2 text-text-700 bg-white border rounded-lg"
                          id={question.question}
                          name={question.question}
                          // required={question.required}
                          value={formValues[question.questionId] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              question.questionId,
                              e.target.value
                            )
                          }
                          rows="4"
                        />
                      )}
                    </div>
                  </div>
                ))}
                {requiredQuestions.length > 0 && (
                  <div className="w-full mt-2">
                    <Alert
                      title="Obrigatórias"
                      message={requiredQuestions.join(" / ")}
                      type="danger"
                    />
                  </div>
                )}
                <div className="w-full flex justify-end items-center mb-8">
                  <button className="bg-primary-500 text-white px-4 py-2 w-1/4 rounded-md">
                    Avançar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default ActivitySurvey;
