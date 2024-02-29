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
  // InputFieldAutoComplete,
  SelectField,
} from "../../../components/form";
import { CircleCheckFilled, Search, XCircle } from "../../../icons";

const NewActivityFormActivity = ({
  activePlans,
  loading,
  setLoading,
  values,
  setValues,
  activityDates,
  setActivityDates,
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
  }, [activePlans, activityDates, values.planId, verifyDates]);

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
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="planId"
          >
           {t("new_activity_plans")}
          </label>
          <SelectField
            className="mt-0"
            disabled={loading || state.subscription?.planId}
            required={true}
            value="planId"
            values={values}
            setValues={setValues}
            options={activePlans.map((p) => ({
              value: p.planId,
              text: `${p.type} - ${p.duration} - ${formatValue(p.price)}`,
            }))}
            onBlur={() => showMessage()}
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="activityDates"
          >
           {t("new_activity_dates")}
          </label>
          <DatePicker
            {...datePickerConfig}
            name="activityDates"
            required={true}
            value={activityDates}
            onChange={setActivityDates}
            minDate={startOfDay(new Date())}
            plugins={[<DatePanel header={t("new_activity_dates_panel")} />]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="name"
          >
            {t("new_activity_name")}
          </label>
          <InputField
            disabled={loading}
            required={true}
            value="name"
            values={values}
            setValues={setValues}
            className="mt-0"
          />
        </div>
        <div className="flex flex-wrap items-stretch">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="slug"
          >
             {t("new_activity_friendly_url")}
          </label>
          <input
            className="block flex-auto px-4 py-2 text-text-700 placeholder-text-500 bg-white border-y border-l rounded-l-lg"
            disabled={loading}
            required={true}
            name="slug"
            id="slug"
            type="text"
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
            testid="new-activity-verify-slug-button"
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
            <span>{t("new_activity_friendly_url_verify")}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressCountry"
          >
            {t("new_activity_address_country")}
          </label>
          <ReactFlagsSelect
            name="addressCountry"
            selected={values["addressCountry"]}
            onSelect={(code) => setValues({ ...values, addressCountry: code })}
            searchable
            searchPlaceholder={t("new_activity_address_country")}
            className="countrySelect"
            disabled
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressZipCode"
          >
            {t("new_activity_address_zipcode")}
          </label>
          <InputField
            disabled={loading}
            required={true}
            value="addressZipCode"
            values={values}
            setValues={setValues}
            onBlur={(e) => handleCep(e.target.value)}
            mask={maskCep}
            className="mt-0"
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressState"
          >
           {t("new_activity_address_state")}
          </label>
          <SelectField
            disabled={loading}
            required={true}
            value="addressState"
            values={values}
            setValues={setValues}
            options={STATESBR}
            className="mt-0"
            // onBlur={(e) => handleState(e.target.value)}
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressCity"
          >
            {t("new_activity_address_city")}
          </label>
          <InputField
            disabled={loading}
            required={true}
            value="addressCity"
            values={values}
            setValues={setValues}
            className="mt-0"
          />
        </div>
        {/* <InputFieldAutoComplete
          disabled={loading}
          required={true}
          placeholder={t("new_activity_address_city")}
          value="addressCity"
          values={values}
          setValues={setValues}
          // suggestions={cities}
        /> */}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressStreet"
          >
            {t("new_activity_address_street")}
          </label>
          <InputField
            disabled={loading}
            required={true}
            value="addressStreet"
            values={values}
            setValues={setValues}
            className="mt-0"
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressNumber"
          >
            {t("new_activity_address_number")}
          </label>
          <InputField
            disabled={loading}
            value="addressNumber"
            values={values}
            setValues={setValues}
            className="mt-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressNeighborhood"
          >
            {t("new_activity_address_neighborhood")}
          </label>
          <InputField
            disabled={loading}
            required={true}
            value="addressNeighborhood"
            values={values}
            setValues={setValues}
            className="mt-0"
          />
        </div>
        <div className="flex flex-col justify-start">
          <label
            className="pl-4 text-left w-full tracking-wide"
            htmlFor="addressComplement"
          >
            {t("new_activity_address_complement")}
          </label>
          <InputField
            disabled={loading}
            value="addressComplement"
            values={values}
            setValues={setValues}
            className="mt-0"
          />
        </div>
      </div>
      
      <div className="w-full flex flex-row mt-8">
        <div className="w-1/3 flex justify-center">
          <FormButton
            testid="new-activity-clear-button"
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

export default NewActivityFormActivity;
