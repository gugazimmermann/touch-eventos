import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { endOfDay, isAfter, startOfDay } from "date-fns";
import { useActivities } from "../../../../context/ActivitiesContext";
import * as services from "../../../../services";
import ROUTES from "../../../../constants/routes";
import useDatePicker from "../../../../hooks/useDatePicker";
import { newActivityValidate } from "../../../../helpers/form-validation";
import { ArrowBackCircle } from "../../../../icons";
import { Alert, Loading, Toast } from "../../../../components";
import { AdminTopNav } from "../../../../components/layout";
import OpenActivityFormActivity from "../../components/open-activity/OpenActivityFormActivity";
import OpenActivityFormSurvey from "../../components/open-activity/OpenActivityFormSurvey";
import OpenActivityFormMessage from "../../components/open-activity/OpenActivityFormMessage";
import OpenActivityStepHeader from "./components/OpenActivityStepHeader";

const initialValues = {
  planId: "",
  dates: "",
  name: "",
  slug: "",
  activityType: "",
  description: "",
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
  notificationOnConfirm: "",
  notificationOnActivityEnd: "",
  raffle: "",
  raffleType: "",
  surveyLastDay: "",
  raffleDay: "",
  raffleAutomatic: true,

  visitorGiftText: "",
  raffleText: "",
  surveyText: "",
  confirmationText: "",
  notificationOnConfirmText: "",
  notificationOnEndText: "",
  raffleAutomaticText: "",
};

const OpenActivityDetailsEdit = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
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
  const [step, setStep] = useState(1);
  const [currentActivity, setCurrentActivity] = useState();
  const [values, setValues] = useState(initialValues);
  const [activePlans, setActivePlans] = useState([]);
  const [activeVerifications, setActiveVerifications] = useState([]);
  const [activityDates, setActivityDates] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const [isToastVisible, setToastVisible] = useState(false);
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

  const handleVerifySlug = async (slug) => {
    if (currentActivity.slug === slug) {
      setSlugAvailable(true);
      return true;
    }
    setError("");
    setLoading(true);
    const res = await services.activity.verifySlug(slug);
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
      const lastDay = endOfDay(
        new Date(
          parseInt(activityDates[activityDates.length - 1].unix * 1000, 10)
        )
      );
      const lastSubscriptionDay = endOfDay(
        new Date(parseInt(state.subscription.endDate, 10))
      );
      const verify = isAfter(lastDay, lastSubscriptionDay)
        ? t("new_activity_dates_last_day_subscription")
        : false;
      setInfo(verify);
      return verify;
    }
  }, [activityDates, state?.subscription?.endDate, t]);

  const handleSubmit = async () => {
    resetMessages();
    try {
      const data = {
        ...values,
        activityId,
        startDate: `${dateToTimestap(activityDates[0])}`,
        endDate: `${dateToTimestap(activityDates[activityDates.length - 1])}`,
        raffleDay: `${startOfDay(new Date(values.raffleDay)).getTime()}`,
        raffleAutomatic: values.raffle && values.raffle === 'YES' && values.raffleAutomatic,
        city: values.addressCity,
        state: values.addressState,
        location: `${values.addressCity}+${values.addressState}`,
        dates: datesToString(activityDates),
      };
      setLoading(true);
      const res = await services.activity.editActivity(activityId, data);
      if (res?.error) setError(res.error);
      else {
        dispatch({
          type: "ACTIVITIES_LIST",
          payload: { activitiesList: null },
        });
        navigate(`/${ROUTES.ADMIN.OPENACTIVITY}/${activityId}`);
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
      if (currentActivity.slug !== values.slug && !slugAvailable)
        if (!(await handleVerifySlug(values.slug))) return;
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
        setStep(3);
      }
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const getData = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const [plansData, verificationsData, activityData] = await Promise.all([
          state.plans ? state.plans : await services.plans.getPlans(),
          state.verifications
            ? state.verifications
            : await services.verifications.getVerifications(),
          await services.activity.getActivityById(id),
        ]);
        const error =
          plansData?.error || verificationsData?.error || activityData?.error;
        if (error) {
          setError(error);
        } else {
          setActivePlans(plansData);
          dispatch({ type: "PLANS", payload: { plans: plansData } });
          setActiveVerifications(verificationsData);
          dispatch({
            type: "VERIFICATIONS",
            payload: { verifications: verificationsData },
          });
          setActivityDates(
            JSON.parse(activityData.dates).map((d) =>
              stringToDateObject(d, "pt-BR")
            )
          );
          if (state.subscription?.planId) {
            setValues({
              ...activityData,
              dates: JSON.parse(activityData.dates),
              planId: state.subscription.planId,
            });
          } else {
            setValues({
              ...activityData,
              dates: JSON.parse(activityData.dates),
            });
          }
          setCurrentActivity(activityData);
        }
      } catch (error) {
        setError(t("Erro ao carregar os dados, tente novamente."));
      }
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, state.plans, state.subscription.planId, state.verifications]
  );

  const handleResetForm = async () => {
    await getData(activityId);
  };

  useEffect(() => {
    if (activityId) getData(activityId);
    else navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, getData]);

  return (
    <section className="w-full px-4 mb-8">
      <AdminTopNav title={t("Editar Atividade")} />
      <div className="flex flex-col justify-start items-start gap-4">
        <button
          className="flex flow-row justify-center items-center"
          onClick={() =>
            navigate(`/${ROUTES.ADMIN.OPENACTIVITY}/${activityId}`)
          }
        >
          <ArrowBackCircle />
          <h2 className="text-2xl text-strong ml-2">
            {t("activity_details_desk_title")} - {values?.name}
          </h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full bg-white rounded-lg shadow-lg">
            <div className="container px-4 mx-auto my-4">
              {error && <Alert message={error} type="danger" />}
              {success && <Alert message={success} type="success" />}
              {info && <Alert message={info} type="info" />}
              <OpenActivityStepHeader step={step} setStep={setStep} />
              {step === 1 && (
                <OpenActivityFormActivity
                  canChangePlan={false}
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
                <OpenActivityFormSurvey
                  canChangeVerification={false}
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
                <OpenActivityFormMessage
                  activeVerifications={activeVerifications}
                  loading={loading}
                  values={values}
                  setValues={setValues}
                  onSubmit={handleStepSubmit}
                  setStep={setStep}
                  setError={setError}
                />
              )}
            </div>
          </div>
        )}
        {isToastVisible && (
          <Toast
            color="red"
            message={toastMsg}
            isVisible={isToastVisible}
            onClose={() => setToastVisible(false)}
          />
        )}
      </div>
    </section>
  );
};

export default OpenActivityDetailsEdit;
