import { maskCapitalize } from "../helpers/mask";

const fetchCitiesByState = async (state) => {
  let cities = [];
  const response = await fetch(
    `https://brasilapi.com.br/api/ibge/municipios/v1/${state}?providers=gov`
  );
  const res = await response.json();
  if (Array.isArray(res)) cities = res.map((x) => maskCapitalize(x.nome));
  return cities;
};

export default fetchCitiesByState;
