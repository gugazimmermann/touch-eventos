const fetchCoordinates = async (address, num, city, state) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${`${address}, ${num}`}, ${city}, ${state}, BR&limit=1`
  );
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      lat: data[0].lat,
      lon: data[0].lon,
    };
  }
  return null;
};

export default fetchCoordinates;
