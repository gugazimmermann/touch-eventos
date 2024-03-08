import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as register from "../services/register";
import Layout from "./Layout";

const ConfirmSuccess = () => {
  const { t, i18n } = useTranslation("activity_register");
  const { activitySlug, registrationId, success, language } = useParams();
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [activity, setActivity] = useState();

  const getData = useCallback(
    async (slug) => {
      setLoadingPage(true);
      try {
        const activityData = await register.getActivityBySlug(slug);
        if (activityData?.error || !activityData?.activityId) {
          setWarning(t("activity_not_found"));
        } else {
          setActivity(activityData);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoadingPage(false);
    },
    [t]
  );

  useEffect(() => {
    if (language) i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (activitySlug && registrationId) getData(activitySlug);
    else if (activitySlug && (!success || !registrationId))
      navigate(`/${activitySlug}`);
    else navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitySlug, registrationId, getData]);

  return (
    <Layout
      loadingPage={loadingPage}
      error={error}
      warning={warning}
      activity={activity}
      final={true}
    >
      {activity && (
        <div className="mt-4 w-full text-center">
          <h1 className="text-xl font-semibold">{t("confirmation_success")}</h1>
        </div>
      )}
    </Layout>
  );
};

export default ConfirmSuccess;
