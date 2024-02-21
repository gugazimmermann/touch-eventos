import { useDesk } from "../../context/DeskContext";
import Logo from "./Logo";
import ThemeSelect from "./ThemeSelect";
import LangSelect from "./LangSelect";
import { Logout } from "../../icons";

const Header = ({ theme, lang }) => {
  const { state, dispatch } = useDesk();

  const handleLogout = () => {
    dispatch({
      type: "TOKEN",
      payload: { token: null },
    });
  };

  return (
    <header className="p-2 px-2 bg-white dark:bg-slate-800 fixed w-full shadow-md top-0 left-0 right-0 z-40">
      <div className="container mx-auto flex flex-wrap items-center">
        <div className="flex justify-start w-1/2">
          <Logo />
        </div>
        <div className="flex justify-end items-center w-1/2 gap-4">
          <ThemeSelect currentTheme={theme} />
          <LangSelect currentLang={lang} />
          {state.token && (
            <button type="button" onClick={() => handleLogout()}>
              <Logout />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
