import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../constants/routes";
import { Logo, Social } from ".";

const AdminFooter = () => {
  const { t } = useTranslation("layout");

  return (
    <footer className="bg-white">
      <div className="container flex flex-row items-center justify-between py-4 mx-auto">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-0">
          <Link to={`/${ROUTES.WEBSITE.FAQ}`}>{t("footer_faq")}</Link>
          <Link to={`/${ROUTES.WEBSITE.USAGE_TERMS}`}>{t("footer_usage_terms")}</Link>
          <Link to={`/${ROUTES.WEBSITE.PRIVACITY_TERMS}`}>
            {t("footer_privacity_terms")}
          </Link>
          <Link to={`/${ROUTES.WEBSITE.CONTACT}`}>{t("footer_contact_us")}</Link>
        </div>
        <Social />
      </div>
    </footer>
  );
};

export default AdminFooter;
