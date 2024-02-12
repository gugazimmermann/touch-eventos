import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { getTime } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  auth,
  plans,
  verifications,
  event,
  fetchCitiesByState,
  fetchDataByCEP,
} from "../../services";
import useDatePicker from "../../hooks/useDatePicker";
import { STATESBR } from "../../constants/states";
import { formatValue } from "../../helpers/format";
import { maskCep } from "../../helpers/mask";
import { newEventValidate } from "../../helpers/form-validation";
import { Alert, Loading, Toast } from "../../components";
import { AdminTopNav } from "../../components/layout";
import {
  FormButton,
  InputField,
  InputFieldAutoComplete,
  SelectField,
} from "../../components/form";

const NewEvent = () => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const {
    datePickerConfig,
    validateEventDates,
    dateToTimestap,
    datesToString,
  } = useDatePicker({ locale: "pt-BR" });
  const [values, setValues] = useState({
    planId: "",
    verificationId: "",
    visitorGift: "",
    raffle: "",
    raffleType: "",
    name: "",
    dates: "",
    addressZipCode: "",
    addressState: "",
    addressCity: "",
    addressStreet: "",
    addressNumber: "",
    addressNeighborhood: "",
    addressComplement: "",
    addressLatitude: "",
    addressLongitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");
  const [activePlans, setActivePlans] = useState([]);
  const [activeVerifications, setActiveVerifications] = useState([]);
  const [cities, setCities] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [isToastVisible, setToastVisible] = useState(false);

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, verificationsData] = await Promise.all([
        await plans.getPlans(),
        await verifications.getVerifications(),
      ]);
      if (plansData?.error || verificationsData.error)
        setError(plansData?.error || verificationsData.error);
      else {
        setActivePlans(plansData);
        setActiveVerifications(verificationsData);
      }
    } catch (error) {
      setError("plans_errors");
    }
    setLoading(false);
  }, []);

  const showMessage = () => {
    if (values.planId) setToastVisible(true);
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

  const handleState = async (state) => {
    setLoading(true);
    const res = await fetchCitiesByState(state);
    setCities(res);
    setValues({
      ...values,
      ...{
        addressZipCode: "",
        addressCity: "",
        addressStreet: "",
        addressNumber: "",
        addressNeighborhood: "",
        addressComplement: "",
        addressLatitude: "",
        addressLongitude: "",
      },
    });
    setLoading(false);
  };

  const verifyDates = useCallback(() => {
    if (eventDates.length && activePlans.length) {
      const selectedPlan =
        values.planId || activePlans[activePlans.length - 1].planId;
      const { maxDays, maxDiff } = activePlans.find(
        (p) => p.planId === selectedPlan
      );
      const verify = validateEventDates(maxDays, maxDiff, eventDates);
      setInfo(verify);
      return verify;
    }
  }, [activePlans, eventDates, validateEventDates, values.planId]);

  const handleSubmit = async (e) => {
    setError("");
    setSuccess("");
    setInfo("");
    e.preventDefault();
    const validateValues = { ...values, dates: eventDates };
    if (!newEventValidate(validateValues, verifyDates, setError, t)) {
      return;
    }
    try {
      const eventId = uuidv4();
      const { userId } = await auth.handleGetCurrentUser();
      const data = {
        ...values,
        eventId,
        userId,
        startDate: `${dateToTimestap(eventDates[0])}`,
        endDate: `${dateToTimestap(eventDates[eventDates.length - 1])}`,
        city: values.addressCity,
        state: values.addressState,
        location: `${values.addressCity}+${values.addressState}`,
        createdAt: `${getTime(new Date())}`,
        active: 0,
        dates: datesToString(eventDates),
      };

      setLoading(true);
      const res = await event.saveEvent(data);
      if (res?.error) setError(res.error);
      else navigate(`/evento/${eventId}`);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    verifyDates();
  }, [activePlans, eventDates, values.planId, verifyDates]);

  useEffect(() => {
    getData();
  }, [getData]);

  const RenderPlanToast = () => {
    const selectedPlan = activePlans.find((p) => p.planId === values.planId);
    return (
      <Toast
        message={selectedPlan.description}
        isVisible={isToastVisible}
        onClose={() => setToastVisible(false)}
      />
    );
  };

  return (
    <section className="w-full">
      <AdminTopNav title={t("new_event_title")} />
      <div className="flex flex-col justify-center mx-auto bg-white p-4 rounded-lg">
        {loading && <Loading />}
        {error && <Alert message={error} type="danger" />}
        {success && <Alert message={success} type="success" />}
        {info && <Alert message={info} type="info" />}
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="grid grid-cols-3 gap-4">
            <SelectField
              disabled={loading}
              required={false}
              placeholder={t("new_event_plans")}
              value="planId"
              values={values}
              setValues={setValues}
              options={activePlans.map((p) => ({
                value: p.planId,
                text: `${p.type} - ${p.duration} - ${formatValue(p.price)}`,
              }))}
              onBlur={() => showMessage()}
            />
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
              disabled={
                loading || !values["raffle"] || values["raffle"] === "NO"
              }
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
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_event_name")}
              value="name"
              values={values}
              setValues={setValues}
            />
            <DatePicker
              {...datePickerConfig}
              value={eventDates}
              onChange={setEventDates}
              minDate={new Date()}
              placeholder={t("new_event_dates")}
              plugins={[<DatePanel header={t("new_event_dates")} />]}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_event_address_zipcode")}
              value="addressZipCode"
              values={values}
              setValues={setValues}
              onBlur={(e) => handleCep(e.target.value)}
              mask={maskCep}
            />
            <SelectField
              disabled={loading}
              required={false}
              placeholder={t("new_event_address_state")}
              value="addressState"
              values={values}
              setValues={setValues}
              options={STATESBR}
              // onBlur={(e) => handleState(e.target.value)}
            />
            <InputFieldAutoComplete
              disabled={loading}
              required={false}
              placeholder={t("new_event_address_city")}
              value="addressCity"
              values={values}
              setValues={setValues}
              suggestions={cities}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_event_address_street")}
              value="addressStreet"
              values={values}
              setValues={setValues}
            />
            <InputField
              disabled={loading}
              placeholder={t("new_event_address_number")}
              value="addressNumber"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading}
              required={false}
              placeholder={t("new_event_address_neighborhood")}
              value="addressNeighborhood"
              values={values}
              setValues={setValues}
            />
            <InputField
              disabled={loading}
              placeholder={t("new_event_address_complement")}
              value="addressComplement"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="flex justify-center mt-4">
            <FormButton
              testid="new-event-button"
              text={t("new_event_submit")}
              disabled={loading}
              type="submit"
            />
          </div>
        </form>
      </div>
      {isToastVisible && values.planId && RenderPlanToast()}
    </section>
  );
};

export default NewEvent;
