import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../constants/routes";
import Logo from "./Logo";
import Social from "./Social";

const LogoLink = ({ t, white }) => {
  return (
    <>
      <Link to="/">
        <Logo white={white} />
      </Link>
      <p className="max-w-sm mt-2 text-sm text-center">
        {t("footer_slogan")}
      </p>
    </>
  );
};

const CompanyRow = ({ t, white }) => {
  return (
    <div className="hidden sm:flex w-2/5">
      <div className="px-6">
        <LogoLink t={t} white={white} />
        <Social className="mt-4" />
      </div>
    </div>
  );
};

const CompanyRowSmall = ({ t, white }) => {
  return (
    <div className="sm:hidden pb-4 flex flex-col items-center">
      <LogoLink t={t} white={white} />
    </div>
  );
};

const Column = ({ title, items = [] }) => {
  return (
    <div>
      <h3 className="font-bold sm:uppercase">{title}</h3>
      {items.map((item, index) => (
        <Link
          key={index}
          to={item.link}
          className="block mt-2 text-sm hover:underline"
          target={`${item?.newTab ? "_blank" : "_self"}`}
          rel="noopener noreferrer"
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

const Footer = ({ green }) => {
  const { t } = useTranslation("layout");

  return (
    <footer
      className={`${green ? "bg-success-500 text-white" : "bg-white pt-4"} w-full`}
    >
      <div className="container px-2 mb-4 mx-auto">
        <CompanyRowSmall t={t} white={!!green} />
        <div className="flex">
          <CompanyRow t={t} white={!!green} />
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-4">
              <Column
                title={t("footer_about_us")}
                items={[
                  {
                    name: t("footer_company"),
                    link: `/${ROUTES.WEBSITE.COMPANY}`,
                  },
                  {
                    name: t("footer_work_with_us"),
                    link: `/${ROUTES.WEBSITE.WORK_WITH_US}`,
                  },
                ]}
              />
              <Column
                title={t("footer_help")}
                items={[
                  {
                    name: t("footer_faq"),
                    link: `/${ROUTES.WEBSITE.FAQ}`,
                  },
                  {
                    name: t("footer_contact"),
                    link: `/${ROUTES.WEBSITE.CONTACT}`,
                  },
                ]}
              />
              <Column
                title={t("footer_info")}
                items={[
                  {
                    name: t("footer_usage_terms"),
                    link: `/${ROUTES.WEBSITE.USAGE_TERMS}`,
                  },
                  {
                    name: t("footer_privacity_terms"),
                    link: `/${ROUTES.WEBSITE.PRIVACITY_TERMS}`,
                  },
                ]}
              />
              <Column
                title={t("footer_contact_us")}
                items={[
                  {
                    name: t("footer_email"),
                    link: `/${ROUTES.WEBSITE.CONTACT}`,
                  },
                  {
                    name: t("footer_whatsapp"),
                    link: "https://wa.me/5547997014984",
                    newTab: true,
                  },
                ]}
              />
            </div>
          </div>
        </div>
        <Social className="mt-4 sm:hidden" />
      </div>
    </footer>
  );
};

export default Footer;
