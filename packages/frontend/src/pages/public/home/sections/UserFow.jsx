import { useTranslation } from "react-i18next";

export default function UserFlow() {
  const { t } = useTranslation("home");

  const cardOne = () => (
    <div className="w-full md:w-1/4 px-4 py-2 flex flex-col flex-grow flex-shrink">
      <div className="flex-1 bg-white rounded overflow-hidden shadow-xl">
        <p className="w-full text-gray-600 px-4 py-2">{t("flow_1_step")}</p>
        <div className="w-full font-bold text-xl px-4">{t("flow_1_title")}</div>
        <p className="text-gray-800 text-base px-6 py-4">{t("flow_1_desc")}</p>
      </div>
    </div>
  );

  const cardTwo = () => (
    <div className="w-full md:w-1/4 px-4 py-2 flex flex-col flex-grow flex-shrink">
      <div className="flex-1 bg-white rounded overflow-hidden shadow-xl">
        <p className="w-full text-gray-600 px-4 py-2">{t("flow_2_step")}</p>
        <div className="w-full font-bold text-xl px-4">{t("flow_2_title")}</div>
        <p className="text-gray-800 text-base px-6 py-4">{t("flow_2_desc")}</p>
      </div>
    </div>
  );

  const cardThree = () => (
    <div className="w-full md:w-1/4 px-4 py-2 flex flex-col flex-grow flex-shrink">
      <div className="flex-1 bg-white rounded overflow-hidden shadow-xl">
        <p className="w-full text-gray-600 px-4 py-2">{t("flow_3_step")}</p>
        <div className="w-full font-bold text-xl px-4">{t("flow_3_title")}</div>
        <p className="text-gray-800 text-base px-6 py-4">{t("flow_3_desc")}</p>
      </div>
    </div>
  );

  const cardFour = () => (
    <div className="w-full md:w-1/4 px-4 py-2 flex flex-col flex-grow flex-shrink">
      <div className="flex-1 bg-white rounded overflow-hidden shadow-xl">
        <p className="w-full text-gray-600 px-4 py-2">{t("flow_4_step")}</p>
        <div className="w-full font-bold text-xl px-4">{t("flow_4_title")}</div>
        <p className="text-gray-800 text-base px-6 py-4">{t("flow_4_desc")}</p>
      </div>
    </div>
  );

  return (
    <section className="w-full bg-background-50">
      <div className="container mx-auto flex flex-wrap py-6">
        <div className="w-full text-center">
          <h1 className="w-full my-2 text-3xl font-bold text-center">
            Como Funciona?
          </h1>
          <h2 className="w-full my-2 text-xl font-semibold text-center">
            São inúmeras formas de se utilizar o Touch Eventos, mas a mais comum
            é:
          </h2>
        </div>
        {cardOne()}
        {cardTwo()}
        {cardThree()}
        {cardFour()}
      </div>
    </section>
  );
}
