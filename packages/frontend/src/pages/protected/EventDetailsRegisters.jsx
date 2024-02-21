import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { event } from "../../services";
import { ArrowBackCircle } from "../../icons";
import { Alert, Loading } from "../../components";
import { AdminTopNav } from "../../components/layout";
import ROUTES from "../../constants/routes";
import { format } from "date-fns";

const EventDetailsRegisters = () => {
  const { t } = useTranslation("admin");
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState();

  const getData = useCallback(async (id) => {
    setLoading(true);
    try {
      const eventData = await event.getEventRegistersById(id);
      if (eventData?.error) setError(eventData?.error);
      else setData(eventData);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (eventId) getData(eventId);
    else navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, getData]);

  return (
    <section className="w-full px-4">
      {error && <Alert message={error} type="danger" />}
      <AdminTopNav title={t("edit_event_title")} />
      {loading && <Loading />}
      {data && (
        <div className="flex flex-col justify-start items-start gap-4">
          <button
            className="flex flow-row justify-center items-center py-2 px-4"
            onClick={() => navigate(`/${ROUTES.ADMIN.EVENT}/${eventId}`)}
          >
            <ArrowBackCircle />
            <h2 className="text-lg text-strong ml-2">
              {data.name} - Cadastros
            </h2>
          </button>
          <div className="w-full bg-white rounded-lg shadow-lg">
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
                          Registro
                        </th>
                        <th scope="col" className="p-2">
                          Confirmado
                        </th>
                        <th scope="col" className="p-2">
                          Email
                        </th>
                        <th scope="col" className="p-2">
                          Telefone
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.registers.length > 0 &&
                        data.registers.map((r, i) => (
                          <tr key={r.eventRegisterHash} className="border-b">
                            <td className="whitespace-nowrap p-2">{i + 1}</td>
                            <td className="whitespace-nowrap p-2">
                              {format(
                                new Date(parseInt(r.createdAt, 10)),
                                "dd/MM/yy HH:mm"
                              )}
                            </td>
                            <td className="whitespace-nowrap p-2">
                              {r.confirmed
                                ? format(
                                    new Date(parseInt(r.confirmed, 10)),
                                    "dd/MM/yy HH:mm"
                                  )
                                : "-"}
                            </td>
                            <td className="whitespace-nowrap p-2">{r.email}</td>
                            <td className="whitespace-nowrap p-2">{r.phone}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventDetailsRegisters;
