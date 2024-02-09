import { cpf } from 'cpf-cnpj-validator';

const validateCPF = (document) => {
    if (!document) return false;
    return cpf.isValid(document.replace(/\D+/g, ''));
}

export default validateCPF;
