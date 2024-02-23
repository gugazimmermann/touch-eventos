/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { endOfDay, isAfter, isBefore, startOfDay } from "date-fns";
import { useDesk } from "../../context/DeskContext";
import * as desk from "../../services/desk";
import { Alert, Loading } from "../../components";
import { FormButton, InputField } from "../../components/form";
import LoginImg from "./login.svg";

const initialValues = {
  username: "",
  accessCode: "",
};

const Login = () => {
  const { t } = useTranslation("desk");
  const navigate = useNavigate();
  const { activitySlug } = useParams();
  const { state, dispatch } = useDesk();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [warning, setWarning] = useState("");
  const [activity, setActivity] = useState();
  const [values, setValues] = useState(initialValues);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await desk.access(activity.activityId, values);
      if (result?.error || !result?.token) {
        setError(t("access_error"));
      } else {
        dispatch({
          type: "TOKEN",
          payload: { token: result.token },
        });
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const getData = useCallback(
    async (slug) => {
      setLoading(true);
      try {
        const activityData = await desk.getActivityBySlug(slug);
        if (activityData?.activityId) {
          const startDate = startOfDay(
            new Date(parseInt(activityData.startDate, 10))
          );
          const endDate = endOfDay(
            new Date(parseInt(activityData.endDate, 10))
          );
          const today = startOfDay(new Date());
          if (isBefore(today, startDate)) {
            setInfo(t("activity_not_started"));
          } else if (isAfter(today, endDate)) {
            setWarning(t("activity_ended"));
          } else {
            setActivity(activityData);
            dispatch({
              type: "ACTIVITY",
              payload: { activity: activityData },
            });
          }
        } else if (
          activityData?.error ===
          "Bad Request: Activity Does Not Have Visitors Gift"
        ) {
          setError(t("activity_does_not_have_visitors_gift"));
        } else if (activityData.error === "Bad Request: Activity Not Active") {
          setError(t("activity_not_active"));
        } else if (activityData.error === "Bad Request: Payment Problem") {
          setError(t("payment_problem"));
        } else {
          setWarning(t("activity_not_found"));
        }
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    },
    [dispatch]
  );

  useEffect(() => {
    getData(activitySlug);
  }, [activitySlug, getData]);

  useEffect(() => {
    if (state.token) navigate(`/${activitySlug}/main`);
  }, [state.token]);

  return (
    <>
      <div className="w-full sm:w-1/2 mx-auto flex items-center justify-center">
        {!activity?.logo ? (
          <img src={LoginImg} className="w-4/5" alt="Login" />
        ) : (
          <img
            src={activity.logo}
            className="w-full sm:w-1/2 shadow-lg rounded-lg"
            alt="Logo"
          />
        )}
      </div>
      <div className="w-full sm:w-1/2 mx-auto">
        {error && <Alert message={error} type="danger" center={true} />}
        {info && <Alert message={info} type="info" center={true} />}
        {warning && <Alert message={warning} type="warning" center={true} />}
        {loading && <Loading size="w-20 h-20" />}
        {activity && (
          <form className="w-full px-4 text-center sm:text-left" onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold">{activity?.name}</h1>
            <div className="my-4">
              <label className="font-semibold mb-4" htmlFor="username">
                {t("username")}
              </label>
              <InputField
                disabled={loading}
                required={true}
                type="text"
                value="username"
                values={values}
                setValues={setValues}
              />
            </div>
            <div>
              <label className="font-semibold mb-4" htmlFor="accessCode">
                {t("access_code")}
              </label>
              <InputField
                disabled={loading}
                required={true}
                type="password"
                value="accessCode"
                values={values}
                setValues={setValues}
              />
            </div>
            <div className="flex justify-center sm:justify-end mt-6">
              <FormButton
                testid="register-send-button"
                text={t("enter")}
                disabled={loading}
                type="submit"
                textSize="text-base"
              />
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Login;
