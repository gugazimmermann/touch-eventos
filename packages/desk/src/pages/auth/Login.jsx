import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAfter, isBefore } from "date-fns";
import { useDesk } from "../../context/DeskContext";
import * as desk from "../../services/desk";
import { Alert, Loading } from "../../components";
import { FormButton, InputField } from "../../components/form";
import LoginImg from "./login.svg";

const initialValues = {
  username: "",
  accessCode: "",
};

const Login = () => {
  const { t } = useTranslation("desk");
  const navigate = useNavigate();
  const { eventSlug } = useParams();
  const { state, dispatch } = useDesk();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [event, setEvent] = useState();
  const [values, setValues] = useState(initialValues);
  const [allowDesk, setAllowDesk] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await desk.access(event.eventId, values);
      if (result?.error || !result?.token) {
        setError(t("access_error"));
      } else {
        dispatch({
          type: "TOKEN",
          payload: { token: result.token },
        });
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleEventDates = useCallback((eventData) => {
      // TODO: change this
      // const startDate = new Date(parseInt(eventData.startDate, 10));
      const startDate = new Date();
      const endDate = new Date(parseInt(eventData.endDate, 10));
      const today = new Date();
      if (isAfter(startDate, today)) {
        setInfo(t("event_not_started"));
        setAllowDesk(false);
      }
      if (isBefore(endDate, today)) {
        setWarning(t("event_ended"));
        setAllowDesk(false);
      }
    },
    [t]
  );

  const getData = useCallback(async (slug) => {
      setLoading(true);
      try {
        const eventData = await desk.getEventBySlug(slug);
        if (eventData?.error || !eventData?.eventId) {
          setWarning(t("event_not_found"));
        } else {
          handleEventDates(eventData);
          if (eventData.active < 1 && eventData.payment === "success") {
            setError(t("event_inactive"));
            setAllowDesk(false);
          }
          setEvent(eventData);
          dispatch({
            type: "EVENT",
            payload: { event: eventData },
          });
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  useEffect(() => {
    getData(eventSlug);
  }, [eventSlug, getData]);

  useEffect(() => {
    if (state.token) navigate(`/${eventSlug}/main`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token]);

  return (
    <>
      <div className="w-1/2 mx-auto flex items-center justify-center">
        {!event?.logo ? (
          <img src={LoginImg} className="w-4/5" alt="Login" />
        ) : (
          <img
            src={event.logo}
            className="w-4/5 shadow-lg rounded-lg"
            alt="Logo"
          />
        )}
      </div>
      <div className="w-1/2 mx-auto">
        {error && <Alert message={error} type="danger" center={true} />}
        {info && <Alert message={info} type="info" center={true} />}
        {warning && <Alert message={warning} type="warning" center={true} />}
        {loading ? (
          <Loading size="w-20 h-20" />
        ) : (
          <form className="w-full px-4" onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <div className="my-4">
              <label className="font-semibold mb-4" htmlFor="username">
                {t("username")}
              </label>
              <InputField
                disabled={loading || !allowDesk}
                required={true}
                type="text"
                value="username"
                values={values}
                setValues={setValues}
              />
            </div>
            <div>
              <label className="font-semibold mb-4" htmlFor="accessCode">
                {t("access_code")}
              </label>
              <InputField
                disabled={loading || !allowDesk}
                required={true}
                type="password"
                value="accessCode"
                values={values}
                setValues={setValues}
              />
            </div>

            <div className="flex justify-end mt-6">
              <FormButton
                testid="register-send-button"
                text={t("enter")}
                disabled={loading || !allowDesk}
                type="submit"
                textSize="text-base"
              />
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Login;
