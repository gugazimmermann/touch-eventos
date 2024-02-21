import { createContext, useContext, useReducer, useEffect } from "react";

const EventsContext = createContext(undefined);

const eventsReducer = (state, action) => {
  if (action.type === "USER") {
    return { ...state, user: action.payload.user };
  } else if (action.type === "SUBSCRIPTION") {
    return { ...state, subscription: action.payload.subscription };
  } else if (action.type === "PLANS") {
    return { ...state, plans: action.payload.plans };
  } else if (action.type === "VERIFICATIONS") {
    return { ...state, verifications: action.payload.verifications };
  } else if (action.type === "EVENTS_LIST") {
    return { ...state, eventsList: action.payload.eventsList };
  } else if (action.type === "EVENTS_LIST_ARCHIVED") {
    return { ...state, eventsListArchived: action.payload.eventsListArchived };
  } else if (action.type === "EVENT_REGISTER") {
    return { ...state, eventRegister: action.payload.eventRegister };
  } else if (action.type === "EVENT_SURVEY") {
    return { ...state, survey: action.payload.survey };
  } else {
    return { ...state };
  }
};

const EventsProvider = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const storedSubscription = localStorage.getItem("subscription");
  const storedPlans = localStorage.getItem("plans");
  const storedVerifications = localStorage.getItem("verifications");
  const storedEventsList = localStorage.getItem("eventsList");
  const eventsListArchived = localStorage.getItem("eventsListArchived");
  const storedEventRegister = localStorage.getItem("eventRegister");
  const storedSurvey = localStorage.getItem("survey");

  const [state, dispatch] = useReducer(eventsReducer, {
    user: storedUser ? JSON.parse(storedUser) : null,
    subscription: storedSubscription ? JSON.parse(storedSubscription) : null,
    plans: storedPlans ? JSON.parse(storedPlans) : null,
    verifications: storedVerifications ? JSON.parse(storedVerifications) : null,
    eventsList: storedEventsList ? JSON.parse(storedEventsList) : null,
    eventsListArchived: eventsListArchived
      ? JSON.parse(eventsListArchived)
      : null,
    eventRegister: storedEventRegister ? JSON.parse(storedEventRegister) : null,
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
    localStorage.setItem("eventsList", JSON.stringify(state.eventsList));
  }, [state.eventsList]);

  useEffect(() => {
    localStorage.setItem(
      "eventsListArchived",
      JSON.stringify(state.eventsListArchived)
    );
  }, [state.eventsListArchived]);

  useEffect(() => {
    localStorage.setItem("eventRegister", JSON.stringify(state.eventRegister));
  }, [state.eventRegister]);

  useEffect(() => {
    localStorage.setItem("survey", JSON.stringify(state.survey));
  }, [state.survey]);

  return (
    <EventsContext.Provider value={{ state, dispatch }}>
      {children}
    </EventsContext.Provider>
  );
};

const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};

export { EventsProvider, useEvents };
