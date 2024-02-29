export const getActivityBySlug = async (slug) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/activity/${slug}`,
      { method: "GET" }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const auth = async (activityId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/auth/${activityId}`,
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

export const personalData = async (activityId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/personal/${activityId}`,
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

export const activityData = async (activityId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/activity/${activityId}`,
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
