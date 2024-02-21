const maskCreditcardExpirationDate = (value) => {
  return value
    .substring(0, 5)
    .replace(/\D+/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2");
};

export default maskCreditcardExpirationDate;
