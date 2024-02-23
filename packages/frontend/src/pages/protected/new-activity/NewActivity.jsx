/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTime, isAfter } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useActivities } from "../../../context/ActivitiesContext";
import { plans, verifications, auth, activity } from "../../../services";
import useDatePicker from "../../../hooks/useDatePicker";
import { newActivityValidate } from "../../../helpers/form-validation";
import ROUTES from "../../../constants/routes";
import { Alert, Loading, Toast } from "../../../components";
import { AdminTopNav } from "../../../components/layout";
import StepHeader from "./NewActivityStepHeader";
import NewActivityFormEvent from "./NewActivityFormEvent";
import NewActivityFormSurvey from "./NewActivityFormSurvey";
import NewActivityFormStripe from "./NewActivityFormStripe";

const initialValues = {
  planId: "",
  name: "",
  slug: "",
  dates: "",
  addressCountry: "BR",
  addressZipCode: "",
  addressState: "",
  addressCity: "",
  addressStreet: "",
  addressNumber: "",
  addressNeighborhood: "",
  addressComplement: "",
  addressLatitude: "",
  addressLongitude: "",
  verificationId: "",
  visitorGift: "",
  visitorGiftTextPTBR: "",
  visitorGiftTextEN: "",
  visitorGiftTextES: "",
  raffle: "",
  raffleType: "",
  raffleTextPTBR: "",
  raffleTextEN: "",
  raffleTextES: "",
  notificationOnConfirm: "",
  notificationOnEventEnd: "",
};

