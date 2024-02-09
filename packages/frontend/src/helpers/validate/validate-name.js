const validateName = (name) => {
  if (!name || name.length < 3) return false;
  return true;
};

export default validateName;
