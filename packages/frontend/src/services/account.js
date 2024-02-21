import { handleFetchAuthSession } from "./auth";

export const getCurrentUser = async () => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getCurrentUserPayments = async () => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/user/payments`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const updateCurrentUser = async (data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const getCurrentUserSubscription = async () => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/user/subscription`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    return err;
  }
};
