import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { format, isAfter, isBefore, isSameDay } from "date-fns";
import { event } from "../../services";
import { Alert, Loading } from "../../components/shared";
import { AdminTopNav, DashboardButtons } from "../../components/page";
import { EventCard, EventNewCard } from "../../components/events";

const imagePlaceholder =
  "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

const Admin = () => {
  const { t } = useTranslation("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        active: e.active,
      });
    });
    return fomatedEvents;
  }, []);

  const getEvents = useCallback(
    async (archived = false) => {
      setLoading(true);
      const res = await event.getEvents(archived);
      if (res?.error) setError(res.error);
      else setEvents(formatData(res));
      setLoading(false);
    },
    [formatData]
  );

  useEffect(() => {
    getEvents(archivedEvents);
  }, [archivedEvents, getEvents]);

  return (
    <section className="w-full">
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
        />
      </AdminTopNav>
      {error && <Alert message={error} type="danger" />}
      <div className=" grid grid-cols-5 gap-4 pb-8">
        {!archivedEvents && <EventNewCard />}
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
