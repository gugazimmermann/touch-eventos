import { handleFetchAuthSession } from "./auth";

export const getVerifications = async () => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/verifications`,
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

export const getVerificationById = async (verificationId) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/verification/${verificationId}`,
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
