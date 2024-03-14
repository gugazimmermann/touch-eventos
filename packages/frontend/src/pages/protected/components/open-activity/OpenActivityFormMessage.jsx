/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from "react-i18next";
import { FormButton } from "../../../../components/form";
import { useEffect, useState } from "react";
import { formatDate } from "../../../../helpers/format";
import { Alert } from "../../../../components";

const OpenActivityFormMessage = ({
  activeVerifications,
  loading,
  values,
  setValues,
  onSubmit,
  setStep,
  setError,
}) => {
  const { t } = useTranslation("new_activity");

  const surveyURL = `{${String(process.env.REACT_APP_SITE_SURVEY_URL)}/${
    values.slug
  }}`;

  const defaultRaffleText = t("new_activity_messages_raffle_survey_text");
  const defaultSurveyText = t("new_activity_messages_survey_text");
  const defaultConfirmationText = `${values.name} - ${t(
    "new_activity_messages_confirmation_text_code"
  )} {######}`;
  const defaultNotificationOnConfirmText = `${values.name} - ${
    values.raffle === "YES"
      ? t("new_activity_messages_notification_on_confirm_text_raffle")
      : t("new_activity_messages_notification_on_confirm_text_without_raffle")
  } ${surveyURL}`;

  const defaultNotificationOnEndText = `${values.name} - ${t(
    "new_activity_messages_activity_end_survey_notification_text_one"
  )} ${formatDate(values.surveyLastDay, { time: false })}${
    values.raffle === "YES"
      ? t(
          "new_activity_messages_activity_end_survey_notification_text_two_raffle"
        )
      : t(
          "new_activity_messages_activity_end_survey_notification_text_two_without_raffle"
        )
  } ${surveyURL}`;

  const defaultRaffleAutomaticText = `${t(
    "new_activity_messages_raffle_automatic_text_one"
  )} {NOME},\n\n${t("new_activity_messages_raffle_automatic_text_two")} ${
    values.name
  }`;

  const [verificationType, setVerificationType] = useState();

  const [visitorGiftText, setVisitorGiftText] = useState(
    values.visitorGiftText
      ? values.visitorGiftText
      : t("new_activity_messages_gift_text")
  );
  const [raffleText, setRaffleText] = useState(
    values.raffleText ? values.raffleText : defaultRaffleText
  );
  const [surveyText, setSurveyText] = useState(
    values.surveyText ? values.surveyText : defaultSurveyText
  );
  const [confirmationText, setConfirmationText] = useState(
    values.confirmationText ? values.confirmationText : defaultConfirmationText
  );
  const [notificationOnConfirmText, setNotificationOnConfirmText] = useState(
    values.notificationOnConfirmText
      ? values.notificationOnConfirmText
      : defaultNotificationOnConfirmText
  );
  const [notificationOnEndText, setNotificationOnEndText] = useState(
    values.notificationOnEndText
      ? values.notificationOnEndText
      : defaultNotificationOnEndText
  );
  const [raffleAutomaticText, setRaffleAutomaticText] = useState(
    values.raffleAutomaticText
      ? values.raffleAutomaticText
      : defaultRaffleAutomaticText
  );

  const disableButton = () => {
    if (
      !confirmationText.includes("{######}") ||
      !notificationOnConfirmText.includes(surveyURL) ||
      !notificationOnEndText.includes(surveyURL) ||
      !raffleAutomaticText.includes("{NOME}")
    ) {
      return true;
    }
    return false;
  };

  const handleMoveFoward = (e) => {
    e.preventDefault();
    setValues({
      ...values,
      visitorGiftText,
      raffleText,
      surveyText,
      confirmationText,
      notificationOnConfirmText,
      notificationOnEndText,
      raffleAutomaticText
    })
    onSubmit(e);
  }

  const verifyText = (text, placeholder) => {
    setError();
    if (!text.includes(placeholder))
      setError(`Texto deve conter ${placeholder}`);
  };

  useEffect(() => {
    const selectedVerification = activeVerifications.find(
      (v) => v.verificationId === values.verificationId
    );
    setVerificationType(selectedVerification.type);
    setValues({
      ...values,
      visitorGiftText,
      raffleText,
      surveyText,
      confirmationText,
      notificationOnConfirmText,
      notificationOnEndText,
      raffleAutomaticText
    })
  }, [activeVerifications, values.verificationId]);

  return (
    <form onSubmit={(e) => handleMoveFoward(e)}>
      <div className="mb-4">
        <Alert
          title="Atenção"
          message="Texto com { } são obrigários, como {######} que repesenta o código de confirmação."
          type="info"
        />
      </div>

      <h2 className="mt-4 pl-3 font-semibold tracking-wide text-center">
        {t("new_activity_optional")}
      </h2>

      {values.visitorGift === "YES" && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col justify-start">
            <label
              className="pl-4 text-left w-full tracking-wide"
              htmlFor="visitorGiftText"
            >
              {`${t("new_activity_messages_register_screen")} - ${t(
                "new_activity_messages_gift"
              )}`}
            </label>
            <input
              className="block w-full px-4 py-2 text-text-700 placeholder-text-500 bg-white border rounded-lg"
              name="visitorGiftText"
              id="visitorGiftText"
              type="text"
              placeholder={visitorGiftText}
              value={visitorGiftText}
              onChange={(e) => {
                setVisitorGiftText(e.target.value);
                setValues({ ...values, visitorGiftText: e.target.value });
              }}
            />
          </div>
        </div>
      )}

      {values.raffle === "YES" ? (
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col justify-start">
            <label
              className="pl-4 text-left w-full tracking-wide"
              htmlFor="raffleText"
            >
              {`${t("new_activity_messages_register_screen")} - ${t(
                "new_activity_messages_raffle"
              )}`}
            </label>
            <input
              className="block w-full px-4 py-2 text-text-700 placeholder-text-500 bg-white border rounded-lg"
              name="raffleText"
              id="raffleText"
              type="text"
              placeholder={raffleText}
              value={raffleText}
              onChange={(e) => {
                setRaffleText(e.target.value);
                setValues({ ...values, raffleText: e.target.value });
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col justify-start">
            <label
              className="pl-4 text-left w-full tracking-wide"
              htmlFor="surveyText"
            >
              {`${t("new_activity_messages_register_screen")} - ${t(
                "new_activity_messages_survey"
              )}`}
            </label>
            <input
              className="block w-full px-4 py-2 text-text-700 placeholder-text-500 bg-white border rounded-lg"
              name="surveyText"
              id="surveyText"
              type="text"
              placeholder={surveyText}
              value={surveyText}
              onChange={(e) => {
                setSurveyText(e.target.value);
                setValues({ ...values, surveyText: e.target.value });
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="confirmationText"
          >
            {verificationType === "SMS"
              ? t("new_activity_messages_confirmation_sms")
              : t("new_activity_messages_confirmation_email")}
            {` - `}
            {t("new_activity_messages_confirmation")}
            {` - `}
            {t("new_activity_messages_confirmation_text")}
          </label>
          <textarea
            className="w-full px-4 py-2 text-text-700 bg-white border rounded-lg"
            name="confirmationText"
            id="confirmationText"
            rows={verificationType === "SMS" ? "2" : "4"}
            value={confirmationText}
            onChange={(e) => {
              setConfirmationText(e.target.value);
              setValues({ ...values, confirmationText: e.target.value });
            }}
            onBlur={(e) => verifyText(e.target.value, "{######}")}
          />
        </div>
      </div>

      {values.notificationOnConfirm === "YES" && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col justify-start">
            <label
              className="pl-4 text-left w-full tracking-wide"
              htmlFor="notificationOnConfirmText"
            >
              {verificationType === "SMS"
                ? t("new_activity_messages_confirmation_sms")
                : t("new_activity_messages_confirmation_email")}
              {` - `}
              {t("new_activity_messages_confirmation")}
              {` - `}
              {t("new_activity_messages_notification_on_confirm")}
            </label>
            <textarea
              className="w-full px-4 py-2 text-text-700 bg-white border rounded-lg"
              name="notificationOnConfirmText"
              id="notificationOnConfirmText"
              rows={verificationType === "SMS" ? "2" : "4"}
              value={notificationOnConfirmText}
              onChange={(e) => {
                setNotificationOnConfirmText(e.target.value);
                setValues({
                  ...values,
                  notificationOnConfirmText: e.target.value,
                });
              }}
              onBlur={(e) => verifyText(e.target.value, surveyURL)}
            />
          </div>
        </div>
      )}

      {values.notificationOnActivityEnd === "YES" && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col justify-start">
            <label
              className="pl-4 text-left w-full tracking-wide"
              htmlFor="notificationOnEndText"
            >
              {verificationType === "SMS"
                ? t("new_activity_messages_confirmation_sms")
                : t("new_activity_messages_confirmation_email")}
              {` - `}
              {t("new_activity_messages_activity_end")}
              {` - `}
              {t("new_activity_messages_notification_activity_end")}
            </label>
            <textarea
              className="w-full px-4 py-2 text-text-700 bg-white border rounded-lg"
              name="notificationOnEndText"
              id="notificationOnEndText"
              rows={verificationType === "SMS" ? "2" : "4"}
              value={notificationOnEndText}
              onChange={(e) => {
                setNotificationOnEndText(e.target.value);
                setValues({
                  ...values,
                  notificationOnEndText: e.target.value,
                });
              }}
              onBlur={(e) => verifyText(e.target.value, surveyURL)}
            />
          </div>
        </div>
      )}

      {values.raffleAutomatic && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="flex flex-col justify-start">
            <label
              className="pl-4 text-left w-full tracking-wide"
              htmlFor="raffleAutomaticText"
            >
              {t("new_activity_messages_confirmation_email")}
              {` - `}
              {t("new_activity_messages_raffle_automatic")}
            </label>
            <textarea
              className="w-full px-4 py-2 text-text-700 bg-white border rounded-lg"
              name="raffleAutomaticText"
              id="raffleAutomaticText"
              rows="6"
              value={raffleAutomaticText}
              onChange={(e) => {
                setRaffleAutomaticText(e.target.value);
                setValues({
                  ...values,
                  raffleAutomaticText: e.target.value,
                });
              }}
              onBlur={(e) => verifyText(e.target.value, '{NOME}')}
            />
          </div>
        </div>
      )}

      <div className="w-full flex flex-row mt-8">
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-activity-back-button"
            text={t("new_activity_button_back")}
            disabled={loading}
            type="button"
            onClick={() => setStep(2)}
            size="w-2/3"
            color="text-white bg-slate-400"
          />
        </div>
        <div className="w-1/3 flex justify-center" />
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-activity-foward-button"
            text={t("new_activity_button_foward")}
            disabled={loading || disableButton()}
            type="submit"
            size="w-2/3"
          />
        </div>
      </div>
    </form>
  );
};

export default OpenActivityFormMessage;
