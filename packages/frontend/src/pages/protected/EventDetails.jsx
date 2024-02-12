import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { event } from "../../services";
import { Alert, Loading } from "../../components";
import { AdminTopNav } from "../../components/layout";
import { EventDetailsCard } from "../../components/events";

const EventDetails = () => {
  const { t } = useTranslation("admin");
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    plan: "",
    verification: "",
    visitorGift: "",
    raffle: "",
    raffleType: "",
    name: "",
    dates: "",
    addressZipCode: "",
    addressState: "",
    addressCity: "",
    addressStreet: "",
    addressNumber: "",
    addressNeighborhood: "",
    addressComplement: "",
    addressLatitude: "",
    addressLongitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");

  const handleEventData = useCallback((data) => {
    setValues({
      ...values,
      eventId: data.eventId,
      userId: data.userId,
      plan: data.plan,
      verification: data.verification,
      visitorGift: data.visitorGift,
      raffle: data.raffle,
      raffleType: data.raffleType,
      name: data.name,
      dates: JSON.parse(data.dates),
      startDate: data.startDate,
      endDate: data.endDate,
      addressZipCode: data.addressZipCode,
      addressState: data.addressState,
      addressCity: data.addressCity,
      addressStreet: data.addressStreet,
      addressNumber: data.addressNumber,
      addressNeighborhood: data.addressNeighborhood,
      addressComplement: data.addressComplement,
      addressLatitude: data.addressLatitude,
      addressLongitude: data.addressLongitude,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const eventData = await event.getEventById(id);
        if (eventData?.error) setError(eventData?.error);
        else handleEventData(eventData);
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    [handleEventData]
  );

  useEffect(() => {
    if (eventId) getData(eventId);
    else navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, getData]);

  return (
    <section className="w-full">
      <AdminTopNav title={t("edit_event_title")} />
      {loading && <Loading />}
      {error && <Alert message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}
      {info && <Alert message={info} type="info" />}
      {values?.plan && (
        <div className="grid grid-cols-2 gap-4">
          <EventDetailsCard
            data={values}
            setLoading={setLoading}
            setError={setError}
            setSuccess={setSuccess}
            setInfo={setInfo}
          />
        </div>
      )}
    </section>
  );
};

export default EventDetails;
