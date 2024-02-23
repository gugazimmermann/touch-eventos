import { useTranslation } from "react-i18next";
import { formatValue } from "../../../helpers/format";
import { FormButton, InputField, SelectField } from "../../../components/form";

const NewActivityFormSurvey = ({
  activeVerifications,
  loading,
  values,
  setValues,
  onSubmit,
  setStep,
  showToast,
}) => {
  const { t } = useTranslation("new_activity");

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

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <div className="grid grid-cols-2 gap-4">
        {/* TODO: traduzir descrição */}
        <SelectField
          disabled={loading}
          required={false}
          placeholder={t("new_activity_verification_types")}
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
        />
        <SelectField
          disabled={loading}
          required={false}
          placeholder={t("new_activity_visitors_gift")}
          value="visitorGift"
          values={values}
          setValues={setValues}
          options={[
            { value: "YES", text: t("new_activity_yes") },
            { value: "NO", text: t("new_activity_no") },
          ]}
        />
      </div>
      {values.visitorGift === "YES" && (
        <>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_activity_visitors_gift_description_ptbr")}
              value="visitorGiftTextPTBR"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_activity_visitors_gift_description_en")}
              value="visitorGiftTextEN"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_activity_visitors_gift_description_es")}
              value="visitorGiftTextES"
              values={values}
              setValues={setValues}
            />
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          disabled={loading}
          required={false}
          placeholder={t("new_activity_raffle")}
          value="raffle"
          values={values}
          setValues={setValues}
          options={[
            { value: "YES", text: t("new_activity_yes") },
            { value: "NO", text: t("new_activity_no") },
          ]}
        />
        <SelectField
          disabled={loading || !values["raffle"] || values["raffle"] === "NO"}
          required={false}
          placeholder={t("new_activity_raffle_type")}
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
        />
      </div>
      {values.raffle === "YES" && (
        <>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_activity_raffle_description_ptbr")}
              value="raffleTextPTBR"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_activity_raffle_description_en")}
              value="raffleTextEN"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_activity_raffle_description_es")}
              value="raffleTextES"
              values={values}
              setValues={setValues}
            />
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          disabled={loading}
          required={values.raffle === "YES"}
          placeholder={t("new_activity_notifY_survey_on_confirm")}
          value="notificationOnConfirm"
          values={values}
          setValues={setValues}
          options={[
            {
              value: "YES",
              text: t("new_activity_notifY_survey_on_confirm_yes"),
            },
            {
              value: "NO",
              text: t("new_activity_notifY_survey_on_confirm_no"),
            },
          ]}
        />
        <SelectField
          disabled={loading}
          required={values.raffle === "YES"}
          placeholder={t("new_activity_notifY_survey_on_end")}
          value="notificationOnEventEnd"
          values={values}
          setValues={setValues}
          options={[
            {
              value: "YES",
              text: t("new_activity_notifY_survey_on_end_yes"),
            },
            {
              value: "NO",
              text: t("new_activity_notifY_survey_on_end_no"),
            },
          ]}
        />
      </div>
      <div className="w-full flex flex-row mt-8">
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-event-back-button"
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
            testid="new-event-foward-button"
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

export default NewActivityFormSurvey;
