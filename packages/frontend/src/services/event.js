import axios from "axios";
import { handleFetchAuthSession } from "./auth";

export const saveEventImage = async (eventId, data, onUploadProgress) => {
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
      `${process.env.REACT_APP_API_URL}/events/${eventId}/image`,
      data,
      config
    );
    return response;
  } catch (err) {
    console.log(err);
  }
};

export const saveEvent = async (data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/events/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getEvents = async (archived) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/events/list/${archived ? "archived" : ""}`,
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

export const getEventById = async (eventId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/events/${eventId}`,
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

export const getEventRegistersById = async (eventId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/events/${eventId}/registers`,
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

export const saveDesk = async (eventId, data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}/desk`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getDesk = async (eventId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/events/${eventId}/desk`,
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

export const changeDesk = async (eventId, deskId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${eventId}/desk/${deskId}`, {
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
    const response = await fetch(`${process.env.REACT_APP_API_URL}/events/verify-slug/${slug}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    return err;
  }
};