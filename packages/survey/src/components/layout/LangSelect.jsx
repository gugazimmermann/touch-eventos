import { useEffect, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import { useTranslation } from "react-i18next";

const LangSelect = ({ currentLang }) => {
  const { i18n } = useTranslation("activity_survey");
  const [selected, setSelected] = useState("BR");

  const handleLang = (code) => {
    let lang = "pt-BR";
    if (code === "US") lang = "en";
    else if (code === "ES") lang = "es";
    i18n.changeLanguage(lang);
    setSelected(code);
  };

  useEffect(() => {
    if (currentLang === "en") setSelected("US");
    else if (currentLang === "es") setSelected("ES");
    else setSelected("BR");
  }, [currentLang]);

  return (
    <ReactFlagsSelect
      selected={selected}
      onSelect={(code) => handleLang(code)}
      countries={["BR", "US", "ES"]}
      placeholder=" "
      searchable={false}
      searchPlaceholder=" "
      showSelectedLabel={false}
      showSecondarySelectedLabel={false}
      showOptionLabel={false}
      showSecondaryOptionLabel={false}
      selectedSize={22}
      optionsSize={32}
      className="flagsSelect"
      selectButtonClassName="m-0 p-0"
    />
  );
};

export default LangSelect;
