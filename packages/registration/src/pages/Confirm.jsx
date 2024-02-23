import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTime } from "date-fns";
import { useTranslation } from "react-i18next";
import * as register from "../services/register";
import { validateCode } from "../helpers/validate";
import { Gift, Survey } from "../icons";
import { Alert, Loading } from "../components";
import { Header, FooterSmall } from "../components/layout";
import { FormButton, InputField } from "../components/form";

const Confirm = () => {
  const { t, i18n } = useTranslation("activity_register");
  const { activitySlug, registrationId, language } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [activity, setActivity] = useState();
  const [confirmationCode, setConfirmationCode] = useState({
    code: "",
  });

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    if (!validateCode(confirmationCode.code)) {
      setError(t("invalid_code"));
      return;
    }
    setLoading(true);
    const payload = {
      registrationId,
      activityId: activity.activityId,
      code: confirmationCode.code,
      language: i18n.language,
      confirmedAt: `${getTime(new Date())}`,
    };
    const confirmResponse = await register.confirm(activity.activityId, payload);
    if (confirmResponse?.registrationId) {
      navigate(
        `/${activity.slug}/${confirmResponse.registrationId}/success/${confirmResponse.language}`
      );
    } else {
      if (confirmResponse?.error === "Not Found: Registration not found" ||
          confirmResponse?.error === "Bad Request: Wrong Code") {
        setWarning(t("invalid_code"));
      } else {
        setError(confirmResponse.error);
      }
    }
    setLoading(false);
  };

  const getData = useCallback(async (slug) => {
      setLoading(true);
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
      setLoading(false);
    },
    [t]
  );

  useEffect(() => {
    if (language) i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    if (activitySlug && registrationId) getData(activitySlug);
    else if (activitySlug && !registrationId)
      navigate(`/${activitySlug}`);
    else navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitySlug, registrationId, getData]);

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
              {activity && (
                <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
                  {activity.logo && (
                    <img
                      className="object-cover object-center w-full h-64"
                      src={activity.logo}
                      alt="logo"
                    />
                  )}
                  <div className="flex items-center justify-center px-8 py-4 bg-success-500">
                    <h1 className="text-xl font-bold text-white">
                      {activity.name}
                    </h1>
                  </div>

                  <div className="mt-4 w-full text-center">
                    <h1 className="text-xl font-semibold">
                      {t("confirmationTitle")}
                    </h1>

                    <form
                      className="w-3/4 mx-auto px-4"
                      onSubmit={handleSubmit}
                    >
                      <InputField
                        disabled={loading}
                        required={true}
                        type="text"
                        placeholder={t("code")}
                        value="code"
                        values={confirmationCode}
                        setValues={setConfirmationCode}
                      />
                      <div className="w-full text-center mt-4">
                        <FormButton
                          testid="confirm-send-button"
                          text={t("confirmation")}
                          disabled={loading}
                          type="submit"
                          size="w-full"
                          textSize="text-base"
                        />
                      </div>
                    </form>

                    <div className="p-8">
                      {activity.visitorGift === "YES" && (
                        <div className="flex flex-col items-center justify-center">
                          <Gift className="w-8 h-8 text-success-500" />
                          <div>
                            {i18n.language === "pt-BR"
                              ? activity.visitorGiftTextPTBR
                              : i18n.language === "en"
                              ? activity.visitorGiftTextEN
                              : activity.visitorGiftTextES}
                          </div>
                        </div>
                      )}
                      {activity.raffle === "YES" ? (
                        <div className="flex flex-col items-center justify-center mt-4">
                          <Survey className="w-8 h-8 text-success-500" />
                          <div>
                            {i18n.language === "pt-BR"
                              ? activity.raffleTextPTBR
                              : i18n.language === "en"
                              ? activity.raffleTextEN
                              : activity.raffleTextES}
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

export default Confirm;
