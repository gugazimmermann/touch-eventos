import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTime, isAfter, isBefore } from "date-fns";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import ROUTES from "../../../constants/routes";
import { register } from "../../../services";
import usePhoneCode from "../../../hooks/usePhoneCode";
import { maskPhone } from "../../../helpers/mask";
import { validateEmail, validatePhone } from "../../../helpers/validate";
import { Gift, Survey } from "../../../icons";
import { Alert, Loading } from "../../../components";
import { Header, FooterSmall } from "../../../components/layout";
import { FormButton, InputField } from "../../../components/form";

const Register = () => {
  const { t, i18n } = useTranslation("event_register");
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { PhoneCodeSelect } = usePhoneCode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [event, setEvent] = useState();
  const [allowRegister, setAllowRegister] = useState(true);
  const [registrationPhone, setRegistrationPhone] = useState({
    phoneCode: "",
    phone: "",
  });
  const [registrationEmail, setRegistrationEmail] = useState({
    email: "",
  });
  const [check, setCheck] = useState("");

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    if (!check) {
      setError(t("agree_error"));
      return;
    }
    const payload = {
      check,
      registrationId: uuidv4(),
      eventId,
      email: "",
      phone: "",
      language: i18n.language,
      createdAt: `${getTime(new Date())}`,
    };
    if (event.verification === "SMS") {
      const phone = registrationPhone.phone.replace(/\D+/g, "");
      if (!validatePhone(phone)) {
        setError(t("invalid_phone"));
        return;
      }
      const phoneCode = registrationPhone.phoneCode || "+55";
      payload.phone = `${phoneCode}${phone}`;
    } else {
      if (!validateEmail(registrationEmail.email)) {
        setError(t("invalid_email"));
        return;
      }
      payload.email = registrationEmail.email;
    }
    setLoading(true);
    const registerResponse = await register.register(eventId, payload);
    if (registerResponse?.registrationId) {
      navigate(
        `/${ROUTES.EVENTS.CONFIRM}/${eventId}/${registerResponse.registrationId}/${registerResponse.language}`
      );
    } else {
      setError(t("register_error"));
    }
    setLoading(false);
  };

  const handleEventDates = useCallback(
    (eventData) => {
      // TODO: change this
      // const startDate = new Date(parseInt(eventData.startDate, 10));
      const startDate = new Date();
      const endDate = new Date(parseInt(eventData.endDate, 10));
      const today = new Date();
      if (isAfter(startDate, today)) {
        setInfo(t("event_not_started"));
        setAllowRegister(false);
      }
      if (isBefore(endDate, today)) {
        setWarning(t("event_ended"));
        setAllowRegister(false);
      }
    },
    [t]
  );

  const handleTrial = useCallback(
    (eventData) => {
      if (eventData.payment !== "success") {
        if (eventData.registrations < 10) {
          setInfo(`${t("event_trial_remain")} ${10 - eventData.registrations}`);
        } else {
          setWarning(t("event_trial_over"));
          setAllowRegister(false);
        }
      }
    },
    [t]
  );

  const getData = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const eventData = await register.getEventById(id);
        if (eventData?.error || !eventData?.eventId) {
          setWarning(t("event_not_found"));
        } else {
          handleEventDates(eventData);
          if (eventData.active < 1 && eventData.payment === "success") {
            setError(t("event_inactive"));
            setAllowRegister(false);
          }
          handleTrial(eventData);
          setEvent(eventData);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    [handleEventDates, handleTrial, t]
  );

  useEffect(() => {
    if (eventId) getData(eventId);
    else navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, getData]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header nav={false} lang={true} />
      <main className="flex flex-grow flex-col items-center justify-start m-auto w-full mt-10">
        <section className="flex flex-grow w-full">
          {loading ? (
            <div className="flex flex-grow justify-center items-center">
              <Loading size="w-20 w-20" />
            </div>
          ) : (
            <div className="container mx-auto bg-background-50 p-4">
              {error && <Alert message={error} type="danger" center={true} />}
              {info && <Alert message={info} type="info" center={true} />}
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
                      {event.verification === "SMS"
                        ? t("your_phone")
                        : t("your_email")}
                    </h1>

                    <form className="w-full px-4" onSubmit={handleSubmit}>
                      {event.verification === "SMS" ? (
                        <div className="flex flex-row gap-2">
                          <div className="w-1/3">
                            <PhoneCodeSelect
                              disabled={loading || !allowRegister}
                              value="phoneCode"
                              values={registrationPhone}
                              setValues={setRegistrationPhone}
                            />
                          </div>
                          <div className="w-2/3">
                            <InputField
                              disabled={loading || !allowRegister}
                              required={
                                event.verification === "SMS" ? true : false
                              }
                              autocomplete="phone"
                              placeholder={t("phone")}
                              value="phone"
                              values={registrationPhone}
                              setValues={setRegistrationPhone}
                              mask={maskPhone}
                            />
                          </div>
                        </div>
                      ) : (
                        <InputField
                          disabled={loading || !allowRegister}
                          required={event.verification !== "SMS" ? true : false}
                          autocomplete="email"
                          type="email"
                          placeholder={t("email")}
                          value="email"
                          values={registrationEmail}
                          setValues={setRegistrationEmail}
                        />
                      )}
                      <div className="flex items-center justify-center mt-4">
                        <label
                          htmlFor="consentCheckbox"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <span className="-mt-2 text-sm">
                            {t("agree_to_receive_info")}
                          </span>
                          <div className="relative">
                            <input
                              id="consentCheckbox"
                              type="checkbox"
                              className="sr-only"
                              checked={check}
                              onChange={(e) => setCheck(e.target.checked)}
                            />
                            <div className="w-6 h-6 inline-flex items-center justify-center bg-white border-2 rounded-full mr-2">
                              {check && (
                                <svg
                                  className="fill-current w-8 h-8 text-primary-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M7.629 14.571L3.146 10.088l-1.414 1.414 6.061 6.061 10.607-10.607-1.414-1.414L7.629 14.571z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                      <div className="w-full text-center">
                        <FormButton
                          testid="register-send-button"
                          text={t("register")}
                          disabled={loading || !allowRegister}
                          type="submit"
                          size="w-3/4"
                          textSize="text-base"
                        />
                      </div>
                    </form>

                    <div className="p-8">
                      {event.visitorGift === "YES" && (
                        <div className="flex flex-col items-center justify-center">
                          <Gift className="w-8 h-8 text-success-500" />
                          <div>
                            {i18n.language === "pt-BR"
                              ? event.visitorGiftTextPTBR
                              : i18n.language === "en"
                              ? event.visitorGiftTextEN
                              : event.visitorGiftTextES}
                          </div>
                        </div>
                      )}
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

export default Register;
