const formatValue = (value) => {
  const floatValue = parseFloat(value);
  return floatValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export default formatValue;
