import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDays, format, isBefore } from "date-fns";
import { useTranslation } from "react-i18next";
import { useActivities } from "../../../../context/ActivitiesContext";
import ROUTES from "../../../../constants/routes";
import { activity } from "../../../../services";
import { ArrowBackCircle, Download } from "../../../../icons";
import { Alert, Loading } from "../../../../components";
import { AdminTopNav } from "../../../../components/layout";
import PieGraph from "../../charts/PieGraph";
import RegisterLineGraph from "../../charts/RegisterLineGraph";
import RegisterBarGraph from "../../charts/RegisterBarGraph";
import RegisterByGenderLineGraph from "../../charts/RegisterByGenderLineGraph";
import RegisterByGenderBarGraph from "../../charts/RegisterByGenderBarGraph";
import RegisterByAgeLineGraph from "../../charts/RegisterByAgeLineGraph";
import RegisterByAgeBarGraph from "../../charts/RegisterByAgeBarGraph";

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

const OpenActivityDetailsSurveyAnswers = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { state } = useActivities();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentActivity, setCurrentActivity] = useState();
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
  const [gettingData, setGettingData] = useState(false);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [noData, setNoData] = useState(false);
  const [showData, setShowData] = useState(true);

  const exportRegistersToCSV = (registersData) => {
    const properties = [
      "Cadastro",
      "Nome",
      "Email",
      "Telefone",
      "Cidade",
      "Estado",
      "Gênero",
      "Gênero - Outros",
      "Faixa Etária",
    ];
    const csvRows = [];
    csvRows.push(properties.join(","));
    registersData.forEach((row) => {
      const values = properties.map((property) => {
        let value = row[property];
        if (value === null || value === undefined) value = "";
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cadastros-${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadRegisters = async () => {
    setGettingData(true);
    const { count } = await activity.getSurveyRegistersDownloadCount(
      activityId
    );
    setProgressTotal(count);
    let surveyRegistersDownload = [];
    let limit = 500;
    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const getSurveyRegistersDownload =
        await activity.getSurveyRegistersDownload(activityId, limit, offset);
      if (getSurveyRegistersDownload.length > 0) {
        offset += getSurveyRegistersDownload.length;
        surveyRegistersDownload = [
          ...surveyRegistersDownload,
          ...getSurveyRegistersDownload,
        ];
        setProgress(offset);
      } else {
        hasMoreData = false;
      }
    }
    setProgressTotal(0);
    setProgress(0);
    exportRegistersToCSV(surveyRegistersDownload);
    setGettingData(false);
  };

  const exportDefaultToCSV = (registersData) => {
    const properties = [
      "Cadastro",
      "Nome",
      "Email",
      "Telefone",
      "Pergunta",
      "Resposta",
      "Resposta Descritiva",
    ];
    const csvRows = [];
    csvRows.push(properties.join(","));
    registersData.forEach((row) => {
      const values = properties.map((property) => {
        let value = row[property];
        if (value === null || value === undefined) value = "";
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pesquisa-padrao-${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDefault = async () => {
    setGettingData(true);
    const { count } = await activity.getSurveyDefaultDownloadCount(activityId);
    setProgressTotal(count);
    let surveyDefaultDownload = [];
    let limit = 500;
    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const getSurveyDefaultDownload = await activity.getSurveyDefaultDownload(
        activityId,
        limit,
        offset
      );
      if (getSurveyDefaultDownload.length > 0) {
        offset += getSurveyDefaultDownload.length;
        surveyDefaultDownload = [
          ...surveyDefaultDownload,
          ...getSurveyDefaultDownload,
        ];
        setProgress(offset);
      } else {
        hasMoreData = false;
      }
    }
    setProgressTotal(0);
    setProgress(0);
    exportDefaultToCSV(surveyDefaultDownload);
    setGettingData(false);
  };

  const exportActivityToCSV = (registersData) => {
    const properties = [
      "Cadastro",
      "Nome",
      "Email",
      "Telefone",
      "Pergunta",
      "Resposta",
      "Resposta Descritiva",
    ];
    const csvRows = [];
    csvRows.push(properties.join(","));
    registersData.forEach((row) => {
      const values = properties.map((property) => {
        let value = row[property];
        if (value === null || value === undefined) value = "";
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pesquisa-atividade-${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadActivity = async () => {
    setGettingData(true);
    const { count } = await activity.getSurveyActivityDownloadCount(activityId);
    setProgressTotal(count);
    let surveyDefaultDownload = [];
    let limit = 500;
    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const getSurveyDefaultDownload = await activity.getSurveActivityDownload(
        activityId,
        limit,
        offset
      );
      if (getSurveyDefaultDownload.length > 0) {
        offset += getSurveyDefaultDownload.length;
        surveyDefaultDownload = [
          ...surveyDefaultDownload,
          ...getSurveyDefaultDownload,
        ];
        setProgress(offset);
      } else {
        hasMoreData = false;
      }
    }
    setProgressTotal(0);
    setProgress(0);
    exportActivityToCSV(surveyDefaultDownload);
    setGettingData(false);
  };

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
      const questionTotal = (anwsersData?.all || anwsersData).reduce((a, c) => {
        if (c.questionId === current.questionId) {
          a += c?.totalAnswerId || c?.totalCustonAnswer || 0;
        }
        return a;
      }, 0);

      const quantity =
        (anwsersData?.all || anwsersData).find(
          (d) => d.answerId === current.answerId
        )?.totalAnswerId || 0;
      if (current.answer) {
        acc[current.questionId].answers.push({
          answer: current.answer,
          quantity: quantity,
          percentage: (quantity * 100) / questionTotal,
        });
      }

      // descriptive
      if (
        anwsersData?.descriptive &&
        Object.hasOwn(anwsersData.descriptive, current.questionId)
      ) {
        anwsersData.descriptive[current.questionId].forEach((a) => {
          acc[current.questionId].answers.push({
            answer: a.custonAnswer,
            quantity: a.totalCustonAnswer,
            percentage: (a.totalCustonAnswer * 100) / questionTotal,
          });
        });
      }
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const getData = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const [
          activityData,
          getRegisters,
          defaultSurveyData,
          getDefaultSurveyAnwsers,
          surveyData,
          getSurveyAnwsers,
        ] = await Promise.all([
          await activity.getActivityById(id),
          await activity.getRegisters(id),
          await activity.getDefaultSurvey(id),
          await activity.getDefaultSurveyAnwsers(id),
          await activity.getSurvey(id, "pt-BR"),
          await activity.getSurveyAnwsers(id, "pt-BR"),
        ]);

        if (
          activityData?.error ||
          getRegisters?.error ||
          defaultSurveyData?.error ||
          getDefaultSurveyAnwsers?.error ||
          surveyData?.error ||
          getSurveyAnwsers?.error
        )
          setError(
            activityData?.error ||
              getRegisters?.error ||
              defaultSurveyData?.error ||
              getDefaultSurveyAnwsers?.error ||
              surveyData?.error ||
              getSurveyAnwsers?.error
          );
        else {
          setCurrentActivity(activityData);
          const viewDataEndDate = addDays(
            new Date(parseInt(activityData.endDate, 10)),
            30
          );
          if (
            state?.subscription?.endDate &&
            isBefore(
              new Date(parseInt(state.subscription.endDate, 10)),
              new Date()
            ) &&
            isBefore(viewDataEndDate, new Date())
          ) {
            setShowData(false);
          } else if (isBefore(viewDataEndDate, new Date())) {
            setShowData(false);
          }

          if (!getDefaultSurveyAnwsers.all.length) {
            setNoData(true);
          } else {
            handleDays(getRegisters.total);
            setRegisterTotalBase(getRegisters);
            setRegisterTotal(getRegisters);
            setDefaultQuestions(
              formatData(defaultSurveyData, getDefaultSurveyAnwsers)
            );
            setSurveyQuestions(formatData(surveyData.data, getSurveyAnwsers));
          }
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    [state.subscription.endDate]
  );

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
          onClick={() =>
            navigate(`/${ROUTES.ADMIN.OPENACTIVITY}/${activityId}`)
          }
        >
          <ArrowBackCircle />
          <h2 className="text-2xl text-strong ml-2">
            {t("Relatórios das Pesquisas")} - {currentActivity?.name}
          </h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full bg-white rounded-lg shadow-lg">
            <div className="container flex flex-col mx-auto">
              {!showData ? (
                <div className="w-full p-8">
                  <Alert
                    message="Prazo de retenção dos dados expirado"
                    type="warning"
                  />
                </div>
              ) : noData ? (
                <div className="w-full p-8">
                  <Alert
                    message="Sem dados para mostrar."
                    type="info"
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-row justify-center items-center gap-4 p-4">
                    <button
                      className={`text-xl ${
                        tab === 1 &&
                        "text-strong border-b-2 border-b-primary-500"
                      }`}
                      onClick={() => setTab(1)}
                    >
                      {t("Cadastros")}
                    </button>
                    <button
                      className={`text-xl ${
                        tab === 2 &&
                        "text-strong border-b-2 border-b-primary-500"
                      }`}
                      onClick={() => setTab(2)}
                    >
                      {t("Pesquisa Padrão")}
                    </button>
                    <button
                      className={`text-xl ${
                        tab === 3 &&
                        "text-strong border-b-2 border-b-primary-500"
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
                      <button
                        className="flex flex-row gap-2"
                        onClick={() => downloadRegisters()}
                      >
                        <Download /> Dados
                      </button>
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
                      <button
                        className="flex flex-row gap-2"
                        onClick={() => downloadDefault()}
                      >
                        <Download /> Dados
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
                                    {question.answers.length > 0 && (
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
                                              {j + 1} - {a.answer} -{" "}
                                              {a.quantity} (
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
                      <button
                        className="flex flex-row gap-2"
                        onClick={() => downloadActivity()}
                      >
                        <Download /> Dados
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
                                              {j + 1} - {a.answer} -{" "}
                                              {a.quantity} (
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {gettingData && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-2">
              {t("Carregando Dados...")}
            </h2>
            <p>Esta ação pode levar alguns minutos, aguarde.</p>
            {progressTotal > 0 && (
              <div className="w-full h-6 bg-slate-100 max-w-md rounded-md">
                <div
                  className="h-6 bg-primary-600 rounded-md"
                  style={{ width: `${(100 * progress) / progressTotal}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default OpenActivityDetailsSurveyAnswers;
