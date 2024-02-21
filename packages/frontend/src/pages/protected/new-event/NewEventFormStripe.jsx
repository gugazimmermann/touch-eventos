import { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { stripe } from "../../../services";
import { FormButton } from "../../../components/form";
import NewEventFormStripeCheckoutForm from "./NewEventFormStripeCheckoutForm";
import { Loading } from "../../../components";
import { formatValue } from "../../../helpers/format";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const NewEventFormStripe = ({
  activePlans,
  planId,
  activeVerifications,
  verificationId,
  loading,
  setLoading,
  setSuccess,
  setInfo,
  setWarning,
  setError,
  onSubmit,
  setStep,
  paymentSuccess,
  setPaymentSuccess
}) => {
  const [plan, setPlan] = useState("");
  const [verification, setVerification] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const createPaymentIntent = useCallback(async () => {
    const paymentIntent = await stripe.createPaymentIntent({
      planId,
      verificationId,
    });
    setClientSecret(paymentIntent.clientSecret);
    setLoading(false);
  }, [planId, setLoading, verificationId]);

  useEffect(() => {
    if (planId && verificationId) {
      const selectedPlan = activePlans.find((p) => p.planId === planId);
      setPlan(selectedPlan);
      const selectedVerification = activeVerifications.find(
        (v) => v.verificationId === verificationId
      );
      setVerification(selectedVerification);
    }
  }, [activePlans, activeVerifications, planId, verificationId]);

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
    <div className="mt-2">
      {planId && verificationId && clientSecret && !loading && !paymentSuccess ? (
        <div>
          <div className="w-full flex flex-col justify-center items-center">
            {plan && verification && (
              <div className="w-full md:w-2/3 mb-6">
                <div className="flex flex-row items-center justify-between px-8 py-4 mx-auto border border-primary-500 rounded-xl">
                  <div className="flex items-center">
                    <div className="flex flex-col items-center space-y-1">
                      <h2 className="text-2xl font-medium ">
                        {plan.type} - {plan.duration}
                      </h2>
                      {verification.price !== "0.00" && (
                        <div className="text-sm text-primary-500 font-semibold bg-gray-100 rounded-full px-4 py-1 ">
                          SMS cobrado automaticamente,{" "}
                          {formatValue(verification.price)} / envio
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-4xl font-semibold text-primary-600">
                    {formatValue(plan.price)}
                  </h2>
                </div>
              </div>
            )}
            <div className="w-full md:w-1/2 stripe">
              {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <NewEventFormStripeCheckoutForm
                    setSuccess={setSuccess}
                    setInfo={setInfo}
                    setWarning={setWarning}
                    setError={setError}
                    onSubmit={onSubmit}
                    paymentSuccess={paymentSuccess}
                    setPaymentSuccess={setPaymentSuccess}
                  />
                </Elements>
              )}
            </div>
          </div>
          <div className="w-full flex flex-row mt-8">
            <div className="w-1/3 flex justify-center">
              <FormButton
                testid="new-event-back-button"
                text={"Voltar"}
                disabled={loading}
                type="button"
                onClick={() => setStep(2)}
                size="w-2/3"
                color="text-white bg-slate-400"
              />
            </div>
            <div className="w-1/3 flex justify-center" />
            <div className="w-1/3 flex justify-center">
              <FormButton
                testid="new-event-test-button"
                text={"Período de Teste"}
                disabled={loading}
                type="button"
                onClick={() => onSubmit()}
                size="w-2/3"
                color="text-white bg-success-500"
              />
            </div>
          </div>
        </div>
      ) : (
        <Loading size="h-12 w-12" />
      )}
    </div>
  );
};

export default NewEventFormStripe;
