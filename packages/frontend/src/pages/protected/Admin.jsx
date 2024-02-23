import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { format, isAfter, isBefore, isSameDay } from "date-fns";
import { useActivities } from "../../context/ActivitiesContext";
import { account, activity } from "../../services";
import { Alert, Loading } from "../../components";
import { AdminTopNav, DashboardButtons } from "../../components/layout";
import { ActivityCard, NewActivityCard } from "./components";

const imagePlaceholder =
  "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

const Admin = () => {
  const { t } = useTranslation("admin");
  const { state, dispatch } = useActivities();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [canCreate, setCanCreate] = useState(false);
  const [archivedActivities, setArchivedActivities] = useState(false);
  const [activities, setActivities] = useState([]);

  const activityStatus = (start, end) => {
    const startDate = new Date(parseInt(start, 10));
    const endDate = new Date(parseInt(end, 10));
    const today = new Date();
    if (isAfter(startDate, today)) {
      return "AWAITING";
    } else if (isBefore(endDate, today)) {
      return "FINISHED";
    } else if (
      (isBefore(startDate, today) || isSameDay(startDate, today)) &&
      (isAfter(endDate, today) || isSameDay(endDate, today))
    ) {
      return "OPEN";
    }
    return "AWAITING";
  };

  const formatData = useCallback((data) => {
    const fomatedActivities = [];
    data.forEach((e) => {
      fomatedActivities.push({
        activityId: e.activityId,
        logo: e.logo || imagePlaceholder,
        name: e.name,
        dates: `${format(
          new Date(parseInt(e.startDate, 10)),
          "dd/MM/yy"
        )} | ${format(new Date(parseInt(e.endDate, 10)), "dd/MM/yy")}`,
        location: `${e.city} / ${e.state}`,
        verificationType: e.verificationType,
        visitors: e.visitors || "-",
        status: activityStatus(e.startDate, e.endDate),
        payment: e.payment,
        active: e.active,
      });
    });
    return fomatedActivities;
  }, []);

  const getActivities = useCallback(
    async (force) => {
      setLoading(true);
      const activitiesList = !archivedActivities
        ? state.activitiesList
        : state.activitiesListArchived;
      if (!activitiesList || force) {
        const res = await activity.getActivities(archivedActivities);
        if (res?.error) setError(res.error);
        else {
          if (archivedActivities)
            dispatch({
              type: "ACTIVITIES_LIST_ARCHIVED",
              payload: { activitiesListArchived: res },
            });
          else dispatch({ type: "ACTIVITIES_LIST", payload: { activitiesList: res } });
          setActivities(formatData(res));
        }
      } else {
        setActivities(formatData(activitiesList));
      }
      setLoading(false);
    },
    [
      archivedActivities,
      dispatch,
      formatData,
      state.activitiesList,
      state.activitiesListArchived,
    ]
  );

  const getUserData = useCallback(async () => {
    const userData = state?.user || (await account.getCurrentUser());
    if (!userData?.name || !userData?.document) {
      setWarning("Acesse 'Minha Conta' e finalize seu cadastro.");
    } else {
      setCanCreate(true);
      dispatch({
        type: "USER",
        payload: { user: userData },
      });
    }
  }, [dispatch, state?.user]);

  const getUserSubscription = useCallback(async () => {
    const userSubscription =
      state?.subscription || (await account.getCurrentUserSubscription());
    if (userSubscription?.subscription?.endDate) {
      dispatch({
        type: "SUBSCRIPTION",
        payload: { subscription: userSubscription.subscription },
      });
    }
  }, [dispatch, state?.subscription]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await getUserData();
    await getUserSubscription();
    await getActivities();
    setLoading(false);
  }, [getActivities, getUserSubscription, getUserData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <section className="w-full px-4">
      <AdminTopNav
        title={`${t("dashboard")} - ${
          !archivedActivities
            ? t("dashboard_activity_active")
            : t("dashboard_activity_archived")
        }`}
      >
        <DashboardButtons
          archived={archivedActivities}
          setArchived={setArchivedActivities}
          reload={getActivities}
        />
      </AdminTopNav>
      {error && <Alert message={error} type="danger" />}
      {warning && <Alert message={warning} type="warning" />}
      <div className=" grid grid-cols-5 gap-4 pb-8">
        {!archivedActivities && <NewActivityCard canCreate={canCreate} />}
        {loading ? (
          <Loading />
        ) : (
          activities.map((e) => <ActivityCard key={e.activityId} data={e} />)
        )}
      </div>
    </section>
  );
};

export default Admin;
