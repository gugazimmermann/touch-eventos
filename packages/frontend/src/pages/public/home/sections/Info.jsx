import { useTranslation } from "react-i18next";
import RealTime from "./images/real_time.svg";
import Survey from "./images/survey2.svg";

export default function Info() {
  const { t } = useTranslation("home");

  return (
    <section className="w-full bg-background-50">
      <div className="py-2 max-w-5xl mx-auto">
        <div className="flex flex-wrap flex-col sm:flex-row">
          <div className="w-full p-6 text-center sm:w-1/2 sm:text-left">
            <h3 className="text-2xl font-bold leading-none mb-3">
              {t("info_1_title")}
            </h3>
            <p>
              {t("info_1_desc")}
              <br />
              <br />
              {t("info_1_call")}
            </p>
          </div>
          <div className="w-full sm:w-1/2">
            <img alt="RealTime" className="w-4/5 mx-auto" src={RealTime} />
          </div>
        </div>
        <div className="flex flex-wrap flex-col-reverse sm:flex-row">
          <div className="w-full flex justify-center sm:w-1/2">
            <img alt="Survey" className="w-full md:w-4/5" src={Survey} />
          </div>
          <div className="w-full sm:w-1/2 p-6 mt-6  text-center sm:text-left">
            <h3 className="text-2xl font-bold leading-none mb-3">
              {t("info_2_title")}
            </h3>
            <p>
              {t("info_2_desc")}
              <br />
              <br />
              {t("info_2_call")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
