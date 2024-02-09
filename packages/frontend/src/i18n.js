import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import logoEN from "./constants/translations/en/logo.json";
import homeEN from "./constants/translations/en/home.json";
import companyEN from "./constants/translations/en/company.json";
import workwithusEN from "./constants/translations/en/workwithus.json";
import faqEN from "./constants/translations/en/faq.json";
import contactusEN from "./constants/translations/en/contactus.json";
import usagetermsEN from "./constants/translations/en/usage_terms.json";
import privacitytermsEN from "./constants/translations/en/privacity_terms.json";
import authEN from "./constants/translations/en/auth.json";
import adminEN from "./constants/translations/en/admin.json";
import phoneCodeEN from "./constants/translations/en/phone-code.json";

import logoPTBR from "./constants/translations/pt-br/logo.json";
import homePTBR from "./constants/translations/pt-br/home.json";
import companyPTBR from "./constants/translations/pt-br/company.json";
import workwithusPTBR from "./constants/translations/pt-br/workwithus.json";
import faqPTBR from "./constants/translations/pt-br/faq.json";
import contactusPTBR from "./constants/translations/pt-br/contactus.json";
import usagetermsPTBR from "./constants/translations/pt-br/usage_terms.json";
import privacitytermsPTBR from "./constants/translations/pt-br/privacity_terms.json";
import authPTBR from "./constants/translations/pt-br/auth.json";
import adminPTBR from "./constants/translations/pt-br/admin.json";
import phoneCodePTBR from "./constants/translations/pt-br/phone-code.json";

const resources = {
  en: {
    logo: logoEN,
    home: homeEN,
    company: companyEN,
    workwithus: workwithusEN,
    faq: faqEN,
    contactus: contactusEN,
    usageterms: usagetermsEN,
    privacityterms: privacitytermsEN,
    auth: authEN,
    admin: adminEN,
    phoneCode: phoneCodeEN,
  },
  "pt-BR": {
    logo: logoPTBR,
    home: homePTBR,
    company: companyPTBR,
    workwithus: workwithusPTBR,
    faq: faqPTBR,
    contactus: contactusPTBR,
    usageterms: usagetermsPTBR,
    privacityterms: privacitytermsPTBR,
    auth: authPTBR,
    admin: adminPTBR,
    phoneCode: phoneCodePTBR,
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
    "logo",
    "home",
    "company",
    "workwithus",
    "faq",
    "contactus",
    "usageterms",
    "privacityterms",
    "auth",
    "admin",
    "phoneCode",
  ],
});

export default i18n;
