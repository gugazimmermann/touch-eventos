import { useCallback, useEffect, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import { useTranslation } from "react-i18next";
import { useDesk } from "../../context/DeskContext";

const LangSelect = ({ currentLang }) => {
  const { i18n } = useTranslation("desk");
  const { dispatch } = useDesk();
  const [selected, setSelected] = useState("BR");

  const handleLang = useCallback(
    (code) => {
      const lang = code === "US" ? "en" : code === "ES" ? "es" : "pt-BR";
      i18n.changeLanguage(lang);
      setSelected(code);
      dispatch({
        type: "LANG",
        payload: { lang },
      });
    },
    [dispatch, i18n]
  );

  useEffect(() => {
    if (currentLang === "en") handleLang("US");
    else if (currentLang === "es") handleLang("ES");
    else handleLang("BR");
  }, [currentLang, handleLang]);

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
