import { useTranslation } from "react-i18next";

const Logo = ({ white, className }) => {
  const { t } = useTranslation("activity_register");

  return (
    <div className={`flex flex-row items-center ${className}`}>
      <img className="w-6 h-6 mr-1" src={`/images/${white ? 'icon_white' : 'icon'}.png`} alt="logo" />
      <span className="text-xl font-bold">
        {t("touch_eventos")}
      </span>
    </div>
  );
};

export default Logo;
