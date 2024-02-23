import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../../constants/routes";

const ActivityDetailsCardSurvey = ({
  activityId,
  surveysStarted,
  surveysCompleted,
}) => {
  const { t } = useTranslation("activity_details");
  const navigate = useNavigate();

  return (
    <button
      className="w-full flex flex-col justify-between items-center bg-success-50 rounded-lg shadow-lg cursor-pointer"
      onClick={() =>
        navigate(`/${ROUTES.ADMIN.ACTIVITY}/${activityId}/${ROUTES.ADMIN.SURVEYS}`)
      }
    >
      <div className="w-full py-4 text-center">
        <h2 className="text-xl text-strong">
          {t("activity_details_card_survey_survey")}
        </h2>
      </div>
      <div className="w-full flex flex-row pb-4">
        <div className="w-1/2 text-center">
          <h2 className="text-4xl font-bold">{surveysStarted}</h2>
          <h5 className="text-lg font-medium">{t("activity_details_card_survey_done")}</h5>
        </div>
        <div className="w-1/2 text-center">
          <h2 className="text-4xl font-bold">{surveysCompleted}</h2>
          <h5 className="text-lg font-medium">{t("activity_details_card_survey_completed")}</h5>
        </div>
      </div>
    </button>
  );
};

export default ActivityDetailsCardSurvey;
