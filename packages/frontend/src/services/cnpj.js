import { maskCapitalize, maskCep } from "../helpers/mask";

const fetchDataByCNPJ = async (document, data) => {
  const cleanValue = document.replace(/\D+/g, "");
  if (cleanValue.length < 14) return data;
  const response = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cleanValue}`
  );
  const res = await response.json();
  if (!res.type) {
    // data.name = maskCapitalize(data?.razao_social || "");
    data.name = maskCapitalize(res?.nome_fantasia || res?.razao_social);
    data.email = res?.email ? res.email.toLowerCase() : '';
    data.phone = res?.ddd_telefone_1;
    data.addressNumber = res?.numero;
    data.addressComplement = res?.complemento;
    if (res?.cep) {
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${res?.cep}`
      );
      const dataCep = await response.json();
      if (!dataCep.type) {
        data.addressZipCode = dataCep?.cep ? maskCep(dataCep.cep) : maskCep(res?.cep);
        data.addressState = dataCep?.state;
        data.addressCity = dataCep?.city;
        data.addressStreet = dataCep?.street;
        data.addressNeighborhood = dataCep?.neighborhood;
        data.addressLatitude = dataCep?.location?.coordinates?.longitude;
        data.addressLongitude = dataCep?.location?.coordinates?.latitude;
      }
    }
  }
  return data;
};

export default fetchDataByCNPJ;
