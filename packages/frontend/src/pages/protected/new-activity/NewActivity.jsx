/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { endOfDay, getTime, isAfter, startOfDay } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useActivities } from "../../../context/ActivitiesContext";
import { plans, verifications, auth, activity } from "../../../services";
import useDatePicker from "../../../hooks/useDatePicker";
import { newActivityValidate } from "../../../helpers/form-validation";
import ROUTES from "../../../constants/routes";
import { Alert, Loading, Toast } from "../../../components";
import { AdminTopNav } from "../../../components/layout";
import StepHeader from "./NewActivityStepHeader";
import NewActivityFormActivity from "./NewActivityFormActivity";
import NewActivityFormSurvey from "./NewActivityFormSurvey";
import NewActivityFormMessage from "./NewActivityFormMessage";
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
  raffle: "",
  surveyLastDay: "",
  raffleDay: "",
  raffleType: "",
  notificationOnConfirm: "",
  notificationOnActivityEnd: "",
  raffleAutomatic: true,
  visitorGiftText: "",
  raffleText: "",
  surveyText: "",
  confirmationText: "",
  notificationOnConfirmText: "",
  notificationOnEndText: "",
  raffleAutomaticText: "",
};

const NewActivity = () => {
  const { t } = useTranslation("new_activity");
  const navigate = useNavigate();
  const { state, dispatch } = useActivities();
  const {
    dateToTimestap,
    datesToString,
    stringToDateObject,
    validateActivityDates,
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
  const [activityDates, setActivityDates] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [isToastVisible, setToastVisible] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState();

  const resetMessages = () => {
    setError("");
    setSuccess("");
    setInfo("");
    setToastMsg("");
    setToastVisible(false);
  };

  const handleShowToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const handleResetForm = () => {
    dispatch({
      type: "ACTIVITY_REGISTER",
      payload: { activityRegister: null },
    });
    setValues(initialValues);
    if (state.subscription?.planId)
      setValues({ ...values, planId: state.subscription.planId });
    setActivityDates([]);
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
    if (activityDates.length && activePlans.length) {
      const selectedPlan =
        values.planId || activePlans[activePlans.length - 1].planId;
      const { maxDays, maxDiff } = activePlans.find(
        (p) => p.planId === selectedPlan
      );
      const verify = validateActivityDates(maxDays, maxDiff, activityDates);
      setInfo(verify);
      return verify;
    }
  }, [
    activePlans,
    activityDates,
    setInfo,
    validateActivityDates,
    values.planId,
  ]);

  const verifySubscriptionDate = useCallback(() => {
    if (state?.subscription?.endDate) {
      const lastDay = endOfDay(new Date(
        parseInt(activityDates[activityDates.length - 1].unix * 1000, 10)
      ));
      const lastSubscriptionDay = endOfDay(new Date(
        parseInt(state.subscription.endDate, 10)
      ));
      const verify = isAfter(lastDay, lastSubscriptionDay)
        ? t("new_activity_dates_last_day_subscription")
        : false;
      setInfo(verify);
      return verify;
    }
  }, [activityDates, state?.subscription?.endDate]);

  const handleSubmit = async (paymentIntent) => {
    setError("");
    setSuccess("");
    setInfo("");
    try {
      const currentPlan = activePlans.find((p) => p.planId === values.planId);
      const activityId = uuidv4();
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
        activityId,
        userId,
        startDate: `${dateToTimestap(activityDates[0])}`,
        endDate: `${dateToTimestap(activityDates[activityDates.length - 1])}`,
        raffleDay: `${startOfDay(new Date(values.raffleDay)).getTime()}`,
        city: values.addressCity,
        state: values.addressState,
        location: `${values.addressCity}+${values.addressState}`,
        createdAt: `${getTime(new Date())}`,
        active:
          state.subscription?.planId || paymentIntent?.status === "succeeded"
            ? 1
            : 0,
        dates: datesToString(activityDates),
        payment: paymentData,
      };
      setLoading(true);
      const res = await activity.saveActivity(data);
      if (res?.error) setError(res.error);
      else {
        dispatch({
          type: "ACTIVITIES_LIST",
          payload: { activitiesList: null },
        });
        handleResetForm();
        navigate(`/${ROUTES.ADMIN.ACTIVITY}/${activityId}`);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    if (step === 1) {
      if (!slugAvailable) if (!(await handleVerifySlug(values.slug))) return;
      if (
        !newActivityValidate.stepOne(
          { ...values, dates: activityDates },
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
        (values.dates || activityDates.length) &&
        values.addressZipCode &&
        values.addressState &&
        values.addressCity &&
        values.addressStreet &&
        values.addressNeighborhood
      ) {
        dispatch({
          type: "ACTIVITY_REGISTER",
          payload: { activityRegister: { ...values, dates: activityDates } },
        });
        setStep(2);
      }
    } else if (step === 2) {
      if (
        !newActivityValidate.stepTwo(
          { ...values, dates: activityDates },
          setError,
          t
        )
      ) {
        return;
      }
      if (values.verificationId && values.visitorGift && values.raffle) {
        dispatch({
          type: "ACTIVITY_REGISTER",
          payload: { activityRegister: { ...values, dates: activityDates } },
        });
        setStep(3);
      }
    } else if (step === 3) {
      dispatch({
        type: "ACTIVITY_REGISTER",
        payload: { activityRegister: { ...values, dates: activityDates } },
      });
      setStep(4);
      if (!state.subscription?.planId) setStep(4);
      else handleSubmit();
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
    if (state.activityRegister) {
      setValues(state.activityRegister);
      setActivityDates(
        state.activityRegister.dates.map((d) => stringToDateObject(d))
      );
      if (state.activityRegister.confirmationText) {
        setStep(4);
      } else if (state.activityRegister.verificationId) {
        setStep(3);
      } else if (state.activityRegister.planId) {
        setStep(2);
      }
    }
  }, []);

  return (
    <section className="w-full mb-8">
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
          <NewActivityFormActivity
            activePlans={activePlans}
            loading={loading}
            setLoading={setLoading}
            values={values}
            setValues={setValues}
            activityDates={activityDates}
            setActivityDates={setActivityDates}
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
            activityDates={activityDates}
            onSubmit={handleStepSubmit}
            setStep={setStep}
            showToast={handleShowToast}
            activePlans={activePlans}
          />
        )}
        {step === 3 && (
          <NewActivityFormMessage
            activeVerifications={activeVerifications}
            loading={loading}
            values={values}
            setValues={setValues}
            onSubmit={handleStepSubmit}
            setStep={setStep}
            setError={setError}
          />
        )}
        {step === 4 && (
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
