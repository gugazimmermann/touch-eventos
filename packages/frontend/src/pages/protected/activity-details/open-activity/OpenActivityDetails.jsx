import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useActivities } from "../../../../context/ActivitiesContext";
import { activity } from "../../../../services";
import { Alert, Loading, Toast } from "../../../../components";
import { AdminTopNav } from "../../../../components/layout";
import {
  OpenActivityDetailsCardLogo,
  OpenActivityDetailsCardRegister,
  OpenActivityDetailsCardSurvey,
  OpenActivityDetailsQRCode,
  OpenActivityDetailsCard,
  OpenActivityDetailsCardDesk,
  OpenActivityDetailsCardPayment,
} from "./components";
import { addDays, isBefore } from "date-fns";

const initValues = {
  activityId: "",
  userId: "",
  active: "",
  payment: "",
  plan: "",
  archived: "",
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
  surveysVisitors: 0,
  desk: 0,
};

const OpenActivityDetails = () => {
  const { t } = useTranslation("activity_details");
  const { activityId, payment } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useActivities();
  const [values, setValues] = useState(initValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [progress, setProgress] = useState(0);
  const [isToastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showData, setShowData] = useState(true);

  const [showDetails, setShowDetails] = useState(true);
  const [detailsOpacity, setDetailsOpacity] = useState("opacity-100");
  const [paymentOpacity, setPaymentOpacity] = useState("opacity-0");

  const handleTogglePaymentView = () => {
    setShowDetails(!showDetails);
  };

  const handleActivityData = useCallback(
    (data) => {
      setValues({
        ...values,
        activityId: data.activityId,
        userId: data.userId,
        logo: data.logo,
        name: data.name,
        slug: data.slug,
        active: data.active,
        payment: data.payment,
        plan: data.plan,
        archived: data?.archived,
        verification: data.verification,
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
        confirmationText: data.confirmationText,
        visitorGift: data.visitorGift,
        visitorGiftText: data.visitorGiftText,
        raffle: data.raffle,
        raffleType: data.raffleType,
        raffleDay: data.raffleDay,
        raffleText: data.raffleText,
        raffleAutomatic: data.raffleAutomatic,
        raffleAutomaticText: data.raffleAutomaticText,
        notificationOnConfirm: data.notificationOnConfirm,
        notificationOnConfirmText: data.notificationOnConfirmText,
        notificationOnActivityEnd: data.notificationOnActivityEnd,
        notificationOnEndText: data.notificationOnEndText,
        registers: data.registers,
        registersConfirmed: data.registersConfirmed,
        surveyLastDay: data.surveyLastDay,
        surveyText: data.surveyText,
        surveys: data.surveys,
        surveysVisitors: data.surveysVisitors,
        desk: data.desk,
      });
      if (!data.active && !data?.payment) {
        setWarning({
          title: "Pagamento em Aberto",
          message: "Utilizando Período de Teste, máximo dez cadastros.",
        });
      }
      if (!data.active && data?.payment === "success") {
        setWarning({
          title: "Atividate Inativa",
          message: "A atividade está inativa, entre em contato conosco.",
        });
      }
      if (data.active && data?.payment !== "success") {
        setWarning({
          title: "Falha no Pagamento",
          message: "Ocorreu uma falha no pagamento, entre em contato conosco.",
        });
      }
      const viewDataEndDate = addDays(new Date(parseInt(data.endDate, 10)), 30);
      if (
        state?.subscription?.endDate &&
        isBefore(
          new Date(parseInt(state.subscription.endDate, 10)),
          new Date()
        ) &&
        isBefore(viewDataEndDate, new Date())
      ) {
        setShowData(false);
      } else if (isBefore(viewDataEndDate, new Date())) {
        setShowData(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.subscription.endDate]
  );

  const handleLogoChange = async (newLogo) => {
    if (newLogo) {
      const onUploadProgress = (progress) => setProgress(progress);
      await activity.saveActivityImage(
        activityId,
        { logo: newLogo },
        onUploadProgress
      );
      setValues({ ...values, logo: newLogo });
      setProgress(0);
      dispatch({ type: "ACTIVITIES_LIST", payload: { activitiesList: null } });
      dispatch({
        type: "ACTIVITIES_LIST_ARCHIVED",
        payload: { activitiesListArchived: null },
      });
    }
  };

  const getData = useCallback(
    async (id) => {
      setValues(initValues);
      setLoading(true);
      try {
        const activityData = await activity.getActivityById(id);
        if (activityData?.error) setError(activityData?.error);
        else handleActivityData(activityData);
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    [handleActivityData]
  );

  const handleArchive = async (id) => {
    setLoading(true);
    try {
      const activityData = await activity.archiveActivity(id);
      if (activityData?.error) setError(activityData?.error);
      else {
        dispatch({
          type: "ACTIVITIES_LIST",
          payload: { activitiesList: null },
        });
        dispatch({
          type: "ACTIVITIES_LIST_ARCHIVED",
          payload: { activitiesListArchived: null },
        });
        getData(id);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDetails) {
      setDetailsOpacity("opacity-100");
      setPaymentOpacity("opacity-0");
    } else {
      setDetailsOpacity("opacity-0");
      setPaymentOpacity("opacity-100");
    }
  }, [showDetails]);

  useEffect(() => {
    if (payment && payment === "pagamento") {
      setShowDetails(false);
      setDetailsOpacity("opacity-0");
      setPaymentOpacity("opacity-100");
    } else {
      setShowDetails(true);
      setDetailsOpacity("opacity-100");
      setPaymentOpacity("opacity-0");
    }
  }, [payment]);

  useEffect(() => {
    if (activityId) getData(activityId);
    else navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, getData]);

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
      <AdminTopNav title={`${t("activity_details_title")} - ${values.name}`} />
      {loading && <Loading />}
      {values?.plan && !loading && (
        <div className="w-full flex flex-col justify-between gap-4">
          <div className="flex flex-row justify-between items-center gap-4">
            <OpenActivityDetailsCardLogo
              name={values.name}
              logo={values.logo}
              onLogoChange={handleLogoChange}
              setToastVisible={setToastVisible}
              setToastMessage={setToastMessage}
            />
            <div className="w-2/5 flex flex-col gap-4">
              <OpenActivityDetailsCardRegister
                showData={showData}
                activityId={activityId}
                registers={values.registers}
                registersConfirmed={values.registersConfirmed}
              />
              <OpenActivityDetailsCardSurvey
                showData={showData}
                activityId={activityId}
                surveys={values.surveys}
                surveysVisitors={values.surveysVisitors}
              />
            </div>
            <OpenActivityDetailsQRCode
              slug={values.slug}
              endDate={values.endDate}
            />
          </div>

          <div
            className={`${detailsOpacity} ${
              showDetails ? "visible" : "hidden"
            } transition-opacity duration-500`}
          >
            <OpenActivityDetailsCard
              data={values}
              handleArchive={handleArchive}
              handleTogglePaymentView={handleTogglePaymentView}
            />
          </div>

          <div
            className={`${paymentOpacity} ${
              !showDetails ? "visible" : "hidden"
            } transition-opacity duration-500`}
          >
            <OpenActivityDetailsCardPayment
              data={values}
              handleTogglePaymentView={handleTogglePaymentView}
            />
          </div>

          {values.visitorGift === "YES" && (
            <OpenActivityDetailsCardDesk
              activityId={activityId}
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

export default OpenActivityDetails;
