import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { getTime } from "date-fns";
import { event } from "../../services";
import { ArrowBackCircle } from "../../icons";
import { Alert, Loading } from "../../components";
import { AdminTopNav } from "../../components/layout";
import ROUTES from "../../constants/routes";
import { format } from "date-fns";

const EventDetailsDesk = () => {
  const { t } = useTranslation("admin");
  const { eventId } = useParams();
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
      const eventData = await event.getDesk(id);
      if (eventData?.error) setError(eventData?.error);
      else setData(eventData);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }, []);

  const handleChangeStatus = async (deskId) => {
    setLoading(true);
    try {
      await event.changeDesk(eventId, deskId);
      await getData(eventId);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.user || !values.accessCode) {
      setError("Erro ao cadastrar, confira o formulário.");
      return;
    }
    setLoading(true);
    const payload = {
      deskId: uuidv4(),
      user: values.user,
      accessCode: values.accessCode,
      createdAt: `${getTime(new Date())}`,
    };
    await event.saveDesk(eventId, payload);
    setValues({
      user: "",
      accessCode: "",
    });
    await getData(eventId);
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
        {status === 1 ? "Ativo" : "Inativo"}
      </button>
    );
  };

  useEffect(() => {
    if (eventId) getData(eventId);
    else navigate("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, getData]);

  return (
    <section className="w-full px-4">
      {error && <Alert message={error} type="danger" />}
      <AdminTopNav title={t("edit_event_title")} />
      {loading ? (
        <Loading />
      ) : (
        <>
          {data && (
            <div className="flex flex-col justify-start items-start gap-4">
              <button
                className="flex flow-row justify-center items-center py-2"
                onClick={() => navigate(`/${ROUTES.ADMIN.EVENT}/${eventId}`)}
              >
                <ArrowBackCircle />
                <h2 className=" text-2xl text-strong ml-2">
                  {data.name} - Cadastros
                </h2>
              </button>
              <div className="w-full bg-white rounded-lg shadow-lg">
                <div className="max-w-4xl px-8 mt-2 mx-auto">
                  <h2 className="text-lg font-semibold capitalize">
                    Adicionar Acesso
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="w-full flex flex-row justify-normal items-end gap-4">
                      <div className="w-2/5 pt-2">
                        <label className="font-semibold" htmlFor="user">
                          Usuário
                        </label>
                        <input
                          id="user"
                          name="user"
                          type="text"
                          value={values.user}
                          onChange={(e) =>
                            setValues &&
                            setValues({ ...values, user: e.target.value })
                          }
                          className="block w-full px-4 py-2 border border-background-500 rounded-md"
                        />
                      </div>
                      <div className="w-2/5 pt-2">
                        <label className="font-semibold" htmlFor="accessCode">
                          Código de Acesso
                        </label>
                        <input
                          id="accessCode"
                          name="accessCode"
                          type="text"
                          value={values.accessCode}
                          onChange={(e) =>
                            setValues &&
                            setValues({ ...values, accessCode: e.target.value })
                          }
                          className="block w-full px-4 py-2 border border-background-500 rounded-md"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-1/5 px-8 py-2.5 leading-5 text-white bg-primary-500 rounded-md"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex overflow-x-auto">
                  <div className="inline-block min-w-full p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="border-b">
                          <tr>
                            <th scope="col" className="p-2">
                              Usuário
                            </th>
                            <th scope="col" className="p-2">
                              Brindes Entregues
                            </th>
                            <th scope="col" className="p-2">
                              Criado
                            </th>
                            <th scope="col" className="p-2">
                              Status
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
                                <td className="whitespace-nowrap p-2">-</td>
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
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default EventDetailsDesk;
