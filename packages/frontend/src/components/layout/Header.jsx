import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEvents } from "../../context/EventsContext";
import Logo from "./Logo";
import Nav from "./Nav";
import LangSelect from "./LangSelect";
import { format } from "date-fns";

const Header = ({ nav = true, lang = false, currentLang = 'pt-BR' }) => {
  const { state } = useEvents();
  const { t } = useTranslation(["account"]);

  return (
    <header className=" p-2 bg-white fixed w-full shadow-md top-0 left-0 right-0 z-40">
      <div className="container mx-auto flex flex-wrap items-center">
        <div className="flex justify-start w-1/3">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="flex justify-center items-center w-1/3">
          {state.subscription?.endDate && (
            <h1>Plano válido até: {format(
              new Date(parseInt(state.subscription.endDate, 10)),
              "dd/MM/yy"
            )}</h1>
          )}
        </div>
        <div className="flex justify-end w-1/3">
          {nav && <Nav />}
          {lang && <LangSelect currentLang={currentLang} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
