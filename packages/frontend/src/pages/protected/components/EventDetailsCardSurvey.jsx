import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes";

const EventDetailsCardSurvey = ({
  eventId,
  surveysStarted,
  surveysCompleted,
}) => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  return (
    <button
      className="w-full flex flex-col justify-between items-center bg-success-50 rounded-lg shadow-lg cursor-pointer"
      onClick={() =>
        navigate(`/${ROUTES.ADMIN.EVENT}/${eventId}/${ROUTES.ADMIN.SURVEYS}`)
      }
    >
      <div className="w-full py-4 text-center">
        <h2 className="text-xl text-strong">Pesquisa</h2>
      </div>
      <div className="w-full flex flex-row pb-4">
          <div className="w-1/2 text-center">
            <h2 className="text-4xl font-bold">{surveysStarted}</h2>
            <h5 className="text-lg font-medium">Participantes</h5>
          </div>
          <div className="w-1/2 text-center">
            <h2 className="text-4xl font-bold">{surveysCompleted}</h2>
            <h5 className="text-lg font-medium">Completas</h5>
          </div>
        </div>
    </button>
  );
};

export default EventDetailsCardSurvey;
