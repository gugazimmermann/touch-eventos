import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import componentsPTBR from "./constants/translations/pt-br/components.json";
import layoutPTBR from "./constants/translations/pt-br/layout.json";
import componentsEN from "./constants/translations/en/components.json";

// WebSite
// BR
import authPTBR from "./constants/translations/pt-br/website/auth.json";
import companyPTBR from "./constants/translations/pt-br/website/company.json";
import contactusPTBR from "./constants/translations/pt-br/website/contactus.json";
import faqPTBR from "./constants/translations/pt-br/website/faq.json";
import homePTBR from "./constants/translations/pt-br/website/home.json";
import privacitytermsPTBR from "./constants/translations/pt-br/website/privacity_terms.json";
import usagetermsPTBR from "./constants/translations/pt-br/website/usage_terms.json";
import workwithusPTBR from "./constants/translations/pt-br/website/workwithus.json";
// EN
import authEN from "./constants/translations/en/auth.json";
import companyEN from "./constants/translations/en/company.json";
import contactusEN from "./constants/translations/en/contactus.json";
import faqEN from "./constants/translations/en/faq.json";
import homeEN from "./constants/translations/en/home.json";
import privacitytermsEN from "./constants/translations/en/privacity_terms.json";
import usagetermsEN from "./constants/translations/en/usage_terms.json";
import workwithusEN from "./constants/translations/en/workwithus.json";

// Admin
// BR
import accountPTBR from "./constants/translations/pt-br/account.json";
import activityDetailsPTBR from "./constants/translations/pt-br/activity_details.json";
import adminPTBR from "./constants/translations/pt-br/admin.json";
import newActivityPTBR from "./constants/translations/pt-br/new_activity.json";
// EN
import accountEN from "./constants/translations/en/account.json";
import adminEN from "./constants/translations/en/admin.json";

const resources = {
  en: {
    components: componentsEN,
    auth: authEN,
    company: companyEN,
    contactus: contactusEN,
    faq: faqEN,
    home: homeEN,
    privacityterms: privacitytermsEN,
    usageterms: usagetermsEN,
    workwithus: workwithusEN,
    account: accountEN,
    admin: adminEN,

  },
  "pt-BR": {
    components: componentsPTBR,
    layout: layoutPTBR,
    auth: authPTBR,
    company: companyPTBR,
    contactus: contactusPTBR,
    faq: faqPTBR,
    home: homePTBR,
    privacityterms: privacitytermsPTBR,
    usageterms: usagetermsPTBR,
    workwithus: workwithusPTBR,
    account: accountPTBR,
    activity_details: activityDetailsPTBR,
    admin: adminPTBR,
    new_activity: newActivityPTBR,
  },
  es: {},
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
    "components",
    "layout",
    "home",
    "company",
    "workwithus",
    "faq",
    "contactus",
    "usageterms",
    "privacityterms",
    "auth",
    "account",
    "admin",
    "new_activity",
    "activity_details",
  ],
});

export default i18n;
