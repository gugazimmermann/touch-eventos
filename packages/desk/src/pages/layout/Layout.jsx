import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDesk } from "../../context/DeskContext";
import { Header } from "../../components/layout";
import NoActivity from "./no-activity.svg";

const Layout = () => {
  const { t, i18n } = useTranslation("desk");
  const { activitySlug } = useParams();
  const { state } = useDesk();
  const [displayNoActivity, setDisplayNoActivity] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(state.lang);
  }, [i18n, state]);

  useEffect(() => {
    if (!activitySlug) setDisplayNoActivity(true);
  }, [activitySlug, setDisplayNoActivity]);

  return (
    <main className="flex flex-col min-h-screen w-full px-4">
      <Header theme={state.theme} lang={state.lang} />
      {displayNoActivity ? (
        <div className="w-full flex flex-grow flex-col-reverse sm:flex-row items-center justify-evenly">
          <img
            src={NoActivity}
            className="w-full sm:w-1/2 border-t border-gray-400"
            alt="Phone"
          />
          <h1 className="pb-4 font-semibold text-4xl leading-tight text-center">
            {t("no_activity")}
          </h1>
        </div>
      ) : (
        <section className="container flex flex-col-reverse sm:flex-row flex-grow items-center justify-evenly m-auto w-full">
          <Outlet />
        </section>
      )}
    </main>
  );
};

export default Layout;
