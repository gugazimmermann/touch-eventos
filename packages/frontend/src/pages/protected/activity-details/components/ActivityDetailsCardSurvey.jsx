import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../../constants/routes";

const ActivityDetailsCardSurvey = ({
  activityId,
  surveys,
  surveysStarted,
  surveysCompleted,
}) => {
  const { t } = useTranslation("activity_details");
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col justify-between items-center bg-success-50 rounded-lg shadow-lg cursor-pointer">
      <div className="w-full py-4 text-center">
        <h2 className="text-xl text-strong">
          {t("activity_details_card_survey_survey")}
        </h2>
      </div>
      <div className="w-full flex flex-row pb-4">
        <button
          className="w-1/3 text-center"
          onClick={() =>
            navigate(
              `/${ROUTES.ADMIN.ACTIVITY}/${activityId}/${ROUTES.ADMIN.DEFAULT_SURVEYS}`
            )
          }
        >
          <h2 className="text-4xl font-bold">14</h2>
          <h5 className="text-lg font-medium">
            {t("Padrão")}
          </h5>
        </button>
        <button
          className="w-1/3 text-center"
          onClick={() =>
            navigate(
              `/${ROUTES.ADMIN.ACTIVITY}/${activityId}/${ROUTES.ADMIN.SURVEYS}/pt-BR`
            )
          }
        >
          <h2 className="text-4xl font-bold">{surveys?.[0]?.question_count}</h2>
          <h5 className="text-lg font-medium">{t("Perguntas")}</h5>
        </button>
        <button
          className="w-1/3 text-center"
          onClick={() =>
            navigate(
              `/${ROUTES.ADMIN.ACTIVITY}/${activityId}/${ROUTES.ADMIN.SURVEYS}/pt-BR`
            )
          }
        >
          <h2 className="text-4xl font-bold">{surveysStarted}</h2>
          <h5 className="text-lg font-medium">
            {t("Respondidas")}
          </h5>
        </button>
      </div>
    </div>
  );
};

export default ActivityDetailsCardSurvey;
