import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../../constants/routes";
import { Clipboard } from "../../../../icons";

const ActivityDetailsCardDesk = ({ activityId, slug, desk }) => {
  const { t } = useTranslation("activity_details");
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col p-4 bg-white rounded-lg shadow-lg">
      <div className="w-full mb-4 flex flex-row items-center">
        <h2 className="font-bold mr-2">{t("activity_details_card_desk_url")}:</h2>
        <a
          href={`${String(process.env.REACT_APP_SITE_DESK_URL)}/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline mr-2"
        >
          {String(process.env.REACT_APP_SITE_DESK_URL)}/{slug}
        </a>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(
              `${String(process.env.REACT_APP_SITE_DESK_URL)}/${slug}`
            );
          }}
        >
          <Clipboard />
        </button>
      </div>
      <div className="w-full flex flex-row justify-between items-center">
        <div className="w-2/3 text-left flex flex-row justify-start items-center">
          <span className="mr-2 font-bold">{t("activity_details_card_desk_registers")}: </span>
          {desk === 0 ? (
            <span className="ml-2 inline-block whitespace-nowrap rounded-lg bg-danger-100 text-center align-baseline text-sm px-2 py-1 font-bold leading-none text-danger-500">
              {t("activity_details_card_desk_registers_zero")}
            </span>
          ) : desk === 1 ? (
            <span>1{' '}{t("activity_details_card_desk_registers_single")}</span>
          ) : (
            <span>{desk}{' '}{t("activity_details_card_desk_registers_plural")}</span>
          )}
        </div>
        <div className="w-1/3 text-right">
          <button
            type="button"
            className="px-4 py-1 text-sm tracking-wide text-white bg-primary-500 capitalize rounded-lg"
            onClick={() =>
              navigate(`/${ROUTES.ADMIN.ACTIVITY}/${activityId}/${ROUTES.ADMIN.DESK}`)
            }
          >
           {t("activity_details_card_details_manage_desk")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsCardDesk;