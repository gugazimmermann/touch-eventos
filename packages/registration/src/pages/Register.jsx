import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDays, endOfDay, isAfter, isBefore, startOfDay } from "date-fns";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import * as register from "../services/register";
import usePhoneCode from "../hooks/usePhoneCode";
import maskPhone from "../helpers/mask-phone";
import { validateEmail, validatePhone } from "../helpers/validate";
import { FormButton, InputField } from "../components/form";
import Layout from "./Layout";

const Register = () => {
  const { t, i18n } = useTranslation("activity_register");
  const { activitySlug } = useParams();
  const navigate = useNavigate();
  const { PhoneCodeSelect } = usePhoneCode();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [activity, setActivity] = useState();
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
      activityId: activity.activityId,
      email: "",
      phone: "",
      language: i18n.language,
      createdAt: `${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
    };
    if (activity.verification === "SMS") {
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
    const registerResponse = await register.register(
      activity.activityId,
      payload
    );
    if (registerResponse?.registrationId) {
      navigate(
        `/${activity.slug}/${registerResponse.registrationId}/${registerResponse.language}`
      );
    } else {
      if (registerResponse.error === "Already Registered") {
        setError(t("already_registered"));
      } else {
        setError(t("register_error"));
      }
    }
    setLoading(false);
  };

  const getData = useCallback(
    async (slug) => {
      setLoadingPage(true);
      try {
        const activityData = await register.getActivityBySlug(slug);
        if (activityData?.error || !activityData?.activityId) {
          setWarning(t("activity_not_found"));
        } else {
          const today = startOfDay(new Date());
          const startDate = startOfDay(
            new Date(parseInt(activityData.startDate, 10))
          );
          // TODO: fix date
          // const endDate = endOfDay(
          //   new Date(parseInt(activityData.endDate, 10))
          // );
          const endDate = addDays(today, 1);
          if (isBefore(today, startDate)) {
            setInfo(t("activity_not_started"));
            setAllowRegister(false);
          } else if (isAfter(today, endDate)) {
            setWarning(t("activity_ended"));
            setAllowRegister(false);
          }
          if (activityData.payment !== "success") {
            if (activityData.registrations < 10) {
              setInfo(
                `${t("activity_trial_remain")} ${
                  10 - activityData.registrations
                }`
              );
            } else {
              setWarning(t("activity_trial_over"));
              setAllowRegister(false);
            }
          }
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
    if (activitySlug) getData(activitySlug);
    else window.location.href = process.env.REACT_APP_SITE_URL;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitySlug, getData]);

  return (
    <Layout
      loadingPage={loadingPage}
      loading={loading}
      error={error}
      info={info}
      warning={warning}
      activity={activity}
    >
      {activity && (
        <div className="w-full text-center">
          <h1 className="text-xl font-semibold">
            {activity.verification === "SMS"
              ? t("your_phone")
              : t("your_email")}
          </h1>
          <form className="w-full px-4" onSubmit={handleSubmit}>
            {activity.verification === "SMS" ? (
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
                    required={activity.verification === "SMS" ? true : false}
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
                required={activity.verification !== "SMS" ? true : false}
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
                <span className="text-sm">{t("agree_to_receive_info")}</span>
                <div className="relative">
                  <input
                    id="consentCheckbox"
                    type="checkbox"
                    className="sr-only"
                    disabled={loading || !allowRegister}
                    checked={check}
                    onChange={(e) => setCheck(e.target.checked)}
                  />
                  <div className="w-6 h-6 inline-flex items-center justify-center bg-white border-2 rounded-full mt-2">
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
            <div className="w-full text-center mt-4">
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
        </div>
      )}
    </Layout>
  );
};

export default Register;
