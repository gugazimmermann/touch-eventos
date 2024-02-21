import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loading } from "../../../components";

const NewEventFormStripeCheckoutForm = ({
  setSuccess,
  setInfo,
  setWarning,
  setError,
  onSubmit,
  paymentSuccess,
  setPaymentSuccess
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );
    if (!clientSecret) return;
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setSuccess("Pagamento realizado com sucesso!");
          setInfo("Salvando o Evento... aguarde.");
          setPaymentSuccess(true);
          onSubmit(paymentIntent)
          break;
        case "processing":
          setWarning("Pagamento esta sendo processado.");
          break;
        case "requires_payment_method":
          setError("Pagamento não realizado, tente novamente.");
          break;
        default:
          setError("Pagamento não realizado, tente novamente.");
          break;
      }
    });
  }, [onSubmit, setError, setInfo, setPaymentSuccess, setSuccess, setWarning, stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: process.env.REACT_APP_STRIPE_CALLBACK_URL,
        payment_method_data: {
          billing_details: {
            address: {
              country: "br",
            },
          },
        },
      },
    });
    if (error.type === "card_error" || error.type === "validation_error")
      setError(error.message);
    else setError("An unexpected error occurred.");
    setLoading(true);
  };

  const paymentElementOptions = {
    layout: "tabs",
    defaultValues: {
      billingDetails: {
        address: {
          country: "brazil",
        },
      },
    },
    fields: {
      billingDetails: {
        address: {
          country: "never",
        },
      },
    },
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {loading && <Loading />}
      {!paymentSuccess && (
        <>
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
          />
          <button disabled={loading || !stripe || !elements} id="submit">
            <span id="button-text">
              {loading ? (
                <div className="spinner" id="spinner"></div>
              ) : (
                "Enviar Pagamento"
              )}
            </span>
          </button>
        </>
      )}
    </form>
  );
};

export default NewEventFormStripeCheckoutForm;
