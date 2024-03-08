import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useActivities } from "../../context/ActivitiesContext";
import Logo from "./Logo";
import Nav from "./Nav";
import LangSelect from "./LangSelect";
import { format } from "date-fns";

const Header = ({ nav = true, lang = false, currentLang = 'pt-BR' }) => {
  const { state } = useActivities();
  const { t } = useTranslation(["layout"]);

  return (
    <header className="p-2 bg-white fixed w-full shadow-md top-0 left-0 right-0 z-40">
      <div className="container mx-auto flex flex-wrap items-center">
        <div className={`flex justify-start ${state?.subscription?.endDate ? 'w-1/3' : 'w-1/2'}`}>
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className={`flex justify-center items-center ${state?.subscription?.endDate && 'w-1/3'}`}>
          {state?.subscription?.endDate && (
            <h1>{t("header_plan_valid_until")}: {format(
              new Date(parseInt(state?.subscription.endDate, 10)),
              "dd/MM/yy"
            )}</h1>
          )}
        </div>
        <div className={`flex justify-end  ${state?.subscription?.endDate ? 'w-1/3' : 'w-1/2'}`}>
          {nav && <Nav />}
          {lang && <LangSelect currentLang={currentLang} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
