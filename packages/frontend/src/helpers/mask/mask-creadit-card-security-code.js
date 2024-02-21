const maskCreditcardSecurityCode = (value) => {
  return value
    .substring(0, 4)
    .replace(/\D+/g, "");
};

export default maskCreditcardSecurityCode;
