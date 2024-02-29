import { validateCep } from "../validate";

export const stepOne = (values, verifyDates, setError, t) => {
  const showError = (message) => {
    setError(t(message));
    return false;
  };

  const validateRequired = (value, errorMessage) => {
    if (!value) return showError(errorMessage);
    return true;
  };

  const validateLength = (value, errorMessage) => {
    if (!value.length) return showError(errorMessage);
    return true;
  };

  if (!validateRequired(values.planId, "new_activity_plans_required"))
    return false;
  if (!validateLength(values.dates, "new_activity_dates_required"))
    return false;
  if (verifyDates()) return false;
  if (!validateRequired(values.name, "new_activity_name_required"))
    return false;
  if (!validateCep(values.addressZipCode))
    return showError("account_address_zipcode_invalid");
  if (
    !validateRequired(
      values.addressState,
      "new_activity_address_state_required"
    )
  )
    return false;
  if (
    !validateRequired(values.addressCity, "new_activity_address_city_required")
  )
    return false;
  if (
    !validateRequired(
      values.addressStreet,
      "new_activity_address_street_required"
    )
  )
    return false;
  if (
    !validateRequired(
      values.addressNeighborhood,
      "new_activity_address_neighborhood_required"
    )
  )
    return false;
  return true;
};

export const stepTwo = (values, setError, t) => {
  const showError = (message) => {
    setError(t(message));
    return false;
  };

  const validateRequired = (value, errorMessage) => {
    if (!value) return showError(errorMessage);
    return true;
  };

  if (
    !validateRequired(
      values.verificationId,
      "new_activity_verification_types_required"
    )
  )
    return false;
  if (
    !validateRequired(values.visitorGift, "new_activity_visitors_gift_required")
  )
    return false;
  if (
    !validateRequired(
      values.notificationOnConfirm,
      "new_activity_notifY_survey_on_confirm_required"
    )
  )
    return false;
  if (
    !validateRequired(
      values.notificationOnActivityEnd,
      "new_activity_notifY_survey_on_end_required"
    )
  )
    return false;
  if (!validateRequired(values.raffle, "new_activity_raffle_required"))
    return false;
  if (values.raffle && values.raffle === "YES") {
    if (
      !validateRequired(values.raffleType, "new_activity_raffle_type_required")
    )
      return false;
  }
  return true;
};
