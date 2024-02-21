import { useCallback, useEffect, useState } from "react";
import { useDesk } from "../../context/DeskContext";
import { Sun, Moon } from "../../icons";

const ThemeSelect = ({ currentTheme }) => {
  const { dispatch } = useDesk();
  const [selected, setSelected] = useState("light");

  const handleTheme = useCallback(
    (theme) => {
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      setSelected(theme);
      dispatch({ type: "THEME", payload: { theme } });
    },
    [dispatch]
  );

  useEffect(() => {
    handleTheme(currentTheme);
  }, [currentTheme, handleTheme]);

  if (selected === "light")
    return (
      <button type="button" onClick={() => handleTheme("dark")}>
        <Moon />
      </button>
    );
  else
    return (
      <button type="button" onClick={() => handleTheme("light")}>
        <Sun />
      </button>
    );
};

export default ThemeSelect;
