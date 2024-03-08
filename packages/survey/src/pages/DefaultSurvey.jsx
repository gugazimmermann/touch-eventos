import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addDays, endOfDay, startOfDay, format } from "date-fns";
import { useSurvey } from "../context/SurveyContext";
import * as survey from "../services/survey";
import STATESBR from "../constants/states-br";
import { Alert, Loading } from "../components";
import PrivacityBanner from "./PrivacityBanner";
import PrivacityModal from "./PrivacityModal";
import TopBar from "./TopBar";

const DefaultSurvey = () => {
  const { t, i18n } = useTranslation("activity_survey");
  const { activitySlug, registrationId, language } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useSurvey();
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [activity, setActivity] = useState();
  const [showPrivacityModal, setShowPrivacityModal] = useState(false);
  const [defaultSurvey, setDefaultSurvey] = useState([]);
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

  const questionRequired = (q) => {
    if (q.required) return true;
    else if (activity.verification === "SMS" && q.questionId === 2) return true;
    else if (activity.verification !== "SMS" && q.questionId === 3) return true;
  };

  const questionDisabled = (q) => {
    if (activity.verification === "SMS" && q.questionId === 3) return true;
    else if (activity.verification !== "SMS" && q.questionId === 2) return true;
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

  const formatSurveyData = (data, verification, registration) => {
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
    if (verification !== "SMS") handleInputChange(2, registration.email);
    if (verification === "SMS") handleInputChange(3, registration.phone);
    setDefaultSurvey(Object.values(grouped));
    const defaultFormValues = localStorage.getItem("defaultFormValues");
    if (defaultFormValues) setFormValues(JSON.parse(defaultFormValues));
  };

  const verifyRequired = (anwsers) => {
    const cleanAnwsers = anwsers.filter((a) => a.answer);
    const allRequiredQuestions = [];
    defaultSurvey.forEach((q) => {
      const isRequired = questionRequired(q);
      if (isRequired) allRequiredQuestions.push(q);
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
    localStorage.setItem("defaultFormValues", JSON.stringify(formValues));
    const required = verifyRequired(defaultAnswers);
    if (!required) {
      const payload = {
        token: state.token,
        activityId: activity.activityId,
        privacity: state.privacity,
        answers: defaultAnswers,
      };
      const result = await survey.sendDefaultAnswers(activitySlug, payload);
      if (result.visitorID) {
        dispatch({
          type: "VISITOR",
          payload: { visitor: result.visitorID },
        });
        navigate(`/${activitySlug}/${registrationId}/2/${i18n.language}`);
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const getData = useCallback(
    async (slug) => {
      setLoading(true);
      const payload = { token: state.token };
      try {
        const [activityData, registrationData, defaultSurveyData] =
          await Promise.all([
            state.activity
              ? state.activity
              : await survey.getActivityBySlug(slug),
            state.registration
              ? state.registration
              : await survey.getRegistration(registrationId, payload),
            state.default
              ? state.default
              : await survey.getDefaultSurvey(slug, payload),
          ]);
        if (
          activityData?.error ||
          registrationData?.error ||
          defaultSurveyData?.error ||
          !activityData?.activityId
        ) {
          setError(t("Ocorreu um erro, tente novamente."));
        } else {
          if (!state.activity) {
            dispatch({
              type: "ACTIVITY",
              payload: { activity: activityData },
            });
          }
          if (!state.registration) {
            dispatch({
              type: "REGISTRATION",
              payload: { registration: registrationData },
            });
          }
          if (!state.default) {
            dispatch({
              type: "DEFAULT",
              payload: { default: defaultSurveyData },
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
          formatSurveyData(
            defaultSurveyData,
            activityData.verification,
            registrationData
          );
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
      state.default,
      state.registration,
      state.token,
      t,
    ]
  );

  const userAcceptPrivacity = () => {
    setShowPrivacityModal(false);
    const acceptedTime = format(new Date(), "dd/MM/yy HH:mm");
    dispatch({
      type: "PRIVACITY",
      payload: { privacity: acceptedTime },
    });
  };

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
        <div className="flex flex-grow justify-center items-center mt-2">
          <Loading size="w-20 w-20" />
        </div>
      ) : (
        <div className="container mx-auto bg-background-50 p-4">
          {!showPrivacityModal && !state.privacity && (
            <PrivacityBanner
              activity={activity}
              openPrivacityModal={setShowPrivacityModal}
              userAcceptPrivacity={userAcceptPrivacity}
            />
          )}
          {showPrivacityModal ? (
            <PrivacityModal
              activity={activity}
              userAcceptPrivacity={userAcceptPrivacity}
            />
          ) : (
            <>
              {activity && (
                <>
                  <TopBar step={1} activity={activity} />
                  {(error || warning) && (
                    <div className="mt-2">
                      {error && (
                        <Alert message={error} type="danger" center={true} />
                      )}
                      {warning && (
                        <Alert message={warning} type="warning" center={true} />
                      )}
                    </div>
                  )}
                  {requiredQuestions.length > 0 && (
                    <div className="w-full mt-4">
                      <Alert
                        title="Obrigatórias"
                        message={requiredQuestions.join(" / ")}
                        type="danger"
                      />
                    </div>
                  )}
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-wrap justify-center items-start"
                  >
                    {defaultSurvey.map((question, i) => (
                      <div
                        key={`${question.question}#${i}`}
                        className="w-1/2 xl:w-1/3 px-2 my-4"
                      >
                        <label
                          htmlFor={question.question}
                          className="block leading-6 font-semibold"
                        >
                          {question.question}{" "}
                          {questionRequired(question) && (
                            <span className="text-danger-500">*</span>
                          )}
                        </label>
                        <div className="mt-2">
                          {question.type === "special" &&
                            question.questionId !== 4 && (
                              <input
                                type="text"
                                name={question.question}
                                id={question.question}
                                // required={questionRequired(question)}
                                disabled={questionDisabled(question)}
                                value={formValues[question.questionId] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    question.questionId,
                                    e.target.value
                                  )
                                }
                                className="block w-full px-4 py-2 text-text-700 placeholder-text-500 bg-white border rounded-lg"
                              />
                            )}
                          {question.type === "special" &&
                            question.questionId === 4 && (
                              <select
                                name={question.question}
                                id={question.question}
                                // required={questionRequired(question)}
                                value={formValues[question.questionId] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    question.questionId,
                                    e.target.value
                                  )
                                }
                                className="block w-full px-4 py-2 text-text-700 placeholder-text-500 bg-white border rounded-lg"
                              >
                                <option value="">Selecione</option>
                                {STATESBR.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.text}
                                  </option>
                                ))}
                              </select>
                            )}
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
                                    // required={questionRequired(question)}
                                    type="radio"
                                    checked={
                                      formValues?.[question.questionId] ===
                                      answer.answerId
                                    }
                                    value={
                                      formValues[question.questionId] || ""
                                    }
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
                              // required={questionRequired(question)}
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
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default DefaultSurvey;
