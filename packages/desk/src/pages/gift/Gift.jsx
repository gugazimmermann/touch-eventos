import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDesk } from "../../context/DeskContext";
import usePhoneCode from "../../hooks/usePhoneCode";
import maskPhone from "../../helpers/mask-phone";
import { validateEmail, validatePhone } from "../../helpers/validate";
import * as desk from "../../services/desk";
import { Alert, Loading } from "../../components";
import { FormButton, InputField } from "../../components/form";
import Image1 from "./1.svg";
import Image2 from "./2.svg";
import Image3 from "./3.svg";
import Image4 from "./4.svg";
import Image5 from "./5.svg";
import Image6 from "./6.svg";
import Image7 from "./7.svg";
import Image8 from "./8.svg";
import Image9 from "./9.svg";
import Image10 from "./10.svg";
import Image11 from "./11.svg";

const images = [
  Image1,
  Image2,
  Image3,
  Image4,
  Image5,
  Image6,
  Image7,
  Image8,
  Image9,
  Image10,
  Image11,
];

const Gift = () => {
  const { t } = useTranslation("desk");
  const navigate = useNavigate();
  const { activitySlug } = useParams();
  const { state } = useDesk();
  const { PhoneCodeSelect } = usePhoneCode();
  const [selectedImage, setSelectedImage] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activity, setActivity] = useState();
  const [checkPhone, setCheckPhone] = useState({ phoneCode: "", phone: "" });
  const [checkEmail, setCheckEmail] = useState({ email: "" });
  const [registration, setRegistration] = useState();
  const [deliver, setDeliver] = useState(false);

  const selectRandomImage = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setSelectedImage(images[randomIndex]);
  }, []);

  const handleReset = () => {
    setError("");
    setSuccess("");
    setCheckPhone({ phoneCode: "", phone: "" });
    setCheckEmail({ email: "" });
    setRegistration();
    setDeliver(false);
    selectRandomImage();
  };

  const seeRegisterCanReceiveGift = useCallback((r) => {
    if (!r.confirmed) return "not_confirmed";
    else if (r.gift) return "already_delivered";
    else return "confirmed";
  }, []);

  const handleDeliver = async () => {
    setLoading(true);
    const deliverResponse = await desk.deliver(activity.activityId, {
      registrationId: registration.registrationId,
      token: state.token,
    });
    if (deliverResponse?.delivered) {
      setSuccess(t("gift_success_delivered"));
      setDeliver(true);
    } else if (
      deliverResponse?.error === "Bad Request: Visistor Not Confirmed"
    ) {
      setError(t("visitor_not_confirmed"));
    } else if (
      deliverResponse?.error === "Bad Request: Gift Already Delivered"
    ) {
      setError(t("gift_already_delivered"));
    } else if (deliverResponse?.error === "Unauthorized") {
      setError(t("unauthorized"));
    } else {
      setError(t("deliver_error"));
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    const payload = {
      token: state.token,
      hash: "",
    };
    if (activity.verification === "SMS") {
      const phone = checkPhone.phone.replace(/\D+/g, "");
      if (!validatePhone(phone)) {
        setError(t("invalid_phone"));
        return;
      }
      const phoneCode = checkPhone.phoneCode || "+55";
      payload.hash = `${activity.activityId}#${phoneCode}${phone}`;
    } else {
      if (!validateEmail(checkEmail.email)) {
        setError(t("invalid_email"));
        return;
      }
      payload.hash = `${activity.activityId}#${checkEmail.email}`;
    }
    setLoading(true);
    const checkResponse = await desk.check(activity.activityId, payload);
    if (checkResponse?.register) {
      setRegistration(checkResponse.register);
    } else if (checkResponse?.error === "Not Found: Register Not Found") {
      setError(t("register_not_found"));
    } else if (checkResponse?.error === "Unauthorized") {
      setError(t("unauthorized"));
    } else {
      setError(t("check_error"));
    }
    setLoading(false);
  };

  useEffect(() => {
    selectRandomImage();
  }, [selectRandomImage]);

  useEffect(() => {
    if (!state.token && !state.activity && !activitySlug) navigate("/");
    else if (!state.token || !state.activity) navigate(`/${activitySlug}`);
    setActivity(state.activity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token, state.activity, activitySlug]);

  return (
    <div className="w-full mx-auto flex flex-col-reverse sm:flex-row flex-grow gap-10 justify-evenly items-center">
      <div className="w-4/5 sm:w-1/2 flex items-center justify-center">
        <img
          className="h-auto w-auto max-h-96"
          src={selectedImage}
          alt="visitor gift"
        />
      </div>
      {activity && (
        <div className="w-full sm:w-1/2 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-semibold">{activity.name}</h1>
          <p className="mt-3 text-xl">
            {t("gift_text_1")}{" "}
            <span className="text-2xl font-semibold text-primary-500">
              {activity.verification === "SMS"
                ? t("gift_text_phone")
                : t("gift_text_email")}
            </span>{" "}
            {t("gift_text_2")}
          </p>
          {(error || success) && (
            <div className="w-full mt-4">
              {error && <Alert message={error} type="danger" center={true} />}
              {success && (
                <Alert message={success} type="success" center={true} />
              )}
            </div>
          )}
          {loading ? (
            <Loading size="w-20 h-20" />
          ) : (
            <>
              {!registration && !deliver ? (
                <form
                  className="w-full flex flex-col justify-between items-center gap-2"
                  onSubmit={handleSubmit}
                >
                  {activity.verification === "SMS" ? (
                    <div className="w-full flex flex-row justify-between items-center gap-2">
                      <PhoneCodeSelect
                        disabled={loading}
                        value="phoneCode"
                        values={checkPhone}
                        setValues={setCheckPhone}
                      />
                      <div className="mt-4 flex flex-grow">
                        <InputField
                          disabled={loading}
                          required={activity.verification === "SMS" ? true : false}
                          autocomplete="phone"
                          placeholder={t("phone")}
                          value="phone"
                          values={checkPhone}
                          setValues={setCheckPhone}
                          mask={maskPhone}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full mt-4 flex flex-grow">
                      <InputField
                        disabled={loading}
                        required={activity.verification !== "SMS" ? true : false}
                        autocomplete="email"
                        type="email"
                        placeholder={t("email")}
                        value="email"
                        values={checkEmail}
                        setValues={setCheckEmail}
                      />
                    </div>
                  )}
                  <div className="w-full mt-4">
                    <FormButton
                      testid="desk-check-button"
                      text={t("check")}
                      disabled={loading}
                      type="submit"
                      size="w-full"
                      textSize="text-base"
                    />
                  </div>
                </form>
              ) : (
                <div className="w-full flex flex-col justify-center items-center mt-4">
                  {!deliver && (
                    <>
                      <div className="w-full flex flex-row justify-evenly items-center gap-4">
                        <div className="text-lg font-semibold">
                          {registration.activityRegisterHash.split("#")[1]}
                        </div>
                        <span
                          className={`px-3 py-1.5 text-lg font-bold text-center inline-block leading-none whitespace-nowrap rounded-lg ${
                            seeRegisterCanReceiveGift(registration) ===
                            "confirmed"
                              ? "bg-success-500 text-success-100"
                              : seeRegisterCanReceiveGift(registration) ===
                                "not_confirmed"
                              ? "bg-danger-500 text-danger-100"
                              : "bg-warning-500 text-warning-100"
                          } `}
                        >
                          {t(seeRegisterCanReceiveGift(registration))}
                        </span>
                      </div>
                      <div className="w-full sm?w-1/2 mt-4">
                        <button
                          data-testid="desk-gift-button"
                          disabled={!registration.confirmed}
                          type="button"
                          className={`w-full px-6 py-2 font-medium tracking-wide capitalize rounded-lg ${
                            seeRegisterCanReceiveGift(registration) ===
                            "confirmed"
                              ? "text-white bg-primary-500"
                              : "text-text-500 bg-slate-300"
                          }`}
                          onClick={() => handleDeliver()}
                        >
                          {t("deliver_gift")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="w-full flex justify-center mt-4">
                <button
                  data-testid="desk-reset-button"
                  type="button"
                  className="w-1/3 px-4 py-2 font-medium text-sm tracking-wide capitalize rounded-lg text-white bg-secondary-500"
                  onClick={() => handleReset()}
                >
                  {t("reset")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Gift;
