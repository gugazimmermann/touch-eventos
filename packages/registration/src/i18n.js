import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import event_registerEN from "./constants/translations/en/event_register.json";
import event_registerPTBR from "./constants/translations/pt-br/event_register.json";
import event_registerES from "./constants/translations/es/event_register.json";

const resources = {
  en: {
    event_register: event_registerEN,
  },
  "pt-BR": {
    event_register: event_registerPTBR,
  },
  es: {
    event_register: event_registerES,
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
    "event_register",
  ],
});

export default i18n;
