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
    <main className="flex flex-col min-h-screen w-full">
      <Header theme={state.theme} lang={state.lang} />
      <section className="px-4 container flex flex-row flex-grow items-center justify-start m-auto w-full mt-10">
        {displayNoActivity ? (
          <div className="w-full flex flex-col items-center justify-center">
            <h1 className="pb-4 font-semibold text-4xl leading-tight">
              {t("no_activity")}
            </h1>
            <img
              src={NoActivity}
              className="w-1/2 border-t border-gray-400"
              alt="Phone"
            />
          </div>
        ) : (
          <Outlet />
        )}
      </section>
    </main>
  );
};

export default Layout;
