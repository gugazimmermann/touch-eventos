import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useActivities } from "../../../../../context/ActivitiesContext";
import * as services from "../../../../../services";
import { formatValue } from "../../../../../helpers/format";
import { Alert, Loading } from "../../../../../components";
import ROUTES from "../../../../../constants/routes";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const PaymentForm = ({
  activityId,
  onSubmit,
  setSuccess,
  setInfo,
  setWarning,
  setError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!stripe) return;
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );
    if (!clientSecret) return;
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setSuccess("Pagamento Efetuado com Sucesso");
          setInfo("Atualizando a Atividade, aguarde...");
          onSubmit(paymentIntent);
          break;
        case "processing":
          setWarning("Pagamento etá sendo processado.");
          break;
        case "requires_payment_method":
          setError("Ocorreu um erro ao realizar o pagamento.");
          break;
        default:
          setError("Ocorreu um erro ao realizar o pagamento.");
          break;
      }
    });
  }, [onSubmit, setError, setInfo, setSuccess, setWarning, stripe]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.REACT_APP_SITE_URL}/${ROUTES.ADMIN.OPENACTIVITY}/${activityId}/pagamento`,
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
    else setError("Ocorreu um erro ao realizar o pagamento.");
    setLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleFormSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button disabled={!stripe || !elements || loading} id="submit">
        <span id="button-text">Realizar Pagamento</span>
      </button>
    </form>
  );
};

const OpenActivityDetailsCardPayment = ({ data, handleTogglePaymentView }) => {
  const { t } = useTranslation("activity_details");
  const navigate = useNavigate();
  const { state, dispatch } = useActivities();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState();

  const handleSubmit = async (paymentIntent) => {
    setSuccess("");
    setInfo("");
    setSuccess("");
    setError("");
    setLoading(true);
    if (paymentIntent) {
      try {
        const activityPaymentData = {
          activityId: data.activityId,
          active: state.subscription?.planId || paymentIntent?.status === "succeeded" ? 1 : 0,
          payment: {
            paymentId: uuidv4(),
            date: String(paymentIntent.created),
            plan: `${data.plan.type} / ${data.plan.duration}`,
            value: String(paymentIntent.amount / 100),
            status: "success",
            paymentIntentId: paymentIntent.id,
          },
        };
        const res = await services.activity.payActivity(activityPaymentData);
        if (res?.error) setError(res.error);
        else {
          dispatch({
            type: "ACTIVITIES_LIST",
            payload: { activitiesList: null },
          });
          navigate(`/${ROUTES.ADMIN.DASHBOARD}`);
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  const createPaymentIntent = useCallback(async () => {
    if (data && data?.plan?.planId && data?.verification?.verificationId) {
      setLoading(true);
      const paymentIntent = await services.stripe.createPaymentIntent({
        planId: data.plan.planId,
        verificationId: data.verification.verificationId,
      });
      setClientSecret(paymentIntent.clientSecret);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    createPaymentIntent();
  }, [createPaymentIntent]);

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="w-full flex flex-col p-4 bg-white rounded-lg shadow-lg">
      <div className="w-full mb-4 flex flex-row items-center">
        <h2 className="font-bold mr-2">{t("Pagamento")}:</h2>
      </div>
      {error && <Alert message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}
      {info && <Alert message={info} type="info" />}
      {warning && <Alert message={warning} type="warning" />}
      {loading || !clientSecret ? (
        <Loading />
      ) : (
        <>
          <div className="w-full flex flex-col justify-center items-center">
            {data.plan && data.verification && (
              <div className="w-full md:w-2/3 mb-6">
                <div className="flex flex-row items-center justify-between px-8 py-4 mx-auto border border-primary-500 rounded-xl">
                  <div className="flex items-center">
                    <div className="flex flex-col items-center space-y-1">
                      <h2 className="text-2xl font-medium ">
                        {data.plan.type} - {data.plan.duration}
                      </h2>
                      {data.verification.price !== "0.00" && (
                        <div className="text-sm text-primary-500 font-semibold bg-gray-100 rounded-full px-4 py-1 ">
                          {t("new_activity_payment_sms")}{" "}
                          {formatValue(data.verification.price)} /{" "}
                          {t("new_activity_payment_sended")}
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-4xl font-semibold text-primary-600">
                    {formatValue(data.plan.price)}
                  </h2>
                </div>
              </div>
            )}
            <div className="w-full md:w-1/2 stripe">
              <Elements options={options} stripe={stripePromise}>
                <PaymentForm
                  activityId={data.activityId}
                  onSubmit={handleSubmit}
                  setSuccess={setSuccess}
                  setInfo={setInfo}
                  setWarning={setWarning}
                  setError={setError}
                />
              </Elements>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-1.5 text-sm tracking-wide text-white bg-success-500 capitalize rounded-lg"
              onClick={() => handleTogglePaymentView()}
            >
              {t("Voltar")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OpenActivityDetailsCardPayment;
