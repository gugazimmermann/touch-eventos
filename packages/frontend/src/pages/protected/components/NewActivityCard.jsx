import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../../constants/routes";

const NewActivityCard = ({ canCreate }) => {
  const { t } = useTranslation("admin");

  return (
    <div className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg ${canCreate ? 'bg-white' : 'bg-slate-100'}`}>
      <Link to={canCreate ? `/${ROUTES.ADMIN.CHOOSETYPE}` : ""} className={`${!canCreate && 'cursor-default'}`}>
        <img
          className="object-contain w-full h-36 p-8"
          src="/images/icon.png"
          alt="new activity"
        />
        <div className={`flex items-center p-2 ${canCreate ? 'bg-info-500' : 'bg-slate-500'}`}>
          <h1 className="font-semibold text-white text-center w-full">
            {t("dashboard_new_activity")}
          </h1>
        </div>
        <div className="p-2 pt-8 text-center text-sm">
          <p>{t("dashboard_new_activity_description")}</p>
        </div>
      </Link>
    </div>
  );
};

export default NewActivityCard;
