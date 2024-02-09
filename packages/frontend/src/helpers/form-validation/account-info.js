import {
  validateCNPJ,
  validateCPF,
  validateEmail,
  validateName,
  validatePhone,
  validateCep,
} from "../../helpers/validate";

const accountInfoValidate = (values, setError, t) => {
  const showError = (message) => {
    setError(t(message));
    return false;
  };

  const validateRequired = (value, errorMessage) => {
    if (!value) return showError(errorMessage);
    return true;
  };

  const validateDocument = (documentType, document) => {
    const validator = documentType === "CPF" ? validateCPF : validateCNPJ;
    if (!validator(document)) return showError("account_document_invalid");
    return true;
  };

  if (!validateName(values.name)) return showError("account_name_invalid");
  if (!validateRequired(values.documentType, "account_document_type_required"))
    return false;
  if (!validateDocument(values.documentType, values.document)) return false;
  if (!validateEmail(values.email)) return showError("account_email_invalid");
  if (!validateRequired(values.phoneCode, "account_phone_code_required"))
    return false;
  if (!validatePhone(values.phone)) return showError("account_phone_invalid");
  if (!validateCep(values.addressZipCode))
    return showError("account_address_zipcode_invalid");
  if (!validateRequired(values.addressState, "account_address_state_required"))
    return false;
  if (!validateRequired(values.addressCity, "account_address_city_required"))
    return false;
  if (
    !validateRequired(values.addressStreet, "account_address_street_required")
  )
    return false;
  if (
    !validateRequired(
      values.addressNeighborhood,
      "account_address_neighborhood_required"
    )
  )
    return false;

  return true;
};

export default accountInfoValidate;
