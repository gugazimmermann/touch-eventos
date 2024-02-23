import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTime } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useActivities } from "../../../context/ActivitiesContext";
import { plans, verifications, auth, activity } from "../../../services";
import { newEventValidate } from "../../../helpers/form-validation";
import { Alert, Loading } from "../../../components";
import { FormButton, InputField, SelectField } from "../../../components/form";
import { AdminTopNav } from "../../../components/layout";

const initialValues = {
  activity: "",
  surveyId: "",
};

const ActivityDetailsNewSurvey = () => {
  const { t } = useTranslation("admin");
  const { activityId, language } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useActivities();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [values, setValues] = useState(initialValues);

  const handleResetForm = () => {
    dispatch({
      type: "NEW_SURVEY_CLEAR",
      payload: { },
    });
    setValues(initialValues);
  };

  const handleSubmit = async (paymentIntent) => {
    setError("");
    setSuccess("");
    setInfo("");
    const validateValues = { ...values, dates: activityDates };
    if (!newEventValidate.stepOne(validateValues, verifyDates, setError, t)) {
      return;
    }
    if (!newEventValidate.stepTwo(validateValues, verifyDates, setError, t)) {
      return;
    }
    try {
      const currentPlan = activePlans.find((p) => p.planId === values.planId);
      const eventId = uuidv4();
      const paymentId = uuidv4();
      const { userId } = await auth.handleGetCurrentUser();
      let paymentData = null;
      if (paymentIntent) {
        paymentData = {
          paymentId,
          userId,
          date: String(paymentIntent.created),
          plan: `${currentPlan.type} / ${currentPlan.duration}`,
          value: String(paymentIntent.amount / 100),
          status: "success",
          paymentIntentId: paymentIntent.id,
        };
      }
      const data = {
        ...values,
        eventId,
        userId,
        startDate: `${dateToTimestap(eventDates[0])}`,
        endDate: `${dateToTimestap(eventDates[eventDates.length - 1])}`,
        city: values.addressCity,
        state: values.addressState,
        location: `${values.addressCity}+${values.addressState}`,
        createdAt: `${getTime(new Date())}`,
        active: paymentIntent?.status === "succeeded" ? 1 : 0,
        dates: datesToString(eventDates),
        payment: paymentData,
      };
      setLoading(true);
      const res = await event.saveEvent(data);
      if (res?.error) setError(res.error);
      else {
        dispatch({ type: "EVENTS_LIST", payload: { eventsList: null } });
        handleResetForm();
        navigate(`/evento/${eventId}`);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const getData = useCallback(async () => {
    setLoading(true);
      // if (state.eventRegister) setValues(state.survey);
      try {
        const [plansData, verificationsData] = await Promise.all([
          await plans.getPlans(),
          await verifications.getVerifications(),
        ]);
        if (plansData?.error || verificationsData.error)
          setError(plansData?.error || verificationsData.error);
        else {
          setActivePlans(plansData);
          setActiveVerifications(verificationsData);
          dispatch({ type: "PLANS", payload: { plans: plansData } });
          dispatch({
            type: "VERIFICATIONS",
            payload: { verifications: verificationsData },
          });
        }
      } catch (error) {
        setError("plans_errors");
      }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (eventId && language) getData(eventId, language);
    else navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getData, eventId, language]);

  return (
    <section className="w-full">
      <AdminTopNav title={t("Nova Pesquisa")} />
      <div className="flex flex-col justify-center mx-auto bg-white p-4 rounded-lg">
        {loading && <Loading />}
        {error && <Alert message={error} type="danger" />}
        {success && <Alert message={success} type="success" />}
        {info && <Alert message={info} type="info" />}
        {warning && <Alert message={warning} type="warning" />}
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading}
              required={true}
              placeholder={t("new_event_name")}
              value="name"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField
              disabled={loading}
              required={true}
              placeholder={t("new_event_address_state")}
              value="addressState"
              values={values}
              setValues={setValues}
              options={[
                {
                  value: "AC",
                  text: "Acre",
                },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading}
              required={true}
              placeholder={t("new_event_address_street")}
              value="addressStreet"
              values={values}
              setValues={setValues}
            />
            <InputField
              disabled={loading}
              placeholder={t("new_event_address_number")}
              value="addressNumber"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading}
              required={true}
              placeholder={t("new_event_address_neighborhood")}
              value="addressNeighborhood"
              values={values}
              setValues={setValues}
            />
            <InputField
              disabled={loading}
              placeholder={t("new_event_address_complement")}
              value="addressComplement"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="w-full flex flex-row mt-8">
            <div className="w-1/3 flex justify-center">
              <FormButton
                testid="new-event-clear-button"
                text={"Limpar Formulário"}
                disabled={loading}
                type="button"
                onClick={() => handleResetForm()}
                size="w-2/3"
                color="text-white bg-slate-400"
              />
            </div>
            <div className="w-1/3 flex justify-center" />
            <div className="w-1/3 flex justify-center">
              <FormButton
                testid="new-event-foward-button"
                text={"Avançar"}
                disabled={loading}
                type="submit"
                size="w-2/3"
              />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ActivityDetailsNewSurvey;
