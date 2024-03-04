import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactFlagsSelect from "react-flags-select";
import { useActivities } from "../../../context/ActivitiesContext";
import {
  // fetchCitiesByState,
  fetchDataByCEP,
  fetchDataByCNPJ,
  fetchCoordinates,
  account,
  auth,
} from "../../../services";
import { STATESBR } from "../../../constants/states";
// import TIMEZONESBR from "../../../constants/timezones/timezones-br";
import usePhoneCode from "../../../hooks/usePhoneCode";
import { maskCep, maskCPF, maskCNPJ, maskPhone } from "../../../helpers/mask";
import { validateCode } from "../../../helpers/validate";
import { accountInfoValidate } from "../../../helpers/form-validation";
import { Alert, Loading } from "../../../components";
import {
  FormButton,
  InputField,
  InputFieldAutoComplete,
  SelectField,
} from "../../../components/form";
import { formatDate } from "../../../helpers/format";

const AccountInfo = ({ data, fetchData, reload, confirmEmail }) => {
  const { t } = useTranslation("account");
  const { dispatch } = useActivities();
  const { PhoneCodeSelect } = usePhoneCode();
  const [values, setValues] = useState({
    userId: "",
    name: "",
    documentType: "",
    document: "",
    email: "",
    phoneCode: "",
    phone: "",
    addressCountry: "BR",
    addressZipCode: "",
    addressState: "",
    addressCity: "",
    addressStreet: "",
    addressNumber: "",
    addressNeighborhood: "",
    addressComplement: "",
    addressTimezone: "America/Sao_Paulo",
    addressLatitude: "",
    addressLongitude: "",
    createdAt: "",
  });
  const [codeValue, setCodeValue] = useState({ code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");
  // const [cities, setCities] = useState([]);

  const handleDocument = async (document) => {
    if (values.documentType !== "CNPJ") return;
    setLoading(true);
    let data = {
      name: "",
      email: "",
      phone: "",
      addressCountry: "",
      addressZipCode: "",
      addressState: "",
      addressCity: "",
      addressStreet: "",
      addressNumber: "",
      addressNeighborhood: "",
      addressComplement: "",
      addressLatitude: "",
      addressLongitude: "",
    };
    data = await fetchDataByCNPJ(document, data);
    setValues({ ...values, ...data });
    setLoading(false);
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
  //   const res = await fetchCitiesByState(state);
  //   setCities(res);
  //   setValues({
  //     ...values,
  //     ...{
  //       addressZipCode: "",
  //       addressCity: "",
  //       addressStreet: "",
  //       addressNumber: "",
  //       addressNeighborhood: "",
  //       addressComplement: "",
  //       addressLatitude: "",
  //       addressLongitude: "",
  //     },
  //   });
  //   setLoading(false);
  // };

  const handleUpdateCoords = async (data) => {
    const clonedData = { ...data };
    if (!clonedData.addressLatitude || !clonedData.addressLongitude) {
      const coords = await fetchCoordinates(
        clonedData.addressStreet,
        clonedData.addressNumber,
        clonedData.addressCity,
        clonedData.addressState
      );
      if (coords) {
        clonedData.addressLatitude = coords.lat;
        clonedData.addressLongitude = coords.lon;
      }
    }
    return clonedData;
  };

  const handleSubmit = async (e) => {
    setError("");
    setSuccess("");
    e.preventDefault();
    let userData = { ...values, phoneCode: values.phoneCode || "+55" };
    if (!accountInfoValidate(userData, setError, t)) return;
    setLoading(true);
    userData = await handleUpdateCoords(userData);
    try {
      const currentEmail = await auth.handleFetchUserEmail();
      const changeEmail = currentEmail.email !== userData.email;
      const res = await account.updateCurrentUser({
        ...userData,
        stripeCustomerId: data.stripeCustomerId,
        active: changeEmail ? 0 : 1,
      });
      if (res.error) {
        setError(t("account_update_error"));
      } else {
        dispatch({ type: "USER", payload: { user: res } });
        if (changeEmail) await auth.handleUpdateUserEmail(res.email);
        fetchData(true);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await auth.handleConfirmUserEmailSendCode();
      setSuccess(t("account_update_resend_code_success"));
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleSubmitValidate = async (e) => {
    setError("");
    setSuccess("");
    e.preventDefault();
    if (!validateCode(codeValue.code)) {
      setError(t("account_update_code_invalid"));
      return;
    }
    setLoading(true);
    try {
      await auth.handleConfirmUserEmail(codeValue.code);
      const res = await account.updateCurrentUser({
        ...values,
        active: 1,
      });
      if (res.error) setError(t("account_update_error"));
      fetchData(true);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (reload) setSuccess(t("account_update_success"));
    if (confirmEmail) setInfo(t("account_update_info"));
    if (data) {
      setValues({
        ...values,
        userId: data.userId,
        name: data.name,
        documentType: data.documentType,
        document: data.document,
        email: data.email,
        phoneCode: data.phoneCode,
        phone: data.phone,
        addressCountry: data.addressCountry || "BR",
        addressZipCode: data.addressZipCode,
        addressState: data.addressState,
        addressCity: data.addressCity,
        addressStreet: data.addressStreet,
        addressNumber: data.addressNumber,
        addressNeighborhood: data.addressNeighborhood,
        addressComplement: data.addressComplement,
        addressTimezone: data.addressTimezone || "America/Sao_Paulo",
        addressLatitude: data.addressLatitude,
        addressLongitude: data.addressLongitude,
        createdAt: data.createdAt,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, reload, confirmEmail]);

  return (
    <>
      {loading && <Loading />}
      {error && <Alert message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}
      {info && <Alert message={info} type="info" />}
      {!confirmEmail ? (
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading || confirmEmail}
              required={true}
              autocomplete="name"
              placeholder={t("account_name")}
              value="name"
              values={values}
              setValues={setValues}
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                disabled={loading || confirmEmail}
                required={true}
                placeholder={t("account_document_type")}
                value="documentType"
                values={values}
                setValues={setValues}
                options={[{ value: "CPF" }, { value: "CNPJ" }]}
              />
              <InputField
                disabled={loading || confirmEmail}
                required={true}
                autocomplete="document"
                placeholder={t("account_document")}
                value="document"
                values={values}
                setValues={setValues}
                mask={
                  values["documentType"] === "CPF"
                    ? maskCPF
                    : values["documentType"] === "CNPJ"
                    ? maskCNPJ
                    : undefined
                }
                onBlur={(e) => handleDocument(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading || confirmEmail}
              required={true}
              autocomplete="email"
              type="email"
              placeholder={t("account_email")}
              value="email"
              values={values}
              setValues={setValues}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="mt-4">
                <PhoneCodeSelect
                  disabled={loading || confirmEmail}
                  value="phoneCode"
                  values={values}
                  setValues={setValues}
                />
              </div>
              <InputField
                disabled={loading || confirmEmail}
                required={false}
                autocomplete="phone"
                placeholder={t("account_phone")}
                value="phone"
                values={values}
                setValues={setValues}
                mask={maskPhone}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="mt-4">
              <ReactFlagsSelect
                selected={values["addressCountry"]}
                onSelect={(code) =>
                  setValues({ ...values, addressCountry: code })
                }
                searchable
                placeholder={t("account_address_country")}
                searchPlaceholder={t("account_address_country")}
                className="countrySelect"
                disabled
              />
            </div>
            <InputField
              disabled={loading || confirmEmail}
              required={true}
              placeholder={t("account_address_zipcode")}
              value="addressZipCode"
              values={values}
              setValues={setValues}
              onBlur={(e) => handleCep(e.target.value)}
              mask={maskCep}
            />
            <SelectField
              disabled={loading || confirmEmail}
              required={true}
              placeholder={t("account_address_state")}
              value="addressState"
              values={values}
              setValues={setValues}
              options={STATESBR}
              // onBlur={(e) => handleState(e.target.value)}
            />
            <InputField
              disabled={loading || confirmEmail}
              required={true}
              placeholder={t("account_address_city")}
              value="addressCity"
              values={values}
              setValues={setValues}
            />
            {/* <InputFieldAutoComplete
              disabled={loading || confirmEmail}
              required={true}
              placeholder={t("account_address_city")}
              value="addressCity"
              values={values}
              setValues={setValues}
              suggestions={cities} 
            />*/}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading || confirmEmail}
              required={true}
              placeholder={t("account_address_street")}
              value="addressStreet"
              values={values}
              setValues={setValues}
            />
            <InputField
              disabled={loading || confirmEmail}
              placeholder={t("account_address_number")}
              value="addressNumber"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={loading || confirmEmail}
              required={false}
              placeholder={t("account_address_neighborhood")}
              value="addressNeighborhood"
              values={values}
              setValues={setValues}
            />
            <InputField
              disabled={loading || confirmEmail}
              placeholder={t("account_address_complement")}
              value="addressComplement"
              values={values}
              setValues={setValues}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* <SelectField
              disabled={loading || confirmEmail}
              required={true}
              placeholder={t("account_address_timezone")}
              value="addressTimezone"
              values={values}
              setValues={setValues}
              options={TIMEZONESBR}
            /> */}
            <InputField
              disabled={true}
              required={false}
              placeholder={`${t("account_created_at")} ${formatDate(
                data?.createdAt,
                {
                  time: false,
                }
              )}`}
              setValues={setValues}
            />
          </div>
          <div className="flex justify-center mt-4">
            <FormButton
              testid="account-update-button"
              text={t("account_update")}
              disabled={loading || confirmEmail}
              type="submit"
            />
          </div>
        </form>
      ) : (
        <form onSubmit={(e) => handleSubmitValidate(e)}>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              disabled={true}
              required={false}
              autocomplete="email"
              type="email"
              placeholder={t("account_email")}
              value="email"
              values={values}
              setValues={setValues}
            />
            <InputField
              disabled={loading}
              required={false}
              type="test"
              placeholder={t("account_update_code")}
              value="code"
              values={codeValue}
              setValues={setCodeValue}
            />
          </div>
          <div className="flex justify-around mt-4 gap-4">
            <FormButton
              size="w-1/3"
              testid="account-update-resend-button"
              text={t("account_update_resend_code")}
              disabled={loading}
              type="button"
              onClick={() => handleResendCode()}
            />
            <FormButton
              size="w-1/3"
              testid="account-update-validate-button"
              text={t("account_update_validate")}
              disabled={loading}
              type="submit"
            />
          </div>
        </form>
      )}
    </>
  );
};

export default AccountInfo;
