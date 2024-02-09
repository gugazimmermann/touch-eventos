import { useTranslation } from "react-i18next";

export default function UserFlow() {
  const { t } = useTranslation("home");

  const cardOne = () => (
    <div className="w-full md:w-1/3 px-6 py-2 flex flex-col flex-grow flex-shrink">
      <div className="flex-1 bg-white rounded overflow-hidden shadow-xl">
        <a href="/" className="flex flex-wrap no-underline hover:no-underline">
          <p className="w-full text-gray-600 text-xs md:text-sm px-6 py-3">
            {t("flow_1_step")}
          </p>
          <div className="w-full font-bold text-xl text-gray-800 px-6">
            {t("flow_1_title")}
          </div>
          <p className="text-gray-800 text-base px-6 mb-5">
            {t("flow_1_desc")}
          </p>
        </a>
      </div>
    </div>
  );

  const cardTwo = () => (
    <div className="w-full md:w-1/3 px-6 py-2 flex flex-col flex-grow flex-shrink">
      <div className="flex-1 bg-white rounded overflow-hidden shadow-xl">
        <a href="/" className="flex flex-wrap no-underline hover:no-underline">
          <p className="w-full text-gray-600 text-xs md:text-sm px-6 py-3">
            {t("flow_2_step")}
          </p>
          <div className="w-full font-bold text-xl text-gray-800 px-6">
            {t("flow_2_title")}
          </div>
          <p className="text-gray-800 text-base px-6 mb-5">
            {t("flow_2_desc")}
          </p>
        </a>
      </div>
    </div>
  );

  const cardThree = () => (
    <div className="w-full md:w-1/3 px-6 py-2 flex flex-col flex-grow flex-shrink">
      <div className="flex-1 bg-white rounded overflow-hidden shadow-xl">
        <a href="/" className="flex flex-wrap no-underline hover:no-underline">
          <p className="w-full text-gray-600 text-xs md:text-sm px-6 py-3">
            {t("flow_3_step")}
          </p>
          <div className="w-full font-bold text-xl text-gray-800 px-6">
            {t("flow_3_title")}
          </div>
          <p className="text-gray-800 text-base px-6 mb-5">
            {t("flow_3_desc")}
          </p>
        </a>
      </div>
    </div>
  );
  return (

    <section className="w-full bg-background-50">
      <div className="container mx-auto flex flex-wrap py-6">
      <h1 className="w-full my-2 text-3xl sm:text-4xl font-bold leading-tight text-center">
        Como Funciona?
      </h1>
      {cardOne()}
      {cardTwo()}
      {cardThree()}
      </div>
    </section>
  );
}
