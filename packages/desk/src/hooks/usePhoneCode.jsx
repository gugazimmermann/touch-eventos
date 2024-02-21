import { useEffect, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import { useTranslation } from "react-i18next";
import {
  PHONECODESBR,
  PHONECODESEN,
  PHONECODESES,
} from "../constants/phone-codes";

const usePhoneCode = () => {
  const { i18n, t } = useTranslation("desk");
  const [phoneCodeList, setPhoneCodeList] = useState(PHONECODESEN);

  const countryToPhoneCode = (country, value, values, setValues) => {
    if (country) {
      setValues({
        ...values,
        [value]: phoneCodeList[country].secondary,
      });
    }
  };

  const phoneCodeToContry = (phoneCode) => {
    if (!phoneCode) return "BR";
    const entry = Object.entries(phoneCodeList).find(
      ([countryCode, details]) => details.secondary === phoneCode
    );
    const countryCode = entry ? entry[0] : null;
    return countryCode;
  };

  useEffect(() => {
    if (i18n.resolvedLanguage === "pt-BR") {
      setPhoneCodeList(PHONECODESBR);
    } else if (i18n.resolvedLanguage === "es") {
      setPhoneCodeList(PHONECODESES);
    } else {
      setPhoneCodeList(PHONECODESEN);
    }
  }, [i18n.resolvedLanguage]);

  const PhoneCodeSelect = ({ disabled, value, values, setValues }) => (
    <ReactFlagsSelect
      disabled={disabled}
      placeholder={t("country_code")}
      searchable
      searchPlaceholder={t("search")}
      showOptionLabel={false}
      showSelectedLabel={false}
      selected={phoneCodeToContry(values[value])}
      onSelect={(country) =>
        countryToPhoneCode(country, value, values, setValues)
      }
      customLabels={phoneCodeList}
      className="mt-4 p-0 text-text-700 placeholder-text-500 bg-white dark:bg-slate-200 border rounded-lg"
    />
  );

  return { PhoneCodeSelect };
};

export default usePhoneCode;
