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

export const confirm = async (activityId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/confirm/${activityId}`,
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

export const getRegistration = async (registrationId, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/registration/${registrationId}`,
      { method: "POST", body: JSON.stringify(data) }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getDefaultSurvey = async (slug, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/survey/${slug}/default-survey`,
      { method: "POST", body: JSON.stringify(data) }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const sendDefaultAnswers = async (slug, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/survey/${slug}/default-answers`,
      { method: "POST", body: JSON.stringify(data) }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getActivitySurvey = async (slug, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/survey/${slug}/activity-survey`,
      { method: "POST", body: JSON.stringify(data) }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const sendActivityAnswers = async (slug, data) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SITE_API_URL}/survey/survey/${slug}/activity-answers`,
      { method: "POST", body: JSON.stringify(data) }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};