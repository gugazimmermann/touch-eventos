import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../constants/routes";

const EventNewCard = () => {
  const { t } = useTranslation("admin");

  return (
    <div className="w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-lg">
      <Link to={`/${ROUTES.ADMIN.NEWEVENT}`}>
        <img
          className="object-contain w-full h-36 p-8"
          src="/images/icon.png"
          alt="new event"
        />
        <div className="flex items-center p-2 bg-info-500">
          <h1 className="font-semibold text-white text-center w-full">
            {t("dashboard_new_event")}
          </h1>
        </div>
        <div className="p-2 pt-8 text-center">
          <p>{t("dashboard_new_event_description")}</p>
        </div>
      </Link>
    </div>
  );
};

export default EventNewCard;
