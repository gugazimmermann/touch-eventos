import { useTranslation } from "react-i18next";
import { useDesk } from "../../context/DeskContext";

const Logo = () => {
  const { t } = useTranslation("desk");
  const { state } = useDesk();

  return (
    <div className="flex flex-row items-center">
      <img className="w-6 h-6 mr-1" src={`/images/${state.theme === "dark" ? 'icon_white' : 'icon'}.png`} alt="logo" />
      <span className={`text-xl font-bold ${state.theme === "dark" ? 'text-white' : 'text-text-900'}`}>
        {t("touch_eventos")}
      </span>
    </div>
  );
};

export default Logo;
