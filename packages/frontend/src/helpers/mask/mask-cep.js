const maskCep = (value) => {
  if (!value) return "";
  return value
    .replace(/\D+/g, "")
    .replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2-$3")
    .slice(0, 10);
};

export default maskCep;
