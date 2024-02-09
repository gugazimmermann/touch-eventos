import { cnpj } from "cpf-cnpj-validator";

const validateCNPJ = (document) => {
  if (!document) return false;
  return cnpj.isValid(document.replace(/\D+/g, ""));
};

export default validateCNPJ;
