import { useTranslation } from "react-i18next";
import DatePicker, { DateObject } from "react-multi-date-picker";
import useDatePicker from "../../../../hooks/useDatePicker";
import { formatValue } from "../../../../helpers/format";
import { FormButton, SelectField } from "../../../../components/form";
import { useEffect, useState } from "react";

const OpenActivityFormSurvey = ({
  canChangeVerification = true,
  activeVerifications,
  loading,
  values,
  setValues,
  activityDates,
  onSubmit,
  setStep,
  showToast,
  activePlans,
}) => {
  const { t } = useTranslation("new_activity");
  const { datePickerSurveyConfig } = useDatePicker({
    locale: "pt-BR",
  });
  const [minLastDay, setMinLastDay] = useState();
  const [maxLastDay, setMaxLastDay] = useState();
  const [maxDay, setMaxDay] = useState();

  const showMessage = () => {
    if (values.verificationId) {
      const selectedVerification = activeVerifications.find(
        (v) => v.verificationId === values.verificationId
      );
      if (selectedVerification.price !== "0.00") {
        showToast(
          `${t("new_activity_verification_msg1")} ${formatValue(
            selectedVerification.price
          )} ${t("new_activity_verification_msg2")}`
        );
      }
    }
  };

  useEffect(() => {
    const { maxDiff } = activePlans.find((p) => p.planId === values.planId);
    const getMinLastDay = new DateObject(
      activityDates[activityDates.length - 1]
    );
    const getMaxLastDay = new DateObject(
      activityDates[activityDates.length - 1]
    );
    getMaxLastDay.add(parseInt(maxDiff, 10), "days");
    const getMinDay = new DateObject(activityDates[activityDates.length - 1]);
    getMinDay.add(1, "days");
    const getMaxDay = new DateObject(activityDates[activityDates.length - 1]);
    getMaxDay.add(parseInt(maxDiff, 10) * 2, "days");
    setMinLastDay(getMinLastDay);
    setMaxLastDay(getMaxLastDay);
    setMaxDay(getMaxDay);

    if (!values.surveyLastDay || !values.raffleDay) {
      setValues({
        ...values,
        surveyLastDay: getMinLastDay.unix * 1000,
        raffleDay: getMinDay.unix * 1000,
      });
    }
  }, [activePlans, activityDates, setValues, values]);

  useEffect(() => {
    if (values.raffleDay <= values.surveyLastDay) {
      setValues({
        ...values,
        raffleDay:
          new DateObject(values.surveyLastDay).add(1, "days").unix * 1000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.surveyLastDay]);

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="verificationId"
          >
            {t("new_activity_verification_types")}
          </label>
          {/* TODO: traduzir descrição */}
          <SelectField
            disabled={loading || !canChangeVerification}
            required={false}
            value="verificationId"
            values={values}
            setValues={setValues}
            options={activeVerifications.map((v) => ({
              value: v.verificationId,
              text: `${v.type} - ${v.description} ${
                v.price !== "0.00" ? `- ${formatValue(v.price)}` : ""
              }`,
            }))}
            onBlur={() => showMessage()}
            className="mt-0"
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="visitorGift"
          >
            {t("new_activity_visitors_gift")}
          </label>
          <SelectField
            disabled={loading}
            required={false}
            value="visitorGift"
            values={values}
            setValues={setValues}
            options={[
              { value: "YES", text: t("new_activity_yes") },
              { value: "NO", text: t("new_activity_no") },
            ]}
            className="mt-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="notificationOnConfirm"
          >
            {t("new_activity_notifY_survey_on_confirm")}
          </label>
          <SelectField
            disabled={loading}
            required={values.raffle === "YES"}
            value="notificationOnConfirm"
            values={values}
            setValues={setValues}
            options={[
              { value: "YES", text: t("new_activity_yes") },
              { value: "NO", text: t("new_activity_no") },
            ]}
            className="mt-0"
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="notificationOnActivityEnd"
          >
            {t("new_activity_notifY_survey_on_end")}
          </label>
          <SelectField
            disabled={loading}
            required={values.raffle === "YES"}
            value="notificationOnActivityEnd"
            values={values}
            setValues={setValues}
            options={[
              { value: "YES", text: t("new_activity_yes") },
              { value: "NO", text: t("new_activity_no") },
            ]}
            className="mt-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="raffle"
          >
            {t("new_activity_raffle")}
          </label>
          <SelectField
            disabled={loading}
            required={false}
            value="raffle"
            values={values}
            setValues={setValues}
            options={[
              { value: "YES", text: t("new_activity_yes") },
              { value: "NO", text: t("new_activity_no") },
            ]}
            className="mt-0"
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="raffleType"
          >
            {t("new_activity_raffle_type")}
          </label>
          <SelectField
            disabled={loading || !values["raffle"] || values["raffle"] === "NO"}
            required={false}
            value="raffleType"
            values={values}
            setValues={setValues}
            options={[
              {
                value: "SURVEY",
                text: t("new_activity_raffle_survey"),
              },
              { value: "ALL", text: t("new_activity_raffle_all") },
            ]}
            className="mt-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="surveyLastDay"
          >
            {t("new_activity_survey_last_day")}
          </label>
          <DatePicker
            disabled={loading}
            name="surveyLastDay"
            {...datePickerSurveyConfig}
            required={true}
            value={values.surveyLastDay}
            onChange={(v) =>
              setValues({ ...values, surveyLastDay: v.unix * 1000 })
            }
            minDate={minLastDay}
            maxDate={maxLastDay}
            className="mt-0"
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="raffleDay"
          >
            {t("new_activity_raffle_day")}
          </label>
          <DatePicker
            disabled={loading || !values["raffle"] || values["raffle"] === "NO"}
            name="raffleDay"
            {...datePickerSurveyConfig}
            required={true}
            value={
              !values["raffle"] || values["raffle"] === "NO"
                ? ""
                : typeof values.raffleDay === "string"
                ? parseInt(values.raffleDay, 10)
                : values.raffleDay
            }
            onChange={(v) => setValues({ ...values, raffleDay: v.unix * 1000 })}
            minDate={new DateObject(values.surveyLastDay).add(1, "days")}
            maxDate={maxDay}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        <label
          htmlFor="automaticRaffle"
          className="cursor-pointer flex flex-row justify-start items-center"
        >
          <div className="relative">
            <input
              disabled={
                loading || !values["raffle"] || values["raffle"] === "NO"
              }
              id="automaticRaffle"
              type="checkbox"
              className="sr-only"
              checked={
                !values["raffle"] || values["raffle"] === "NO"
                  ? ""
                  : values.raffleAutomatic
              }
              onChange={(e) =>
                setValues({ ...values, raffleAutomatic: e.target.checked })
              }
            />
            <div
              className={`w-6 h-6 inline-flex items-center justify-center border-primary-500 border-2 rounded-full ${
                (values["raffle"] || values["raffle"] === "YES") &&
                values.raffleAutomatic
                  ? "bg-primary-500"
                  : "bg-white"
              }`}
            >
              {(values["raffle"] || values["raffle"] === "YES") &&
                values.raffleAutomatic && (
                  <svg
                    className="fill-current w-8 h-8 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M7.629 14.571L3.146 10.088l-1.414 1.414 6.061 6.061 10.607-10.607-1.414-1.414L7.629 14.571z" />
                  </svg>
                )}
            </div>
          </div>
          <span className="-mt-3 ml-2">
            {t("new_activity_raffle_automatic")}
          </span>
          <span className="-mt-3 ml-2 text-sm">
            - {t("new_activity_raffle_automatic_text")}
          </span>
        </label>
      </div>

      <div className="w-full flex flex-row mt-8">
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-activity-back-button"
            text={t("new_activity_button_back")}
            disabled={loading}
            type="button"
            onClick={() => setStep(1)}
            size="w-2/3"
            color="text-white bg-slate-400"
          />
        </div>
        <div className="w-1/3 flex justify-center" />
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-activity-foward-button"
            text={t("new_activity_button_foward")}
            disabled={loading}
            type="submit"
            size="w-2/3"
          />
        </div>
      </div>
    </form>
  );
};

export default OpenActivityFormSurvey;
