import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../constants/routes";
import { Br, Es, Us } from "react-flags-select";

const EventDetailsCardNewSurvey = ({ eventId, surveys = [] }) => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  const findSurveyQuantityByLang = (lang) => {
    return surveys.filter((s) => s.language === lang).length;
  };

  const RenderRow = ({ lang }) => {
    return (
      <div className="relative inline-flex w-fit">
        <div className="absolute -right-2.5 -top-1.5 z-10 rounded-full bg-primary-500  px-1.5 py-1.5 text-xs font-bold leading-none text-white">
          {findSurveyQuantityByLang(lang)}
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(
              `/${ROUTES.ADMIN.EVENT}/${eventId}/${ROUTES.ADMIN.SURVEYS}/${lang}`
            )
          }
        >
          {lang === "pt-BR" ? (
            <Br className="w-14 h-14 inline-block" />
          ) : lang === "en" ? (
            <Us className="w-14 h-14 inline-block" />
          ) : (
            <Es className="w-14 h-14 inline-block" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col justify-between items-center bg-info-100 rounded-lg shadow-lg cursor-pointer">
      <div className="w-full py-4 text-center">
        <h2 className="text-xl text-strong">Cadastrar Pesquisa</h2>
      </div>
      <div className="w-full flex flex-grow justify-evenly items-center pb-4">
        {["pt-BR", "en", "es"].map((l) => (
          <RenderRow key={l} lang={l} />
        ))}
      </div>
    </div>
  );
};

export default EventDetailsCardNewSurvey;