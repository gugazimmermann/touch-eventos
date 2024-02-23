// import { useEffect, useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { startOfDay } from "date-fns";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import * as slugfy from "slugify";
import ReactFlagsSelect from "react-flags-select";
import { useActivities } from "../../../context/ActivitiesContext";
// import { fetchCitiesByState, fetchDataByCEP } from "../../../services";
import { fetchDataByCEP } from "../../../services";
import useDatePicker from "../../../hooks/useDatePicker";
import { STATESBR } from "../../../constants/states";
import { formatValue } from "../../../helpers/format";
import { maskCep } from "../../../helpers/mask";
import {
  FormButton,
  InputField,
  InputFieldAutoComplete,
  SelectField,
} from "../../../components/form";
import { CircleCheckFilled, Search, XCircle } from "../../../icons";

const NewActivityFormEvent = ({
  activePlans,
  loading,
  setLoading,
  values,
  setValues,
  eventDates,
  setEventDates,
  verifyDates,
  showToast,
  onSubmit,
  onResetForm,
  handleVerifySlug,
  setSlugAvailable,
  slugAvailable,
}) => {
  const { state } = useActivities();
  const { t } = useTranslation("new_activity");
  const { datePickerConfig } = useDatePicker({ locale: "pt-BR" });
  // const [cities, setCities] = useState([]);

  const showMessage = () => {
    if (values.planId) {
      const selectedPlan = activePlans.find((p) => p.planId === values.planId);
      // TODO: traduzir descrição do plano
      showToast(selectedPlan.description);
    }
  };

  const handleCep = async (cep) => {
    setLoading(true);
    let data = {
      addressState: "",
      addressCity: "",
      addressStreet: "",
      addressNumber: "",
      addressNeighborhood: "",
      addressComplement: "",
      addressLatitude: "",
      addressLongitude: "",
    };
    data = await fetchDataByCEP(cep, data);
    setValues({ ...values, ...data });
    setLoading(false);
  };

  // const handleState = async (state) => {
  //   setLoading(true);
  //   try {
  //     const res = await fetchCitiesByState(state);
  //     setCities(res);
  //     setValues({
  //       ...values,
  //       ...{
  //         addressZipCode: "",
  //         addressCity: "",
  //         addressStreet: "",
  //         addressNumber: "",
  //         addressNeighborhood: "",
  //         addressComplement: "",
  //         addressLatitude: "",
  //         addressLongitude: "",
  //       },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   setLoading(false);
  // };

  useEffect(() => {
    verifyDates();
  }, [activePlans, eventDates, values.planId, verifyDates]);

  useEffect(() => {
    setValues({
      ...values,
      slug: slugfy(values.name, {
        lower: true,
        locale: "pt",
      }),
    });
    setSlugAvailable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name]);

  useEffect(() => {
    if (state.subscription?.planId)
      setValues({ ...values, planId: state.subscription.planId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValues, state.subscription]);

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          disabled={loading || state.subscription?.planId}
          required={true}
          placeholder={t("new_activity_plans")}
          value="planId"
          values={values}
          setValues={setValues}
          options={activePlans.map((p) => ({
            value: p.planId,
            text: `${p.type} - ${p.duration} - ${formatValue(p.price)}`,
          }))}
          onBlur={() => showMessage()}
        />
        <DatePicker
          {...datePickerConfig}
          required={true}
          value={eventDates}
          onChange={setEventDates}
          minDate={startOfDay(new Date())}
          placeholder={t("new_activity_dates")}
          plugins={[<DatePanel header={t("new_activity_dates")} />]}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField
          disabled={loading}
          required={true}
          placeholder={t("new_activity_name")}
          value="name"
          values={values}
          setValues={setValues}
        />
        <div className="mt-4 flex flex-wrap items-stretch">
          <input
            className="block flex-auto px-4 py-2 text-text-700 placeholder-text-500 bg-white border-y border-l rounded-l-lg"
            disabled={loading}
            required={true}
            name="slug"
            id="slug"
            type="text"
            placeholder={t("URL Amigável")}
            value={values["slug"]}
            onChange={(e) => {
              setValues({ ...values, slug: e.target.value });
              setSlugAvailable();
            }}
          />
          <button
            className={`flex flex-row justify-center items-center px-2 py-1 border rounded-r-lg ${
              slugAvailable
                ? "text-text-100 bg-success-500 border-success-500"
                : slugAvailable === false
                ? "text-text-100 bg-danger-500 border-danger-500"
                : "text-text-700 bg-text-200"
            }`}
            type="button"
            testid="new-event-verify-slug-button"
            disabled={loading}
            onClick={() => handleVerifySlug(values["slug"])}
          >
            <div className="pr-2">
              {slugAvailable ? (
                <CircleCheckFilled />
              ) : slugAvailable === false ? (
                <XCircle />
              ) : (
                <Search />
              )}
            </div>
            <span>Verificar</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <ReactFlagsSelect
          selected={values["addressCountry"]}
          onSelect={(code) => setValues({ ...values, addressCountry: code })}
          searchable
          placeholder={t("account_address_country")}
          searchPlaceholder={t("account_address_country")}
          className="countrySelect"
          disabled
        />
        <InputField
          disabled={loading}
          required={true}
          placeholder={t("new_activity_address_zipcode")}
          value="addressZipCode"
          values={values}
          setValues={setValues}
          onBlur={(e) => handleCep(e.target.value)}
          mask={maskCep}
        />
        <SelectField
          disabled={loading}
          required={true}
          placeholder={t("new_activity_address_state")}
          value="addressState"
          values={values}
          setValues={setValues}
          options={STATESBR}
          // onBlur={(e) => handleState(e.target.value)}
        />
        <InputFieldAutoComplete
          disabled={loading}
          required={true}
          placeholder={t("new_activity_address_city")}
          value="addressCity"
          values={values}
          setValues={setValues}
          // suggestions={cities}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField
          disabled={loading}
          required={true}
          placeholder={t("new_activity_address_street")}
          value="addressStreet"
          values={values}
          setValues={setValues}
        />
        <InputField
          disabled={loading}
          placeholder={t("new_activity_address_number")}
          value="addressNumber"
          values={values}
          setValues={setValues}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField
          disabled={loading}
          required={true}
          placeholder={t("new_activity_address_neighborhood")}
          value="addressNeighborhood"
          values={values}
          setValues={setValues}
        />
        <InputField
          disabled={loading}
          placeholder={t("new_activity_address_complement")}
          value="addressComplement"
          values={values}
          setValues={setValues}
        />
      </div>
      <div className="w-full flex flex-row mt-8">
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-event-clear-button"
            text={t("new_activity_button_reset")}
            disabled={loading}
            type="button"
            onClick={() => onResetForm()}
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

export default NewActivityFormEvent;
