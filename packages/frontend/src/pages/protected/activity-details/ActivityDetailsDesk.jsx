import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { getTime, format } from "date-fns";
import ROUTES from "../../../constants/routes";
import { activity } from "../../../services";
import { ArrowBackCircle } from "../../../icons";
import { Alert, Loading } from "../../../components";
import { AdminTopNav } from "../../../components/layout";

const ActivityDetailsDesk = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState();
  const [values, setValues] = useState({
    user: "",
    accessCode: "",
  });

  const getData = useCallback(async (id) => {
    setLoading(true);
    try {
      const activityData = await activity.getDesk(id);
      if (activityData?.error) setError(activityData?.error);
      else setData(activityData);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }, []);

  const handleChangeStatus = async (deskId) => {
    setLoading(true);
    try {
      await activity.changeDesk(activityId, deskId);
      await getData(activityId);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.user || !values.accessCode) {
      setError(t("activity_details_desk_add_access_error"));
      return;
    }
    setLoading(true);
    const payload = {
      deskId: uuidv4(),
      user: values.user,
      accessCode: values.accessCode,
      createdAt: `${getTime(new Date())}`,
    };
    await activity.saveDesk(activityId, payload);
    setValues({
      user: "",
      accessCode: "",
    });
    await getData(activityId);
  };

  const handleStatus = (status, deskId) => {
    return (
      <button
        type="button"
        onClick={() => handleChangeStatus(deskId)}
        className={`${
          status === 1
            ? "bg-success-100 text-success-500"
            : "bg-danger-100 text-danger-500"
        } ml-2 inline-block whitespace-nowrap rounded-lg text-center align-baseline text-sm px-2 py-1 font-bold leading-none`}
      >
        {status === 1
          ? t("activity_details_desk_table_gift_status_active")
          : t("activity_details_desk_table_gift_status_inactive")}
      </button>
    );
  };

  useEffect(() => {
    if (activityId) getData(activityId);
    else navigate(`/${ROUTES.ADMIN.DASHBOARD}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, getData]);

  return (
    <section className="w-full px-4">
      {error && <Alert message={error} type="danger" />}
      <AdminTopNav title={t("activity_details_title")} />
      <div className="flex flex-col justify-start items-start gap-4">
        <button
          className="flex flow-row justify-center items-center py-2"
          onClick={() => navigate(`/${ROUTES.ADMIN.ACTIVITY}/${activityId}`)}
        >
          <ArrowBackCircle />
          <h2 className=" text-2xl text-strong ml-2">
            {t("activity_details_desk_title")}
          </h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full bg-white rounded-lg shadow-lg">
            <div className="max-w-4xl px-8 mt-2 mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="w-full flex flex-row justify-center items-center gap-4 mt-4">
                  <h2 className="text-lg font-semibold capitalize">
                    {t("activity_details_desk_add_access")}
                  </h2>
                  <input
                    id="user"
                    name="user"
                    type="text"
                    placeholder={t("activity_details_desk_add_access_user")}
                    value={values.user}
                    onChange={(e) =>
                      setValues &&
                      setValues({ ...values, user: e.target.value })
                    }
                    className="block px-2 py-1.5 border border-background-500 rounded-md"
                  />
                  <input
                    id="accessCode"
                    name="accessCode"
                    type="text"
                    placeholder={t("activity_details_desk_add_access_code")}
                    value={values.accessCode}
                    onChange={(e) =>
                      setValues &&
                      setValues({ ...values, accessCode: e.target.value })
                    }
                    className="block px-2 py-1.5 border border-background-500 rounded-md"
                  />
                  <button
                    type="submit"
                    className="w-1/5 px-2 py-2 leading-5 text-white bg-primary-500 rounded-md"
                  >
                    {t("activity_details_desk_add_access_save")}
                  </button>
                </div>
              </form>
            </div>
            {data && (
              <div className="flex overflow-x-auto">
                <div className="inline-block min-w-full p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="border-b">
                        <tr>
                          <th scope="col" className="p-2">
                            {t("activity_details_desk_table_user")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_desk_table_gift_delivered")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_desk_table_gift_created_at")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_desk_table_gift_status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.length > 0 &&
                          data.map((d, i) => (
                            <tr key={d.deskId} className="border-b">
                              <td className="whitespace-nowrap p-2">
                                {d.user}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {d.gifts}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {format(
                                  new Date(parseInt(d.createdAt, 10)),
                                  "dd/MM/yy HH:mm"
                                )}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {handleStatus(d.active, d.deskId)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityDetailsDesk;
