import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as register from "../services/register";
import { Survey } from "../icons";
import { Alert, Loading } from "../components";
import { Header, FooterSmall } from "../components/layout";

const ConfirmSuccess = () => {
  const { t, i18n } = useTranslation("event_register");
  const { eventSlug, registrationId, success, language } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [event, setEvent] = useState();

  const getData = useCallback(async (slug) => {
      setLoading(true);
      try {
        const eventData = await register.getEventBySlug(slug);
        if (eventData?.error || !eventData?.eventId) {
          setWarning(t("event_not_found"));
        } else {
          setEvent(eventData);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    [t]
  );

  useEffect(() => {
    if (language) i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (eventSlug && registrationId) getData(eventSlug);
    else if (eventSlug && (!success || !registrationId))
      navigate(`/${eventSlug}`);
    else navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug, registrationId, getData]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header nav={false} lang={true} currentLang={language} />
      <main className="flex flex-grow flex-col items-center justify-start m-auto w-full mt-10">
        <section className="flex flex-grow w-full">
          {loading ? (
            <div className="flex flex-grow justify-center items-center">
              <Loading size="w-20 w-20" />
            </div>
          ) : (
            <div className="container mx-auto bg-background-50 p-4">
              {error && <Alert message={error} type="danger" center={true} />}
              {warning && (
                <Alert message={warning} type="warning" center={true} />
              )}
              {event && (
                <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
                  {event.logo && (
                    <img
                      className="object-cover object-center w-full h-64"
                      src={event.logo}
                      alt="logo"
                    />
                  )}
                  <div className="flex items-center justify-center px-8 py-4 bg-success-500">
                    <h1 className="text-xl font-bold text-white">
                      {event.name}
                    </h1>
                  </div>

                  <div className="mt-4 w-full text-center">
                    <h1 className="text-xl font-semibold">
                      {t("confirmation_success")}
                    </h1>

                    <div className="p-8">
                      {event.raffle === "YES" ? (
                        <div className="flex flex-col items-center justify-center mt-4">
                          <Survey className="w-8 h-8 text-success-500" />
                          <div>
                            {i18n.language === "pt-BR"
                              ? event.raffleTextPTBR
                              : i18n.language === "en"
                              ? event.raffleTextEN
                              : event.raffleTextES}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center mt-4">
                          <Survey className="w-8 h-8 text-success-500" />
                          <div>{t("raffle_no")}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <FooterSmall green={true} />
    </div>
  );
};

export default ConfirmSuccess;
