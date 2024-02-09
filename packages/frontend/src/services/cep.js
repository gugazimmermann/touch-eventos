const fetchDataByCEP = async (cep, data) => {
  const cleanValue = cep.replace(/\D+/g, "");
  if (cleanValue.length < 8) return data;
  const response = await fetch(
    `https://brasilapi.com.br/api/cep/v2/${cleanValue}`
  );
  const res = await response.json();
  if (!res.type) {
    data.addressState = res?.state;
    data.addressCity = res?.city;
    data.addressStreet = res?.street;
    data.addressNeighborhood = res?.neighborhood;
    data.addressLatitude = res?.location?.coordinates?.latitude;
    data.addressLongitude = res?.location?.coordinates?.longitude;
  }
  return data;
};

export default fetchDataByCEP;
