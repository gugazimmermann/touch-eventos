import { createContext, useContext, useReducer, useEffect } from "react";

const SurveyContext = createContext(undefined);

const surveyReducer = (state, action) => {
  if (action.type === "TOKEN") {
    return { ...state, token: action.payload.token };
  } else if (action.type === "REGISTRATIONID") {
    return { ...state, registrationID: action.payload.registrationID };
  } else if (action.type === "ACTIVITY") {
    return { ...state, activity: action.payload.activity };
  } else if (action.type === "REGISTRATION") {
    return { ...state, registration: action.payload.registration };
  } else if (action.type === "PRIVACITY") {
    return { ...state, privacity: action.payload.privacity };
  } else if (action.type === "VISITOR") {
    return { ...state, visitor: action.payload.visitor };
  } else if (action.type === "DEFAULT") {
    return { ...state, default: action.payload.default };
  } else if (action.type === "SURVEY") {
    return { ...state, survey: action.payload.survey };
  }  else {
    return { ...state };
  }
};

const SurveyProvider = ({ children }) => {
  const storedToken = localStorage.getItem("token");
  const storedRegistrationID = localStorage.getItem("registrationID");
  const storedActivity = localStorage.getItem("activity");
  const storedRegistration = localStorage.getItem("registration");
  const storedPrivacity = localStorage.getItem("privacity");
  const storedVisitor = localStorage.getItem("visitor");
  const storedDefault = localStorage.getItem("default");
  const storedSurvey = localStorage.getItem("survey");

  const [state, dispatch] = useReducer(surveyReducer, {
    token: storedToken ? JSON.parse(storedToken) : null,
    registrationID: storedRegistrationID ? JSON.parse(storedRegistrationID) : null,
    activity: storedActivity ? JSON.parse(storedActivity) : null,
    registration: storedRegistration ? JSON.parse(storedRegistration) : null,
    privacity: storedPrivacity ? JSON.parse(storedPrivacity) : null,
    visitor: storedVisitor ? JSON.parse(storedVisitor) : null,
    default: storedDefault ? JSON.parse(storedDefault) : null,
    survey: storedSurvey ? JSON.parse(storedSurvey) : null,
  });

  useEffect(() => {
    localStorage.setItem("registrationID", JSON.stringify(state.registrationID));
  }, [state.registrationID]);

  useEffect(() => {
    localStorage.setItem("token", JSON.stringify(state.token));
  }, [state.token]);

  useEffect(() => {
    localStorage.setItem("activity", JSON.stringify(state.activity));
  }, [state.activity]);

  useEffect(() => {
    localStorage.setItem("registration", JSON.stringify(state.registration));
  }, [state.registration]);

  useEffect(() => {
    localStorage.setItem("privacity", JSON.stringify(state.privacity));
  }, [state.privacity]);

  useEffect(() => {
    localStorage.setItem("visitor", JSON.stringify(state.visitor));
  }, [state.visitor]);

  useEffect(() => {
    localStorage.setItem("default", JSON.stringify(state.default));
  }, [state.default]);

  useEffect(() => {
    localStorage.setItem("survey", JSON.stringify(state.survey));
  }, [state.survey]);

  return (
    <SurveyContext.Provider value={{ state, dispatch }}>
      {children}
    </SurveyContext.Provider>
  );
};

const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("useDesk must be used within an DeskProvider");
  }
  return context;
};

export { SurveyProvider, useSurvey };
