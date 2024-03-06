const validateCode = (code) => {
  if (!code || code.length < 6) return false;
  return true;
};

export default validateCode;