const NewActivity = () => {
  const { t } = useTranslation("new_activity");
  const navigate = useNavigate();
  const { state, dispatch } = useActivities();
  const {
    dateToTimestap,
    datesToString,
    stringToDateObject,
    validateEventDates,
  } = useDatePicker({
    locale: "pt-BR",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [activePlans, setActivePlans] = useState([]);
  const [activeVerifications, setActiveVerifications] = useState([]);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(initialValues);
  const [eventDates, setEventDates] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [isToastVisible, setToastVisible] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState();

  const handleShowToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const handleResetForm = () => {
    dispatch({
      type: "EVENT_REGISTER",
      payload: { eventRegister: null },
    });
    setValues(initialValues);
    if (state.subscription?.planId)
      setValues({ ...values, planId: state.subscription.planId });
    setEventDates([]);
  };

  const handleVerifySlug = async (slug) => {
    setError("");
    setLoading(true);
    const res = await activity.verifySlug(slug);
    if (res?.error) {
      setLoading(false);
      setError(error);
      return false;
    } else {
      if (res?.available) {
        setSlugAvailable(true);
        setLoading(false);
        return true;
      } else {
        setSlugAvailable(false);
        setLoading(false);
        return false;
      }
    }
  };

  const verifyDates = useCallback(() => {
    if (eventDates.length && activePlans.length) {
      const selectedPlan =
        values.planId || activePlans[activePlans.length - 1].planId;
      const { maxDays, maxDiff } = activePlans.find(
        (p) => p.planId === selectedPlan
      );
      const verify = validateEventDates(maxDays, maxDiff, eventDates);
      setInfo(verify);
      return verify;
    }
  }, [activePlans, eventDates, setInfo, validateEventDates, values.planId]);

  const verifySubscriptionDate = useCallback(() => {
    if (state?.subscription?.endDate) {
      const lastDay = new Date(
        parseInt(eventDates[eventDates.length - 1].unix * 1000, 10)
      );
      const lastSubscriptionDay = new Date(
        parseInt(state.subscription.endDate, 10)
      );
      const verify = isAfter(lastDay, lastSubscriptionDay)
        ? t("new_activity_dates_last_day_subscription")
        : false;
      setInfo(verify);
      return verify;
    }
  }, [eventDates, state?.subscription?.endDate]);

  const handleSubmit = async (paymentIntent) => {
    setError("");
    setSuccess("");
    setInfo("");
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
        active:
          state.subscription?.planId || paymentIntent?.status === "succeeded"
            ? 1
            : 0,
        dates: datesToString(eventDates),
        payment: paymentData,
      };
      setLoading(true);
      const res = await activity.saveActivity(data);
      if (res?.error) setError(res.error);
      else {
        dispatch({ type: "EVENTS_LIST", payload: { eventsList: null } });
        handleResetForm();
        navigate(`/${ROUTES.ADMIN.ACTIVITY}/${eventId}`);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInfo("");
    setToastMsg("");
    setToastVisible(false);
    if (step === 1) {
      if (!slugAvailable) if (!(await handleVerifySlug(values.slug))) return;
      if (
        !newActivityValidate.stepOne(
          { ...values, dates: eventDates },
          verifyDates,
          setError,
          t
        )
      ) {
        return;
      }
      if (verifySubscriptionDate()) return;
      if (
        values.planId &&
        values.name &&
        (values.dates || eventDates.length) &&
        values.addressZipCode &&
        values.addressState &&
        values.addressCity &&
        values.addressStreet &&
        values.addressNeighborhood
      ) {
        dispatch({
          type: "EVENT_REGISTER",
          payload: { eventRegister: { ...values, dates: eventDates } },
        });
        setStep(2);
      }
    } else if (step === 2) {
      if (
        !newActivityValidate.stepTwo({ ...values, dates: eventDates }, setError, t)
      ) {
        return;
      }
      if (values.verificationId && values.visitorGift && values.raffle) {
        dispatch({
          type: "EVENT_REGISTER",
          payload: { eventRegister: { ...values, dates: eventDates } },
        });
        if (!state.subscription?.planId) setStep(3);
        else handleSubmit();
      }
    }
  };

  const getData = useCallback(async () => {
    setLoading(true);
    if (!state.plans || !state.verifications) {
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
        setError(t("new_activity_error_loading_plans_verification_types"));
      }
    } else {
      setActivePlans(state.plans);
      setActiveVerifications(state.verifications);
    }
    setLoading(false);
  }, [dispatch, state.plans, state.verifications]);

  useEffect(() => {
    getData();
    if (state.eventRegister) {
      if (state.eventRegister.verificationId && state.eventRegister.raffle) {
        setStep(3);
      } else if (
        state.eventRegister.planId &&
        state.eventRegister.name &&
        state.eventRegister.dates &&
        state.eventRegister.addressZipCode &&
        state.eventRegister.addressState &&
        state.eventRegister.addressCity &&
        state.eventRegister.addressStreet &&
        state.eventRegister.addressNeighborhood
      ) {
        setStep(2);
      }
      setValues(state.eventRegister);
      setEventDates(
        state.eventRegister.dates.map((d) => stringToDateObject(d))
      );
    }
  }, [getData, state.eventRegister, stringToDateObject]);

  return (
    <section className="w-full">
      <AdminTopNav title={t("new_activity_title")} />
      <div className="flex flex-col justify-center mx-auto bg-white p-4 rounded-lg">
        <StepHeader
          step={step}
          setStep={setStep}
          paymentSuccess={paymentSuccess}
        />
        {loading && <Loading />}
        {error && <Alert message={error} type="danger" />}
        {success && <Alert message={success} type="success" />}
        {info && <Alert message={info} type="info" />}
        {warning && <Alert message={warning} type="warning" />}
        {step === 1 && (
          <NewActivityFormEvent
            activePlans={activePlans}
            loading={loading}
            setLoading={setLoading}
            values={values}
            setValues={setValues}
            eventDates={eventDates}
            setEventDates={setEventDates}
            verifyDates={verifyDates}
            showToast={handleShowToast}
            onSubmit={handleStepSubmit}
            onResetForm={handleResetForm}
            handleVerifySlug={handleVerifySlug}
            setSlugAvailable={setSlugAvailable}
            slugAvailable={slugAvailable}
          />
        )}
        {step === 2 && (
          <NewActivityFormSurvey
            activeVerifications={activeVerifications}
            loading={loading}
            values={values}
            setValues={setValues}
            onSubmit={handleStepSubmit}
            setStep={setStep}
            showToast={handleShowToast}
          />
        )}
        {step === 3 && (
          <NewActivityFormStripe
            activePlans={activePlans}
            planId={values.planId}
            activeVerifications={activeVerifications}
            verificationId={values.verificationId}
            loading={loading}
            setLoading={setLoading}
            setSuccess={setSuccess}
            setInfo={setInfo}
            setWarning={setWarning}
            setError={setError}
            onSubmit={handleSubmit}
            setStep={setStep}
            paymentSuccess={paymentSuccess}
            setPaymentSuccess={setPaymentSuccess}
          />
        )}
      </div>
      {isToastVisible && toastMsg && (
        <Toast
          message={toastMsg}
          isVisible={isToastVisible}
          onClose={() => setToastVisible(false)}
        />
      )}
    </section>
  );
};

export default NewActivity;
