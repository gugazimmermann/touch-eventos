import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ROUTES from "../../../../constants/routes";
import { activity } from "../../../../services";
import { ArrowBackCircle, XCircle } from "../../../../icons";
import { Alert, Loading } from "../../../../components";
import { AdminTopNav } from "../../../../components/layout";

const questionRequired = [
  {
    value: "NO",
    text: "Opcional",
  },
  {
    value: "YES",
    text: "Obrigatória",
  },
];

const answersType = [
  {
    value: "objective",
    text: "Objetiva",
  },
  {
    value: "single",
    text: "Escolha Simples",
  },
  {
    value: "multiple",
    text: "Escolha Múltipla",
  },
  {
    value: "descriptive",
    text: "Descritiva",
  },
];

const answerObjective = ["Sim", "Não"];

const initialValues = {
  question: "",
  required: false,
  type: "",
  answers: [],
};

const OpenActivityDetailsSurvey = () => {
  const { t } = useTranslation("activity_details");
  const { activityId, lang } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentActivity, setCurrentActivity] = useState();
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [values, setValues] = useState(initialValues);
  const [survey, setSurvey] = useState([]);
  const [visibleItems, setVisibleItems] = useState({});
  const [canEdit, setCanEdit] = useState(true);

  const formatSurveyData = (data) => {
    const sortedData = data.sort((a, b) => {
      if (a.order === b.order)
        return (a.answerOrder || 0) - (b.answerOrder || 0);
      return a.order - b.order;
    });
    const grouped = sortedData.reduce((acc, current) => {
      if (!acc[current.questionId]) {
        acc[current.questionId] = {
          question: current.question,
          type: current.type,
          answers: [],
        };
      }
      acc[current.questionId].answers.push(current.answer);
      return acc;
    }, {});
    setSurvey(Object.values(grouped));
  };

  const getData = useCallback(async (id, language) => {
    setLoading(true);
    try {
      const [activityData, surveyData] = await Promise.all([
        await activity.getActivityById(id),
        await activity.getSurvey(id, language),
      ]);
      if (activityData?.error || surveyData?.error || !surveyData?.data)
        setError(
          activityData?.error ||
            surveyData?.error ||
            "Erro ao carregar os dados."
        );
      else {
        if (surveyData.count > 0) setCanEdit(false);
        formatSurveyData(surveyData.data);
        setCurrentActivity(activityData)
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }, []);

  const handleSaveSurveySubmit = async () => {
    if (!survey.length) return;
    setLoading(true);
    await activity.saveSurvey(activityId, lang, survey);
    setValues(initialValues);
    setSurvey([]);
    await getData(activityId);
  };

  const handleSaveAnswerSubmit = async () => {
    setSurvey([...survey, values]);
    setValues(initialValues);
  };

  const handleAddAnswer = (e) => {
    e.preventDefault();
    setValues({
      ...values,
      answers: [...values.answers, currentAnswer],
    });
    setCurrentAnswer("");
  };

  const canSaveAnswer = () => {
    if (
      loading ||
      !values.question ||
      !values.type ||
      (values.type !== "descriptive" && !values.answers.length)
    ) {
      return false;
    }
    return true;
  };

  const onAnswerDragEnd = (result) => {
    if (!result.destination) return;
    const newAnswers = Array.from(values.answers);
    const [reorderedItem] = newAnswers.splice(result.source.index, 1);
    newAnswers.splice(result.destination.index, 0, reorderedItem);
    setValues({ ...values, answers: newAnswers });
  };

  const onQuestionDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = Array.from(survey);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setSurvey(newItems);
  };

  const toggleItemVisibility = (index) => {
    setVisibleItems((prevVisibleItems) => ({
      ...prevVisibleItems,
      [index]: !prevVisibleItems[index],
    }));
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    setSurvey((survey) => {
      return survey.map((question, i) => {
        if (i === questionIndex) {
          if (
            question.answers.length > 1 &&
            question.type !== "descriptive" &&
            question.type !== "objective"
          ) {
            question.answers = question.answers.filter(
              (_, j) => j !== answerIndex
            );
          }
        }
        return question;
      });
    });
  };

  const removeQuestion = (index) => {
    setSurvey((survey) => survey.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (activityId && lang) getData(activityId, lang);
    else navigate(`/${ROUTES.ADMIN.DASHBOARD}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, lang, getData]);

  return (
    <section className="w-full px-4 mb-8">
      {error && <Alert message={error} type="danger" />}
      <AdminTopNav title={t("activity_details_title")} />
      <div className="flex flex-col justify-start items-start gap-4">
        <button
          className="flex flow-row justify-center items-center"
          onClick={() =>
            navigate(`/${ROUTES.ADMIN.OPENACTIVITY}/${activityId}`)
          }
        >
          <ArrowBackCircle />
          <h2 className="text-2xl text-strong ml-2">
            {t("Pesquisa da Atividade")} - {currentActivity?.name}
          </h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <>
            {canEdit && (
              <div className="w-full bg-white rounded-lg shadow-lg">
                <div className="container px-4 mx-auto my-4">
                  <form onSubmit={handleAddAnswer}>
                    <div className="flex flex-row gap-4">
                      <div className="w-2/3">
                        <input
                          className="block w-full px-4 py-2 mt-4 text-text-700 placeholder-text-500 bg-white border rounded-lg"
                          disabled={loading}
                          required={true}
                          name="pergunta"
                          id="pergunta"
                          type="text"
                          placeholder="Pergunta"
                          value={values.question}
                          onChange={(e) =>
                            setValues({ ...values, question: e.target.value })
                          }
                        />
                      </div>
                      <div className="w-1/3 flex flex-row gap-2">
                        <select
                          className="block w-full px-4 py-2 mt-4 text-text-700 placeholder-text-500 bg-white border rounded-lg"
                          disabled={loading}
                          required={true}
                          name="tipo"
                          id="tipo"
                          placeholder="Tipo de Resposta"
                          value={values.type}
                          onChange={(e) => {
                            setValues({
                              ...values,
                              type: e.target.value,
                              answers:
                                e.target.value === "objective"
                                  ? answerObjective
                                  : [],
                            });
                            setCurrentAnswer("");
                          }}
                        >
                          <option value="">Tipo de Resposta</option>
                          {answersType.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.text}
                            </option>
                          ))}
                        </select>
                        <select
                          className="block w-full px-4 py-2 mt-4 text-text-700 placeholder-text-500 bg-white border rounded-lg"
                          disabled={loading}
                          required={true}
                          name="tipo"
                          id="tipo"
                          placeholder="Obrigatória"
                          value={values.required ? "YES" : "NO"}
                          onChange={(e) => {
                            setValues({
                              ...values,
                              required: e.target.value === "YES" ? true : false,
                            });
                            setCurrentAnswer("");
                          }}
                        >
                          {questionRequired.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.text}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(values.type === "single" ||
                      values.type === "multiple") && (
                      <div className="flex flex-row items-center gap-4">
                        <div className="w-2/3">
                          <input
                            className="block w-full px-4 py-2 mt-4 text-text-700 placeholder-text-500 bg-white border rounded-lg"
                            disabled={loading}
                            name="currentAnswer"
                            id="currentAnswer"
                            type="text"
                            placeholder="Resposta"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                          />
                        </div>
                        <button
                          data-testid="add-survey-submit"
                          disabled={loading || !currentAnswer}
                          type="submit"
                          className={`w-1/3 mt-4 px-6 py-2 text-sm font-medium tracking-wide capitalize rounded-lg text-white ${
                            !currentAnswer
                              ? "bg-secondary-500/50"
                              : "bg-secondary-500"
                          }`}
                        >
                          Adicionar
                        </button>
                      </div>
                    )}
                    {values?.answers?.length > 0 &&
                      values.type !== "descriptive" && (
                        <DragDropContext onDragEnd={onAnswerDragEnd}>
                          <Droppable droppableId="droppable-answer">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="w-full mt-4 px-4"
                              >
                                {values.answers.map((answer, index) => (
                                  <Draggable
                                    key={`${answer}#${index}`}
                                    draggableId={answer}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="w-full border-b border-slate-200 py-2"
                                      >
                                        {answer}
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      )}
                    <div className="flex flex-row justify-end">
                      <div className="w-1/3 px-2 mt-4">
                        <button
                          data-testid="add-survey-submit"
                          disabled={!canSaveAnswer()}
                          type="button"
                          className={`w-full px-6 py-2 text-sm font-medium tracking-wide capitalize rounded-lg text-white ${
                            !canSaveAnswer()
                              ? "bg-success-500/50"
                              : "bg-success-500"
                          }`}
                          onClick={() => handleSaveAnswerSubmit()}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <DragDropContext onDragEnd={onQuestionDragEnd}>
              <Droppable droppableId="droppable-survey">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="w-full bg-white rounded-lg shadow-lg"
                  >
                    <div className="container px-4 mx-auto my-4">
                      {survey.length > 0 &&
                        survey.map((s, i) => (
                          <Draggable
                            key={`${s.question}#${i}`}
                            draggableId={s.question}
                            index={i}
                            isDragDisabled={!canEdit}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="rounded-t-lg border border-neutral-200 mb-2"
                              >
                                <h2 className="mb-0">
                                  <div className="flex w-full items-center rounded-t-xl border-0 px-4 py-2 text-left border-b border-slate-200">
                                    {i + 1} - {s.question}
                                    <span className="text-red-500 ml-1">
                                      {s.required && "*"}
                                    </span>
                                    <span className="text-sm ml-2">
                                      (
                                      {
                                        answersType.find(
                                          (t) => t.value === s.type
                                        ).text
                                      }
                                      )
                                    </span>
                                    {s.type !== "descriptive" && (
                                      <div className="flex items-center ml-auto gap-4">
                                        <button
                                          className={`h-5 w-5 transform ${
                                            visibleItems[i] ? "rotate-180" : ""
                                          }`}
                                          type="button"
                                          onClick={() =>
                                            toggleItemVisibility(i)
                                          }
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="h-6 w-6"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                            />
                                          </svg>
                                        </button>
                                        {canEdit && (
                                          <button
                                            className="h-4 w-4 mt-1 text-danger-500"
                                            type="button"
                                            onClick={() => removeQuestion(i)}
                                          >
                                            <XCircle className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </h2>
                                {visibleItems[i] && (
                                  <div className="">
                                    {s.type !== "descriptive" && (
                                      <ol className="px-8 pt-1" type="1">
                                        {s.answers.map((a, j) => (
                                          <li
                                            key={`${i}#${j}`}
                                            className="flex w-full items-center border-b border-slate-200 py-2 last:border-b-0"
                                          >
                                            {j + 1} - {a}
                                            {s.answers.length > 1 &&
                                              s.type !== "descriptive" &&
                                              s.type !== "objective" &&
                                              canEdit && (
                                                <button
                                                  className="h-4 w-4 ml-auto text-danger-500"
                                                  type="button"
                                                  onClick={() =>
                                                    removeAnswer(i, j)
                                                  }
                                                >
                                                  <XCircle className="h-4 w-4" />
                                                </button>
                                              )}
                                          </li>
                                        ))}
                                      </ol>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                      {canEdit && (
                        <div className="flex flex-row justify-center">
                          <div className="w-1/3 px-2 mt-2">
                            <button
                              data-testid="add-survey-submit"
                              disabled={!survey.length}
                              type="button"
                              className={`w-full px-6 py-2 text-sm font-medium tracking-wide capitalize rounded-lg text-white ${
                                !survey.length
                                  ? "bg-primary-500/50"
                                  : "bg-primary-500"
                              }`}
                              onClick={() => handleSaveSurveySubmit()}
                            >
                              Salvar Pesquisa
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}
      </div>
    </section>
  );
};

export default OpenActivityDetailsSurvey;
