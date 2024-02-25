import { createContext, useContext, useReducer, useEffect } from "react";

const ActivitiesContext = createContext(undefined);

const activitiesReducer = (state, action) => {
  if (action.type === "USER") {
    return { ...state, user: action.payload.user };
  } else if (action.type === "SUBSCRIPTION") {
    return { ...state, subscription: action.payload.subscription };
  } else if (action.type === "PLANS") {
    return { ...state, plans: action.payload.plans };
  } else if (action.type === "VERIFICATIONS") {
    return { ...state, verifications: action.payload.verifications };
  } else if (action.type === "ACTIVITIES_LIST") {
    return { ...state, activitiesList: action.payload.activitiesList };
  } else if (action.type === "ACTIVITIES_LIST_ARCHIVED") {
    return {
      ...state,
      activitiesListArchived: action.payload.activitiesListArchived,
    };
  } else if (action.type === "ACTIVITY_REGISTER") {
    return { ...state, activityRegister: action.payload.activityRegister };
  } else if (action.type === "ACTIVITIES_SURVEY") {
    return { ...state, survey: action.payload.survey };
  } else {
    return { ...state };
  }
};

const ActivitiesProvider = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const storedSubscription = localStorage.getItem("subscription");
  const storedPlans = localStorage.getItem("plans");
  const storedVerifications = localStorage.getItem("verifications");
  const storedActivitiesList = localStorage.getItem("activitiesList");
  const storedActivitiesListArchived = localStorage.getItem(
    "activitiesListArchived"
  );
  const storedActivityRegister = localStorage.getItem("activityRegister");
  const storedSurvey = localStorage.getItem("survey");

  const [state, dispatch] = useReducer(activitiesReducer, {
    user: storedUser ? JSON.parse(storedUser) : null,
    subscription: storedSubscription ? JSON.parse(storedSubscription) : null,
    plans: storedPlans ? JSON.parse(storedPlans) : null,
    verifications: storedVerifications ? JSON.parse(storedVerifications) : null,
    activitiesList: storedActivitiesList
      ? JSON.parse(storedActivitiesList)
      : null,
    activitiesListArchived: storedActivitiesListArchived
      ? JSON.parse(storedActivitiesListArchived)
      : null,
    activityRegister: storedActivityRegister
      ? JSON.parse(storedActivityRegister)
      : null,
    survey: storedSurvey ? JSON.parse(storedSurvey) : null,
  });

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem("subscription", JSON.stringify(state.subscription));
  }, [state.subscription]);

  useEffect(() => {
    localStorage.setItem("plans", JSON.stringify(state.plans));
  }, [state.plans]);

  useEffect(() => {
    localStorage.setItem("verifications", JSON.stringify(state.verifications));
  }, [state.verifications]);

  useEffect(() => {
    localStorage.setItem("activitiesList", JSON.stringify(state.activitiesList));
  }, [state.activitiesList]);

  useEffect(() => {
    localStorage.setItem(
      "activitiesListArchived",
      JSON.stringify(state.activitiesListArchived)
    );
  }, [state.activitiesListArchived]);

  useEffect(() => {
    localStorage.setItem("activityRegister", JSON.stringify(state.activityRegister));
  }, [state.activityRegister]);

  useEffect(() => {
    localStorage.setItem("survey", JSON.stringify(state.survey));
  }, [state.survey]);

  return (
    <ActivitiesContext.Provider value={{ state, dispatch }}>
      {children}
    </ActivitiesContext.Provider>
  );
};

const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error("useActivities must be used within an ActivitiesProvider");
  }
  return context;
};

export { ActivitiesProvider, useActivities };
