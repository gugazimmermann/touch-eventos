import { useTranslation } from "react-i18next";
import { formatValue } from "../../../helpers/format";
import { FormButton, InputField, SelectField } from "../../../components/form";

const NewEventFormSurvey = ({
  activeVerifications,
  loading,
  values,
  setValues,
  onSubmit,
  setStep,
  showToast,
}) => {
  const { t } = useTranslation("admin");

  const showMessage = () => {
    if (values.verificationId) {
      const selectedVerification = activeVerifications.find(
        (v) => v.verificationId === values.verificationId
      );
      if (selectedVerification.price !== "0.00") {
        showToast(
          `Valor de ${formatValue(
            selectedVerification.price
          )} por envio, cobrado ao final de cada dia de evento.`
        );
      }
    }
  };

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          disabled={loading}
          required={false}
          placeholder={t("new_event_verification_types")}
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
          placeholder={t("new_event_visitors_gift")}
          value="visitorGift"
          values={values}
          setValues={setValues}
          options={[
            { value: "YES", text: t("new_event_yes") },
            { value: "NO", text: t("new_event_no") },
          ]}
        />
      </div>
      {values.visitorGift === "YES" && (
        <>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={"Descrição do Brinde em Português"}
              value="visitorGiftTextPTBR"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={"Descrição do Brinde em Inglês"}
              value="visitorGiftTextEN"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={"Descrição do Brinde em Espanhol"}
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
          placeholder={t("new_event_raffle")}
          value="raffle"
          values={values}
          setValues={setValues}
          options={[
            { value: "YES", text: t("new_event_yes") },
            { value: "NO", text: t("new_event_no") },
          ]}
        />
        <SelectField
          disabled={loading || !values["raffle"] || values["raffle"] === "NO"}
          required={false}
          placeholder={t("new_event_raffle_type")}
          value="raffleType"
          values={values}
          setValues={setValues}
          options={[
            {
              value: "SURVEY",
              text: t("new_event_raffle_survey"),
            },
            { value: "ALL", text: t("new_event_raffle_all") },
          ]}
        />
      </div>
      {values.raffle === "YES" && (
        <>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={"Descrição do Sorteio em Português"}
              value="raffleTextPTBR"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={"Descrição do Sorteio em Inglês"}
              value="raffleTextEN"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={"Descrição do Sorteio em Espanhol"}
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
          placeholder={t("Notificar pesquisa na confirmação *")}
          value="notificationOnConfirm"
          values={values}
          setValues={setValues}
          options={[
            {
              value: "YES",
              text: "Sim - Notificar pesquisa na confirmação",
            },
            {
              value: "NO",
              text: "Não - Não notificar pesquisa na confirmação",
            },
          ]}
        />
        <SelectField
          disabled={loading}
          required={values.raffle === "YES"}
          placeholder={t("Notificar pesquisa ao final do evento *")}
          value="notificationOnEventEnd"
          values={values}
          setValues={setValues}
          options={[
            {
              value: "YES",
              text: "Sim - Notificar pesquisa ao final do evento",
            },
            {
              value: "NO",
              text: "Não - Não notificar pesquisa ao final do evento",
            },
          ]}
        />
      </div>
      <div className="w-full flex flex-row mt-8">
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-event-back-button"
            text={"Voltar"}
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
            text={"Avançar"}
            disabled={loading}
            type="submit"
            size="w-2/3"
          />
        </div>
      </div>
    </form>
  );
};

export default NewEventFormSurvey;
