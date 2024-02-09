import { handleFetchAuthSession } from "./auth";

export const getPlans = async () => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/plans`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    throw err;
  }
};

export const getPlanById = async (planId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/plan/${planId}`,
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
