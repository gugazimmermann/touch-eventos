const maskCreditCardNumer = (value) => {
  let onlyDigits = value.replace(/\D+/g, "");
  if (onlyDigits.length > 16) {
    onlyDigits = onlyDigits.slice(0, 16);
  }
  if (onlyDigits.length === 15) {
    return onlyDigits.replace(/^(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
  } else {
    return onlyDigits.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
  }
};

export default maskCreditCardNumer;
