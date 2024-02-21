import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import deskEN from "./constants/translations/en/desk.json";
import deskPTBR from "./constants/translations/pt-br/desk.json";
import deskES from "./constants/translations/es/desk.json";

const resources = {
  en: {
    desk: deskEN,
  },
  "pt-BR": {
    desk: deskPTBR,
  },
  es: {
    desk: deskES,
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
    "desk",
  ],
});

export default i18n;
