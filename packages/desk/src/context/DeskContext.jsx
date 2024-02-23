import { createContext, useContext, useReducer, useEffect } from "react";

const DeskContext = createContext(undefined);

const deskReducer = (state, action) => {
  if (action.type === "THEME") {
    return { ...state, theme: action.payload.theme };
  } else if (action.type === "LANG") {
    return { ...state, lang: action.payload.lang };
  } else if (action.type === "TOKEN") {
    return { ...state, token: action.payload.token };
  } else if (action.type === "ACTIVITY") {
    return { ...state, activity: action.payload.activity };
  } else {
    return { ...state };
  }
};

const DeskProvider = ({ children }) => {
  const storedTheme = localStorage.getItem("theme");
  const storedLang = localStorage.getItem("lang");
  const storedToken = localStorage.getItem("token");
  const storedActivity = localStorage.getItem("activity");

  const [state, dispatch] = useReducer(deskReducer, {
    theme: storedTheme ? JSON.parse(storedTheme) : null,
    lang: storedLang ? JSON.parse(storedLang) : null,
    token: storedToken ? JSON.parse(storedToken) : null,
    activity: storedActivity ? JSON.parse(storedActivity) : null,
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(state.theme));
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem("lang", JSON.stringify(state.lang));
  }, [state.lang]);

  useEffect(() => {
    localStorage.setItem("token", JSON.stringify(state.token));
  }, [state.token]);

  useEffect(() => {
    localStorage.setItem("activity", JSON.stringify(state.activity));
  }, [state.activity]);

  return (
    <DeskContext.Provider value={{ state, dispatch }}>
      {children}
    </DeskContext.Provider>
  );
};

const useDesk = () => {
  const context = useContext(DeskContext);
  if (!context) {
    throw new Error("useDesk must be used within an DeskProvider");
  }
  return context;
};

export { DeskProvider, useDesk };
