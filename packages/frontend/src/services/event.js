import { handleFetchAuthSession } from "./auth";

export const saveEventImage = async (data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/events/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    throw err;
  }
};

export const saveEvent = async (data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    throw err;
  }
};

export const getEvents = async (achived) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/events/${achived ? 'archived' : ''}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    throw err;
  }
};

export const getEventById = async (eventId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/event/${eventId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.json();
  } catch (err) {
    throw err;
  }
};
