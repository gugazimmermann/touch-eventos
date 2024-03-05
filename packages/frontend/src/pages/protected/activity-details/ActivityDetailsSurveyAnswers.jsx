import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import ROUTES from "../../../constants/routes";
import { activity } from "../../../services";
import { ArrowBackCircle } from "../../../icons";
import { Alert, Loading } from "../../../components";
import { AdminTopNav } from "../../../components/layout";
import PieGraph from "../charts/PieGraph";
import RegisterLineGraph from "../charts/RegisterLineGraph";
import RegisterBarGraph from "../charts/RegisterBarGraph";
import RegisterByGenderLineGraph from "../charts/RegisterByGenderLineGraph";
import RegisterByGenderBarGraph from "../charts/RegisterByGenderBarGraph";
import RegisterByAgeLineGraph from "../charts/RegisterByAgeLineGraph";
import RegisterByAgeBarGraph from "../charts/RegisterByAgeBarGraph";

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
  {
    value: "special",
    text: "Especial",
  },
];

const ActivityDetailsSurveyAnswers = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleItems, setVisibleItems] = useState({});
  const [tab, setTab] = useState(1);
  const [defaultTab, setDefaultTab] = useState(1);
  const [surveyTab, setSurveyTab] = useState(1);

  const [activityDays, setActivityDays] = useState([]);

  const [registerTotalBase, setRegisterTotalBase] = useState([]);

  const [registerTotal, setRegisterTotal] = useState([]);
  const [defaultQuestions, setDefaultQuestions] = useState([]);
  const [surveyQuestions, setSurveyQuestions] = useState([]);

  const [selectedRegisterDay, setSelectedRegisterDay] = useState("");

  const filterRegisterByDay = (day) => {
    setSelectedRegisterDay(day);

    const filteredTotalData = day
      ? registerTotalBase.total.filter(
          (d) => format(new Date(d.date_time), "dd/MM/yy") === day
        )
      : registerTotalBase.total;

    const filteredGenderData = day
      ? registerTotalBase.gender.filter(
          (d) => format(new Date(d.date_time), "dd/MM/yy") === day
        )
      : registerTotalBase.gender;

      const filteredAgeData = day
      ? registerTotalBase.age.filter(
          (d) => format(new Date(d.date_time), "dd/MM/yy") === day
        )
      : registerTotalBase.age;

    setRegisterTotal({
      total: filteredTotalData,
      gender: filteredGenderData,
      age: filteredAgeData,
    });
  };

  const handleDays = (data) => {
    const days = [
      ...new Set(data.map((d) => format(new Date(d.date_time), "dd/MM/yy"))),
    ];
    setActivityDays(days);
  };

  const formatData = (questionsData, anwsersData) => {
    const sortedQuestions = questionsData.sort((a, b) => {
      if (a.order === b.order)
        return (a.answerOrder || 0) - (b.answerOrder || 0);
      return a.order - b.order;
    });
    const grouped = sortedQuestions.reduce((acc, current) => {
      if (!acc[current.questionId]) {
        acc[current.questionId] = {
          question: current.question,
          type: current.type,
          answers: [],
        };
      }
      const questionTotal = anwsersData.reduce((a, c) => {
        if (c.questionId === current.questionId) a += c.totalAnswerId;
        return a;
      }, 0);

      const quantity =
        anwsersData.find((d) => d.answerId === current.answerId)
          ?.totalAnswerId || 0;

      acc[current.questionId].answers.push({
        answer: current.answer,
        quantity: quantity,
        percentage: (quantity * 100) / questionTotal,
      });
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const getData = useCallback(async (id) => {
    setLoading(true);
    try {
      const [
        getRegisters,
        defaultSurveyData,
        getDefaultSurveyAnwsers,
        surveyData,
        getSurveyAnwsers,
      ] = await Promise.all([
        await activity.getRegisters(id),
        await activity.getDefaultSurvey(id),
        await activity.getDefaultSurveyAnwsers(id),
        await activity.getSurvey(id, "pt-BR"),
        await activity.getSurveyAnwsers(id, "pt-BR"),
      ]);
      // pagination-model
      // let defaultSurveyAnwsersData = [];
      // let limit = 2500;
      // let offset = 0;
      // let hasMoreData = true;
      //
      // while (hasMoreData) {
      //   const getDefaultSurveyAnwsers = await activity.getDefaultSurveyAnwsers(
      //     id,
      //     limit,
      //     offset
      //   );
      //   if (getDefaultSurveyAnwsers.length > 0) {
      //     offset += getDefaultSurveyAnwsers.length;
      //     defaultSurveyAnwsersData = [
      //       ...defaultSurveyAnwsersData,
      //       ...getDefaultSurveyAnwsers,
      //     ];
      //   } else {
      //     hasMoreData = false;
      //   }
      // }
      if (
        getRegisters?.error ||
        defaultSurveyData?.error ||
        getDefaultSurveyAnwsers?.error ||
        surveyData?.error ||
        getSurveyAnwsers?.error
      )
        setError(
          getRegisters?.error ||
            defaultSurveyData?.error ||
            getDefaultSurveyAnwsers?.error ||
            surveyData?.error ||
            getSurveyAnwsers?.error
        );
      else {
        handleDays(getRegisters.total);
        setRegisterTotalBase(getRegisters);

        setRegisterTotal(getRegisters);
        setDefaultQuestions(
          formatData(defaultSurveyData, getDefaultSurveyAnwsers)
        );
        setSurveyQuestions(formatData(surveyData, getSurveyAnwsers));
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }, []);

  const toggleItemVisibility = (index) => {
    setVisibleItems((prevVisibleItems) => ({
      ...prevVisibleItems,
      [index]: !prevVisibleItems[index],
    }));
  };

  useEffect(() => {
    if (activityId) getData(activityId);
    else navigate(`/${ROUTES.ADMIN.DASHBOARD}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, getData]);

  return (
    <section className="w-full px-4 mb-8">
      {error && <Alert message={error} type="danger" />}
      <AdminTopNav title={t("activity_details_title")} />
      <div className="flex flex-col justify-start items-start gap-4">
        <button
          className="flex flow-row justify-center items-center"
          onClick={() => navigate(`/${ROUTES.ADMIN.ACTIVITY}/${activityId}`)}
        >
          <ArrowBackCircle />
          <h2 className="text-2xl text-strong ml-2">
            {t("Respostas da Pesquisa")}
          </h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full bg-white rounded-lg shadow-lg">
            <div className="container flex flex-col mx-auto">
              <div className="flex flex-row justify-center items-center gap-4 p-4">
                <button
                  className={`text-xl ${
                    tab === 1 && "text-strong border-b-2 border-b-primary-500"
                  }`}
                  onClick={() => setTab(1)}
                >
                  {t("Cadastros")}
                </button>
                <button
                  className={`text-xl ${
                    tab === 2 && "text-strong border-b-2 border-b-primary-500"
                  }`}
                  onClick={() => setTab(2)}
                >
                  {t("Pesquisa Padrão")}
                </button>
                <button
                  className={`text-xl ${
                    tab === 3 && "text-strong border-b-2 border-b-primary-500"
                  }`}
                  onClick={() => setTab(3)}
                >
                  {t("Pesquisa da Atividade")}
                </button>
              </div>

              {/* CADASTROS */}
              <div
                className={`${
                  tab === 1 ? "flex flex-row" : "hidden"
                } opacity-100 transition-opacity duration-150 ease-linear`}
              >
                <div className="m-4 w-28 flex flex-col flex-none gap-4">
                  <button className="text-left text-strong border-b-2 border-b-primary-500">
                    Gráficos
                  </button>
                  <select
                    className="px-2 py-1 text-sm bg-white border rounded-md"
                    value={selectedRegisterDay}
                    onChange={(e) => filterRegisterByDay(e.target.value)}
                  >
                    <option value="">Dias</option>
                    <option value="">Todos</option>
                    {activityDays.map((d) => (
                      <option key={`register#${d}`} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-initial flex-grow px-2">
                  {/* GRÁFICO */}
                  <div className="block opacity-100 transition-opacity duration-150 ease-linear">
                    <div className="flex w-full flex-wrap justify-center items-center">
                      <RegisterLineGraph
                        question="Cadastros por Hora"
                        answers={registerTotal.total || []}
                      />
                      <RegisterBarGraph
                        question="Cadastros por Dia"
                        answers={registerTotal.total || []}
                      />
                      <RegisterByGenderLineGraph
                        question="Gêneros por Hora"
                        answers={registerTotal.gender || []}
                      />
                      <RegisterByGenderBarGraph
                        question="Gêneros por Dia"
                        answers={registerTotal.gender || []}
                      />
                      <RegisterByAgeLineGraph
                        question="Idade por Hora"
                        answers={registerTotal.age || []}
                      />
                      <RegisterByAgeBarGraph
                        question="Idade por Dia"
                        answers={registerTotal.age || []}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* / CADASTROS */}

              {/* PESQUISA PADRAO */}
              <div
                className={`${
                  tab === 2 ? "flex flex-row" : "hidden"
                } opacity-100 transition-opacity duration-150 ease-linear`}
              >
                <div className="m-4 w-28 flex flex-col flex-none gap-4">
                  <button
                    className={`text-left border-b ${
                      defaultTab === 1 &&
                      "text-strong border-b-2 border-b-primary-500"
                    }`}
                    onClick={() => setDefaultTab(1)}
                  >
                    Relatório
                  </button>
                  <button
                    className={`text-left border-b ${
                      defaultTab === 2 &&
                      "text-strong border-b-2 border-b-primary-500"
                    }`}
                    onClick={() => setDefaultTab(2)}
                  >
                    Gráficos
                  </button>
                </div>

                <div className="flex-initial flex-grow px-2">
                  {/* RELATÓRIO */}
                  {defaultTab === 1 && (
                    <div
                      className={`${
                        defaultTab === 1 ? "block" : "hidden"
                      } opacity-100 transition-opacity duration-150 ease-linear`}
                    >
                      {defaultQuestions.length > 0 &&
                        defaultQuestions.map((question, i) => (
                          <div
                            key={`q#${i}`}
                            className="rounded-t-lg border border-neutral-200 mb-2"
                          >
                            <h2 className="mb-0">
                              <div className="flex w-full items-center rounded-t-xl border-0 px-4 py-2 text-left border-b border-slate-200">
                                {i + 1} - {question.question}
                                <span className="text-red-500 ml-1">
                                  {question.required && "*"}
                                </span>
                                <span className="text-sm ml-2">
                                  (
                                  {
                                    answersType.find(
                                      (t) => t.value === question.type
                                    ).text
                                  }
                                  )
                                </span>
                                {question.type !== "descriptive" &&
                                  question.type !== "special" && (
                                    <div className="flex items-center ml-auto gap-4">
                                      <button
                                        className={`h-5 w-5 transform ${
                                          visibleItems[`d#${i}`]
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                        type="button"
                                        onClick={() =>
                                          toggleItemVisibility(`d#${i}`)
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
                                    </div>
                                  )}
                              </div>
                            </h2>
                            {visibleItems[`d#${i}`] && (
                              <div className="">
                                {defaultQuestions.type !== "descriptive" &&
                                  defaultQuestions.type !== "special" && (
                                    <ol className="px-8 pt-1" type="1">
                                      {question.answers.map((a, j) => (
                                        <li
                                          key={`${i}#${j}`}
                                          className="flex w-full items-center border-b border-slate-200 py-2 last:border-b-0"
                                        >
                                          {j + 1} - {a.answer} - {a.quantity} (
                                          {a.percentage.toFixed(2)}%)
                                        </li>
                                      ))}
                                    </ol>
                                  )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                  {/* GRÁFICO */}
                  {defaultTab === 2 && (
                    <div
                      className={`${
                        defaultTab === 2 ? "block" : "hidden"
                      } opacity-100 transition-opacity duration-150 ease-linear`}
                    >
                      <div className=" flex w-full flex-wrap justify-center items-center">
                        {defaultQuestions.length > 0 &&
                          defaultQuestions.map((question, i) => {
                            if (
                              question.type !== "descriptive" &&
                              question.type !== "special"
                            ) {
                              return (
                                <PieGraph
                                  key={`${question.question}#${i}`}
                                  question={question.question}
                                  answers={question.answers}
                                />
                              );
                            } else {
                              return null;
                            }
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* / PESQUISA PADRAO */}

              {/* PESQUISA ATIVIDADE */}
              <div
                className={`${
                  tab === 3 ? "flex flex-row" : "hidden"
                } opacity-100 transition-opacity duration-150 ease-linear`}
              >
                <div className="m-4 w-28 flex flex-col flex-none gap-4">
                  <button
                    className={`text-left border-b ${
                      surveyTab === 1 &&
                      "text-strong border-b-2 border-b-primary-500"
                    }`}
                    onClick={() => setSurveyTab(1)}
                  >
                    Relatório
                  </button>
                  <button
                    className={`text-left border-b ${
                      surveyTab === 2 &&
                      "text-strong border-b-2 border-b-primary-500"
                    }`}
                    onClick={() => setSurveyTab(2)}
                  >
                    Gráficos
                  </button>
                </div>

                <div className="flex-initial flex-grow px-2">
                  {/* RELATÓRIO */}
                  {surveyTab === 1 && (
                    <div
                      className={`${
                        surveyTab === 1 ? "block" : "hidden"
                      } opacity-100 transition-opacity duration-150 ease-linear`}
                    >
                      {surveyQuestions.length > 0 &&
                        surveyQuestions.map((question, i) => (
                          <div
                            key={`q#${i}`}
                            className="rounded-t-lg border border-neutral-200 mb-2"
                          >
                            <h2 className="mb-0">
                              <div className="flex w-full items-center rounded-t-xl border-0 px-4 py-2 text-left border-b border-slate-200">
                                {i + 1} - {question.question}
                                <span className="text-red-500 ml-1">
                                  {question.required && "*"}
                                </span>
                                <span className="text-sm ml-2">
                                  (
                                  {
                                    answersType.find(
                                      (t) => t.value === question.type
                                    ).text
                                  }
                                  )
                                </span>
                                {question.type !== "descriptive" &&
                                  question.type !== "special" && (
                                    <div className="flex items-center ml-auto gap-4">
                                      <button
                                        className={`h-5 w-5 transform ${
                                          visibleItems[`s#${i}`]
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                        type="button"
                                        onClick={() =>
                                          toggleItemVisibility(`s#${i}`)
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
                                    </div>
                                  )}
                              </div>
                            </h2>
                            {visibleItems[`s#${i}`] && (
                              <div className="">
                                {surveyQuestions.type !== "descriptive" &&
                                  surveyQuestions.type !== "special" && (
                                    <ol className="px-8 pt-1" type="1">
                                      {question.answers.map((a, j) => (
                                        <li
                                          key={`${i}#${j}`}
                                          className="flex w-full items-center border-b border-slate-200 py-2 last:border-b-0"
                                        >
                                          {j + 1} - {a.answer} - {a.quantity} (
                                          {a.percentage.toFixed(2)}%)
                                        </li>
                                      ))}
                                    </ol>
                                  )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                  {/* GRÁFICO */}
                  {surveyTab === 2 && (
                    <div
                      className={`${
                        surveyTab === 2 ? "block" : "hidden"
                      } opacity-100 transition-opacity duration-150 ease-linear`}
                    >
                      <div className=" flex w-full flex-wrap justify-center items-center">
                        {surveyQuestions.length > 0 &&
                          surveyQuestions.map((question, i) => {
                            if (
                              question.type !== "descriptive" &&
                              question.type !== "special"
                            ) {
                              return (
                                <PieGraph
                                  key={`${question.question}#${i}`}
                                  question={question.question}
                                  answers={question.answers}
                                />
                              );
                            } else {
                              return null;
                            }
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* / PESQUISA ATIVIDADE */}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityDetailsSurveyAnswers;
