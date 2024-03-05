import axios from "axios";
import { handleFetchAuthSession } from "./auth";

export const saveActivityImage = async (activityId, data, onUploadProgress) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const config = {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/image`,
      data,
      config
    );
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const saveActivity = async (data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/activities/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getActivities = async (archived) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/list/${archived ? "archived" : ""}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getActivityById = async (activityId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getActivityRegistersById = async (activityId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/registers`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const saveDesk = async (activityId, data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/activities/${activityId}/desk`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getDesk = async (activityId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/desk`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const changeDesk = async (activityId, deskId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/activities/${activityId}/desk/${deskId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const verifySlug = async (slug) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/activities/verify-slug/${slug}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    return err;
  }
};


export const getRegisters = async (activityId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/survey/registers`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getDefaultSurvey = async (activityId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/default-survey`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getSurvey = async (activityId, lang) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/survey/${lang}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const saveSurvey = async (activityId, lang, survey) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/activities/${activityId}/survey`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ lang, survey }),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getDefaultSurveyAnwsers = async (activityId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/default-survey-anwsers`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getSurveyAnwsers = async (activityId, lang) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/activities/${activityId}/survey/${lang}/anwsers`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    return err;
  }
};