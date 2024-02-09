const validateCep = (cep) => {
  if (!cep || cep.length < 8) return false;
  return true;
};

export default validateCep;
