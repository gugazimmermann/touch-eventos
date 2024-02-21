import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEvents } from "../../context/EventsContext";
import { event } from "../../services";
import { Alert, Loading, Toast } from "../../components";
import { AdminTopNav } from "../../components/layout";
import { EventDetailsCard } from "./components";
import EventDetailsCardLogo from "./components/EventDetailsCardLogo";
import EventDetailsQRCode from "./components/EventDetailsQRCode";
import EventDetailsCardRegister from "./components/EventDetailsCardRegister";
import EventDetailsCardSurvey from "./components/EventDetailsCardSurvey";
import EventDetailsCardNewSurvey from "./components/EventDetailsCardNewSurvey";
import EventDetailsCardDesk from "./components/EventDetailsCardDesk";

const EventDetails = () => {
  const { t } = useTranslation("admin");
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useEvents();
  const [values, setValues] = useState({
    eventId: "",
    userId: "",
    active: "",
    payment: "",
    plan: "",
    verification: "",
    visitorGift: "",
    visitorGiftText: "",
    raffle: "",
    raffleType: "",
    raffleText: "",
    logo: "",
    name: "",
    slug: "",
    dates: "",
    startDate: "",
    endDate: "",
    addressZipCode: "",
    addressState: "",
    addressCity: "",
    addressStreet: "",
    addressNumber: "",
    addressNeighborhood: "",
    addressComplement: "",
    addressLatitude: "",
    addressLongitude: "",
    registers: 0,
    registersConfirmed: 0,
    surveys: [],
    surveysStarted: 0,
    surveysCompleted: 0,
    desk: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [progress, setProgress] = useState(0);
  const [isToastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleEventData = useCallback((data) => {
    setValues({
      ...values,
      eventId: data.eventId,
      userId: data.userId,
      active: data.active,
      payment: data.payment,
      plan: data.plan,
      verification: data.verification,
      visitorGift: data.visitorGift,
      visitorGiftTextPTBR: data.visitorGiftTextPTBR,
      visitorGiftTextEN: data.visitorGiftTextEN,
      visitorGiftTextES: data.visitorGiftTextES,
      raffle: data.raffle,
      raffleType: data.raffleType,
      raffleTextPTBR: data.raffleTextPTBR,
      raffleTextEN: data.raffleTextEN,
      raffleTextES: data.raffleTextES,
      logo: data.logo,
      name: data.name,
      slug: data.slug,
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
      notificationOnConfirm: data.notificationOnConfirm,
      notificationOnEventEnd: data.notificationOnEventEnd,
      registers: data.registers,
      registersConfirmed: data.registersConfirmed,
      surveys: data.surveys,
      surveysStarted: 0,
      surveysCompleted: 0,
      desk: data.desk,
    });
    if (data?.payment !== "success")
      setWarning({
        title: "Pagamento em Aberto",
        message: "Utilizando Período de Teste, máximo dez cadastros.",
      });
    if (!data.active && data?.payment === "success")
      setWarning({
        title: "Evento Inativo",
        message: "O evento está inativo, entre em contato conosco.",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogoChange = async (newLogo) => {
    if (newLogo) {
      const onUploadProgress = (progress) => setProgress(progress);
      await event.saveEventImage(eventId, { logo: newLogo }, onUploadProgress);
      setProgress(0);
      dispatch({ type: "EVENTS_LIST", payload: { eventsList: null } });
    }
  };

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
    <section className="w-full px-4 mb-8">
      {error && <Alert message={error} type="danger" />}
      {warning && (
        <Alert
          title={warning?.title}
          message={warning?.message}
          type="warning"
        />
      )}
      <AdminTopNav title={`${t("edit_event_title")} - ${values.name}`} />
      {loading && <Loading />}
      {values?.plan && (
        <div className="w-full flex flex-col justify-between gap-4">
          <div className="flex flex-row justify-between items-center gap-4">
            <EventDetailsCardLogo
              name={values.name}
              logo={values.logo}
              onLogoChange={handleLogoChange}
              setToastVisible={setToastVisible}
              setToastMessage={setToastMessage}
            />
            <div className="w-1/3 flex flex-col gap-4">
              <EventDetailsCardRegister
                eventId={eventId}
                registers={values.registers}
                registersConfirmed={values.registersConfirmed}
              />
              {values.surveysStarted > 0 ? (
                <EventDetailsCardSurvey
                  eventId={eventId}
                  surveysStarted={values.surveysStarted}
                  surveysCompleted={values.surveysCompleted}
                />
              ) : (
                <EventDetailsCardNewSurvey
                  eventId={eventId}
                  surveys={values.surveys}
                />
              )}
            </div>
            <EventDetailsQRCode eventId={values.eventId} />
          </div>
          <EventDetailsCard data={values} />
          {values.visitorGift === "YES" && (
            <EventDetailsCardDesk
              eventId={eventId}
              slug={values.slug}
              desk={values.desk}
            />
          )}
        </div>
      )}
      {progress > 0 && (
        <div className="fixed top-0 left-0 w-full h-full bg-slate-800 bg-opacity-70 flex items-center justify-center z-20">
          <div className="w-full h-6 bg-slate-100 max-w-md rounded-md">
            <div
              className="h-6 bg-primary-600 rounded-md"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {isToastVisible && (
        <Toast
          color="red"
          message={toastMessage}
          isVisible={isToastVisible}
          onClose={() => setToastVisible(false)}
        />
      )}
    </section>
  );
};

export default EventDetails;
