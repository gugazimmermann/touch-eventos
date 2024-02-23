import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useActivities } from "../../../context/ActivitiesContext";
import { activity } from "../../../services";
import { Alert, Loading, Toast } from "../../../components";
import { AdminTopNav } from "../../../components/layout";
import {
  ActivityDetailsCardLogo,
  ActivityDetailsCardRegister,
  ActivityDetailsCardSurvey,
  ActivityDetailsCardNewSurvey,
  ActivityDetailsQRCode,
  ActivityDetailsCard,
  ActivityDetailsCardDesk,
} from "./components";

const ActivityDetails = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useActivities();
  const [values, setValues] = useState({
    activityId: "",
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

  const handleActivityData = useCallback((data) => {
    setValues({
      ...values,
      activityId: data.activityId,
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
      notificationOnActivityEnd: data.notificationOnActivityEnd,
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
        title: "Atividate Inativa",
        message: "A atividade está inativa, entre em contato conosco.",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogoChange = async (newLogo) => {
    if (newLogo) {
      const onUploadProgress = (progress) => setProgress(progress);
      await activity.saveActivityImage(
        activityId,
        { logo: newLogo },
        onUploadProgress
      );
      setProgress(0);
      dispatch({ type: "ACTIVITIES_LIST", payload: { activitiesList: null } });
    }
  };

  const getData = useCallback(
    async (id) => {
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
      {values?.plan && (
        <div className="w-full flex flex-col justify-between gap-4">
          <div className="flex flex-row justify-between items-center gap-4">
            <ActivityDetailsCardLogo
              name={values.name}
              logo={values.logo}
              onLogoChange={handleLogoChange}
              setToastVisible={setToastVisible}
              setToastMessage={setToastMessage}
            />
            <div className="w-1/3 flex flex-col gap-4">
              <ActivityDetailsCardRegister
                activityId={activityId}
                registers={values.registers}
                registersConfirmed={values.registersConfirmed}
              />
              {values.surveysStarted > 0 ? (
                <ActivityDetailsCardSurvey
                  activityId={activityId}
                  surveysStarted={values.surveysStarted}
                  surveysCompleted={values.surveysCompleted}
                />
              ) : (
                <ActivityDetailsCardNewSurvey
                  activityId={activityId}
                  surveys={values.surveys}
                />
              )}
            </div>
            <ActivityDetailsQRCode activityId={values.activityId} />
          </div>
          <ActivityDetailsCard data={values} />
          {values.visitorGift === "YES" && (
            <ActivityDetailsCardDesk
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

export default ActivityDetails;
