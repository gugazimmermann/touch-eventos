import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import activity_registerEN from "./constants/translations/en/activity_register.json";
import activity_registerPTBR from "./constants/translations/pt-br/activity_register.json";
import activity_registerES from "./constants/translations/es/activity_register.json";

const resources = {
  en: {
    activity_register: activity_registerEN,
  },
  "pt-BR": {
    activity_register: activity_registerPTBR,
  },
  es: {
    activity_register: activity_registerES,
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
    "activity_register",
  ],
});

export default i18n;
