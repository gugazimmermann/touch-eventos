export const getActivityById = async (activityId) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/activity/${activityId}`,
      { method: "GET" }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const register = async (activityId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/register/${activityId}`,
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

export const confirm = async (activityId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/confirm/${activityId}`,
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
