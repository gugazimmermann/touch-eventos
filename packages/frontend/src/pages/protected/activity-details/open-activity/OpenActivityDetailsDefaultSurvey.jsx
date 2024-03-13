import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../../../constants/routes";
import { activity } from "../../../../services";
import { ArrowBackCircle } from "../../../../icons";
import { Alert, Loading } from "../../../../components";
import { AdminTopNav } from "../../../../components/layout";

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

const OpenActivityDetailsDefaultSurvey = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [survey, setSurvey] = useState([]);
  const [visibleItems, setVisibleItems] = useState({});

  const formatSurveyData = (data) => {
    const sortedData = data.sort((a, b) => {
      if (a.order === b.order) return (a.answerOrder || 0) - (b.answerOrder || 0);
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

  const getData = useCallback(async (id) => {
    setLoading(true);
    try {
      const surveyData = await activity.getDefaultSurvey(id);
      if (surveyData?.error) setError(surveyData?.error);
      else formatSurveyData(surveyData);
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
          onClick={() => navigate(`/${ROUTES.ADMIN.OPENACTIVITY}/${activityId}`)}
        >
          <ArrowBackCircle />
          <h2 className="text-2xl text-strong ml-2">{t("Pesquisa Padrão")}</h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="w-full bg-white rounded-lg shadow-lg">
              <div className="container px-4 mx-auto my-4">
                {survey.length > 0 &&
                  survey.map((s, i) => (
                    <div key={`q#${i}`} className="rounded-t-lg border border-neutral-200 mb-2">
                      <h2 className="mb-0">
                        <div className="flex w-full items-center rounded-t-xl border-0 px-4 py-2 text-left border-b border-slate-200">
                          {i + 1} - {s.question}
                          <span className="text-red-500 ml-1">
                            {s.required && "*"}
                          </span>
                          <span className="text-sm ml-2">
                            ({answersType.find((t) => t.value === s.type).text})
                          </span>
                          {s.type !== "descriptive" && s.type !== "special" && (
                            <div className="flex items-center ml-auto gap-4">
                              <button
                                className={`h-5 w-5 transform ${
                                  visibleItems[i] ? "rotate-180" : ""
                                }`}
                                type="button"
                                onClick={() => toggleItemVisibility(i)}
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
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default OpenActivityDetailsDefaultSurvey;
