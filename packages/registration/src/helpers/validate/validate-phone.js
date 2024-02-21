const validatePhone = (phone) => {
  if (!phone || phone.length < 10) return false;
  return true;
};

export default validatePhone;
