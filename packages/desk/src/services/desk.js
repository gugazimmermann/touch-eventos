export const getActivityBySlug = async (slug) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/desk/activity/${slug}`,
      { method: "GET" }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const access = async (activityId, data) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SITE_API_URL}/desk/${activityId}/access`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const check = async (activityId, data) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SITE_API_URL}/desk/${activityId}/check`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const deliver = async (activityId, data) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_SITE_API_URL}/desk/${activityId}/deliver`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};