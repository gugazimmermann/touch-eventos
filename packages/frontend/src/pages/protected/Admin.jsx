import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { format, isAfter, isBefore, isSameDay } from "date-fns";
import { useEvents } from "../../context/EventsContext";
import { account, event } from "../../services";
import { Alert, Loading } from "../../components";
import { AdminTopNav, DashboardButtons } from "../../components/layout";
import { EventCard, EventNewCard } from "./components";

const imagePlaceholder =
  "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

const Admin = () => {
  const { t } = useTranslation("admin");
  const { state, dispatch } = useEvents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [canCreate, setCanCreate] = useState(false);
  const [archivedEvents, setArchivedEvents] = useState(false);
  const [events, setEvents] = useState([]);

  const eventStatus = (start, end) => {
    const startDate = new Date(parseInt(start, 10));
    const endDate = new Date(parseInt(end, 10));
    const today = new Date();
    if (isAfter(startDate, today)) {
      return "AWAITING";
    } else if (isBefore(endDate, today)) {
      return "FINISHED";
    } else if (
      (isBefore(startDate, today) || isSameDay(startDate, today)) &&
      (isAfter(endDate, today) || isSameDay(endDate, today))
    ) {
      return "OPEN";
    }
    return "AWAITING";
  };

  const formatData = useCallback((data) => {
    const fomatedEvents = [];
    data.forEach((e) => {
      fomatedEvents.push({
        eventId: e.eventId,
        logo: e.logo || imagePlaceholder,
        name: e.name,
        dates: `${format(
          new Date(parseInt(e.startDate, 10)),
          "dd/MM/yy"
        )} | ${format(new Date(parseInt(e.endDate, 10)), "dd/MM/yy")}`,
        location: `${e.city} / ${e.state}`,
        verificationType: e.verificationType,
        visitors: e.visitors || "-",
        status: eventStatus(e.startDate, e.endDate),
        payment: e.payment,
        active: e.active,
      });
    });
    return fomatedEvents;
  }, []);

  const getEvents = useCallback(async (force) => {
    setLoading(true);
    const eventsList = !archivedEvents
      ? state.eventsList
      : state.eventsListArchived;
    if (!eventsList || force) {
      const res = await event.getEvents(archivedEvents);
      if (res?.error) setError(res.error);
      else {
        if (archivedEvents)
          dispatch({
            type: "EVENTS_LIST_ARCHIVED",
            payload: { eventsListArchived: res },
          });
        else dispatch({ type: "EVENTS_LIST", payload: { eventsList: res } });
        setEvents(formatData(res));
      }
    } else {
      setEvents(formatData(eventsList));
    }
    setLoading(false);
  }, [
    archivedEvents,
    dispatch,
    formatData,
    state.eventsList,
    state.eventsListArchived,
  ]);

  const getUserData = useCallback(async () => {
    const userData = state?.user || await account.getCurrentUser();
    if (!userData?.name || !userData?.document) {
      setWarning("Acesse 'Minha Conta' e finalize seu cadastro.");
    } else {
      setCanCreate(true);
      dispatch({
        type: "USER",
        payload: { user: userData },
      });
    }
  }, [dispatch, state?.user]);

  const getUserSubscription = useCallback(async () => {
    const userSubscription = state?.subscription || await account.getCurrentUserSubscription();
    if (userSubscription?.subscription?.endDate) {
      dispatch({
        type: "SUBSCRIPTION",
        payload: { subscription: userSubscription.subscription },
      });
    }
  }, [dispatch, state?.subscription]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await getUserData();
    await getUserSubscription();
    await getEvents();
    setLoading(false);
  }, [getEvents, getUserSubscription, getUserData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <section className="w-full px-4">
      <AdminTopNav
        title={`${t("dashboard")} - ${
          !archivedEvents
            ? t("dashboard_events_active")
            : t("dashboard_events_archived")
        }`}
      >
        <DashboardButtons
          archived={archivedEvents}
          setArchived={setArchivedEvents}
          reload={getEvents}
        />
      </AdminTopNav>
      {error && <Alert message={error} type="danger" />}
      {warning && <Alert message={warning} type="warning" />}
      <div className=" grid grid-cols-5 gap-4 pb-8">
        {!archivedEvents && <EventNewCard canCreate={canCreate} />}
        {loading ? (
          <Loading />
        ) : (
          events.map((e) => <EventCard key={e.eventId} data={e} />)
        )}
      </div>
    </section>
  );
};

export default Admin;
