import { handleFetchAuthSession } from "./auth";

export const createPaymentIntent = async (data) => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/payment/create-payment-intent`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (err) {
    return err;
  }
};

export const customerPaymentMethods = async () => {
  try {
    const { accessToken } = await handleFetchAuthSession();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/payment/customer-payment-methods`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  } catch (err) {
    return err;
  }
};