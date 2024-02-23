export const getActivityBySlug = async (slug) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SITE_API_URL}/register/activity/${slug}`,
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
        `${process.env.REACT_APP_SITE_API_URL}/register/registration/${activityId}`,
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
        `${process.env.REACT_APP_SITE_API_URL}/register/confirm/${activityId}`,
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
  