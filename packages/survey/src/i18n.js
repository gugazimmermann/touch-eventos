import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import activity_surveyEN from "./constants/translations/en/activity_survey.json";
import activity_surveyPTBR from "./constants/translations/pt-br/activity_survey.json";
import activity_surveyES from "./constants/translations/es/activity_survey.json";

const resources = {
  en: {
    activity_survey: activity_surveyEN,
  },
  "pt-BR": {
    activity_survey: activity_surveyPTBR,
  },
  es: {
    activity_survey: activity_surveyES,
  },
};

i18n.use(initReactI18next).init({
  interpolation: {
    escapeValue: false,
  },
  lng: "pt-BR",
  fallbackLng: "pt-BR",
  resources,
  react: {
    useSuspense: true,
  },
  ns: [
    "activity_survey",
  ],
});

export default i18n;
