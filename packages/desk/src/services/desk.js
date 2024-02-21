export const getEventBySlug = async (slug) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/event/${slug}`,
      { method: "GET" }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const access = async (eventId, data) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SITE_API_URL}/event/${eventId}/access`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const check = async (eventId, data) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SITE_API_URL}/event/${eventId}/check`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const deliver = async (eventId, data) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SITE_API_URL}/event/${eventId}/deliver`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};