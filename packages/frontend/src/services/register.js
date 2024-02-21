export const getEventById = async (eventId) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/event/${eventId}`,
      { method: "GET" }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const register = async (eventId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/register/${eventId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const confirm = async (eventId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/confirm/${eventId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};
