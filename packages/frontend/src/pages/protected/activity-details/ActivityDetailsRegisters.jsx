import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { parseISO, format } from "date-fns";
import ROUTES from "../../../constants/routes";
import { activity } from "../../../services";
import { ArrowBackCircle } from "../../../icons";
import { Alert, Loading } from "../../../components";
import { AdminTopNav } from "../../../components/layout";

const ActivityDetailsRegisters = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState();

  const getData = useCallback(async (id) => {
    setLoading(true);
    try {
      const activityData = await activity.getActivityRegistersById(id);
      if (activityData?.error) setError(activityData?.error);
      else setData(activityData);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activityId) getData(activityId);
    else navigate(`/${ROUTES.ADMIN.DASHBOARD}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, getData]);

  return (
    <section className="w-full px-4 mb-8">
      {error && <Alert message={error} type="danger" />}
      <AdminTopNav title={t("activity_details_title")} />
      <div className="flex flex-col justify-start items-start gap-4">
        <button
          className="flex flow-row justify-center items-center py-2"
          onClick={() => navigate(`/${ROUTES.ADMIN.ACTIVITY}/${activityId}`)}
        >
          <ArrowBackCircle />
          <h2 className=" text-2xl text-strong ml-2">
            {t("activity_details_register_title")}
          </h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full bg-white rounded-lg shadow-lg">
            {data && (
              <div className="flex overflow-x-auto">
                <div className="inline-block min-w-full p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="border-b">
                        <tr>
                          <th scope="col" className="p-2">
                            #
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_register_created_at")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_register_confirmed")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_register_gift")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_register_desk")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_register_email")}
                          </th>
                          <th scope="col" className="p-2">
                            {t("activity_details_register_phone")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.length > 0 &&
                          data.map((d, i) => (
                            <tr key={d.registrationId} className="border-b">
                              <td className="whitespace-nowrap p-2">{i + 1}</td>
                              <td className="whitespace-nowrap p-2">
                                {d.createdAt
                                  ? format(
                                      parseISO(d.createdAt.replace(" ", "T")),
                                      "dd/MM/yy HH:mm"
                                    )
                                  : ""}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {d.confirmed
                                  ? format(
                                      parseISO(d.confirmed.replace(" ", "T")),
                                      "dd/MM/yy HH:mm"
                                    )
                                  : ""}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {d.gift
                                  ? format(
                                      parseISO(d.gift.replace(" ", "T")),
                                      "dd/MM/yy HH:mm"
                                    )
                                  : ""}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {d.deskUser}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {d.email}
                              </td>
                              <td className="whitespace-nowrap p-2">
                                {d.phone}
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

export default ActivityDetailsRegisters;
