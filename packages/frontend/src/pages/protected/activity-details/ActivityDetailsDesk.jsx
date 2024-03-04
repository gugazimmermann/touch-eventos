import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import {
  parseISO,
  format,
  parse,
  compareAsc,
  compareDesc,
  isValid,
  addHours,
} from "date-fns";
import ROUTES from "../../../constants/routes";
import { activity } from "../../../services";
import { ArrowBackCircle, SearchTable, Spreadsheet } from "../../../icons";
import { Alert, Loading } from "../../../components";
import { AdminTopNav } from "../../../components/layout";
import TableData from "./table-data/TableData";
import TableDataFooter from "./table-data/TableDataFooter";

const ActivityDetailsDesk = () => {
  const { t } = useTranslation("activity_details");
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalData, setOriginalData] = useState();
  const [dataToTable, setDataToTable] = useState();
  const [dataToPage, setDataToPage] = useState();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showing, setShowing] = useState("all");
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("desc");
  const [values, setValues] = useState({
    user: "",
    accessCode: "",
  });

  const headerData = [
    {
      text: "#",
      sort: false,
      sortType: "",
    },
    {
      text: t("activity_details_desk_table_user"),
      sort: true,
      sortType: "user",
    },
    {
      text: t("activity_details_desk_table_gift_delivered"),
      sort: true,
      sortType: "gifts",
    },
    {
      text: t("activity_details_desk_table_gift_created_at"),
      sort: true,
      sortType: "createdAt",
    },
    {
      text: t("activity_details_desk_table_gift_status"),
      sort: true,
      sortType: "active",
    },
  ];

  const handleExportToCSV = () => {
    const properties = ["user", "gifts", "createdAt", "active"];
    const csvRows = [];
    csvRows.push(
      `${t("activity_details_desk_table_user")}, ${t(
        "activity_details_desk_table_gift_delivered"
      )}, ${t("activity_details_desk_table_gift_created_at")}, ${t(
        "activity_details_desk_table_gift_status"
      )}`
    );

    for (const row of dataToTable) {
      const values = properties.map((property) => {
        const escapedValue = ("" + (row[property].value || "")).replace(
          /"/g,
          '\\"'
        );
        return `"${escapedValue}"`;
      });
      csvRows.push(values.join(","));
    }
    const fileName = `balcao-${format(new Date(), "dd_MMM-HH_mm_ss")}.csv`;
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName.toLocaleLowerCase());
    link.click();
  };

  const handlePagination = useCallback(
    (currentData, pageNum) => {
      const indexOfLastItem = pageNum * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
      setDataToPage(currentItems);
    },
    [itemsPerPage]
  );

  const handlePageNumbers = useCallback(
    (totalItems) => {
      const p = [];
      for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) p.push(i);
      setPages(p);
    },
    [itemsPerPage]
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    handlePagination(dataToTable, pageNumber);
  };

  const orderDate = (data, field) => {
    return data.sort((a, b) => {
      const dateA = a[field].value
        ? parse(a[field].value, "dd/MM/yy HH:mm", new Date())
        : new Date(0);
      const dateB = b[field].value
        ? parse(b[field].value, "dd/MM/yy HH:mm", new Date())
        : new Date(0);

      const validDateA = isValid(dateA)
        ? dateA
        : order === "desc"
        ? new Date(8640000000000000)
        : new Date(0);
      const validDateB = isValid(dateB)
        ? dateB
        : order === "desc"
        ? new Date(8640000000000000)
        : new Date(0);

      return order === "desc"
        ? compareDesc(validDateA, validDateB)
        : compareAsc(validDateA, validDateB);
    });
  };

  const orderText = (data, field) => {
    return order === "asc"
      ? data.sort((a, b) =>
          (a[field].value || "").localeCompare(b[field].value || "")
        )
      : data.sort((a, b) =>
          (b[field].value || "").localeCompare(a[field].value || "")
        );
  };

  const orderNumber = (data, field) => {
    return order === "asc"
      ? data.sort((a, b) => a[field].value - b[field].value)
      : data.sort((a, b) => b[field].value - a[field].value);
  };

  const handleOrder = (type) => {
    let orderedData = [...dataToTable];
    if (type === "user" || type === "active") {
      orderedData = orderText(dataToTable, type);
    } else if (type === "gifts") {
      orderedData = orderNumber(dataToTable, type);
    } else {
      orderedData = orderDate(dataToTable, type);
    }
    setOrder(order === "desc" ? "asc" : "desc");
    setDataToTable(orderedData);
    handlePagination(orderedData, 1);
    handlePageNumbers(orderedData.length);
    setCurrentPage(1);
  };

  const normalizeString = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowing(search ? "search" : "all");
    if (!search) {
      setDataToTable(originalData);
      handlePagination(originalData, 1);
      handlePageNumbers(originalData.length);
      setCurrentPage(1);
    } else {
      const newData = originalData.filter(
        (d) =>
          d?.createdAt?.value?.includes(search) ||
          d?.gifts?.value.toString() === search ||
          normalizeString(d?.user?.value?.toLowerCase()).includes(
            normalizeString(search.toLowerCase())
          ) ||
          d?.active?.value
            ?.toLowerCase()
            .includes(normalizeString(search.toLowerCase()))
      );
      setDataToTable(newData);
      handlePagination(newData, 1);
      handlePageNumbers(newData.length);
      setCurrentPage(1);
    }
  };

  const handleShowState = (status) => {
    setSearch("");
    let newData = [...originalData];
    if (status === "active") {
      newData = originalData.filter((d) => d.active.value.split("#")[1] === "Ativo");
    } else if (status === "inactive") {
      newData = originalData.filter((d) => d.active.value.split("#")[1] === "Inativo");
    }
    setDataToTable(newData);
    handlePagination(newData, 1);
    handlePageNumbers(newData.length);
    setCurrentPage(1);
    setShowing(status);
  };

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
      return;
    }
    setLoading(true);
    const payload = {
      deskId: uuidv4(),
      user: values.user,
      accessCode: values.accessCode,
      createdAt: `${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
    };
    await activity.saveDesk(activityId, payload);
    setValues({
      user: "",
      accessCode: "",
    });
    await getData(activityId);
  };

  const formatData = (rawData) => {
    const formatDate = (d) => format(addHours(parseISO(d.replace(" ", "T")), -3), "dd/MM/yy HH:mm");
    return rawData.map((d) => ({
      user: { value: d.user },
      gifts: { value: d.gifts },
      createdAt: { value: d.createdAt ? formatDate(d.createdAt) : "" },
      active: { value: d.active ? `${d.deskId}#Ativo` : `${d.deskId}#Inativo`, type: "status" },
    }));
  };

  const getData = useCallback(async (id) => {
    setLoading(true);
    try {
      const activityData = await activity.getDesk(id);
      if (activityData?.error) setError(activityData?.error);
      else {
        const formatedData = formatData(activityData);
        setOriginalData(formatedData);
        setDataToTable(formatedData);
        handlePageNumbers(formatedData.length);
        handlePagination(formatedData, 1);
        setShowing("all");
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dataToTable) {
      setCurrentPage(1);
      handlePagination(dataToTable, 1);
      handlePageNumbers(dataToTable.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage, dataToTable]);

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
          className="flex flow-row justify-center items-center"
          onClick={() => navigate(`/${ROUTES.ADMIN.ACTIVITY}/${activityId}`)}
        >
          <ArrowBackCircle />
          <h2 className="text-2xl text-strong ml-2">
            {t("activity_details_desk_title")}
          </h2>
        </button>
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full bg-white rounded-lg shadow-lg">
            <div className="container px-4 mx-auto my-4">
              {/* header */}
              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-x-2 mb-2">
                  <h2 className="text-lg font-medium text-gray-800">
                    {t("activity_details_register_title")}
                  </h2>
                  <span className="px-2 py-0.5 text-sm text-secondary-800 bg-secondary-100 rounded-full">
                    {originalData?.length || 0} {t("activity_detail_total")}
                  </span>
                  {showing !== "all" && (
                    <span className="px-2 py-0.5 text-sm text-primary-800 bg-primary-100 rounded-full">
                      {dataToTable?.length || 0}{" "}
                      {showing === "search" && search
                        ? search
                        : showing === "active"
                        ? t("activity_details_status_active")
                        : t("activity_details_status_inactive")}
                    </span>
                  )}
                </div>
                <button
                  className="hover:text-primary-500"
                  onClick={() => handleExportToCSV()}
                >
                  <Spreadsheet />
                </button>
              </div>
              <form className="flex flex-col mb-4" onSubmit={handleSubmit}>
                <div className="w-full flex flex-row justify-center items-center gap-4">
                  <h2 className="font-semibold capitalize">
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
                    className="block px-1.5 py-1 bg-white border border-slate-200 rounded-lg"
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
                    className="block px-1.5 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="w-1/5 p-2 leading-5 text-white bg-secondary-500 rounded-lg"
                  >
                    {t("activity_details_desk_add_access_save")}
                  </button>
                </div>
              </form>
              {dataToTable && (
                <>
                  {/* Buttons and Search */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex overflow-hidden bg-white border divide-x rounded-lg">
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                          showing === "active" && "bg-gray-100"
                        }`}
                        onClick={() => handleShowState("active")}
                      >
                        {t("activity_details_status_active")}
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                          (!showing || showing === "all") && "bg-gray-100"
                        }`}
                        onClick={() => handleShowState("all")}
                      >
                        {t("activity_detail_all")}
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                          showing === "inactive" && "bg-gray-100"
                        }`}
                        onClick={() => handleShowState("inactive")}
                      >
                        {t("activity_details_status_inactive")}
                      </button>
                    </div>
                    <div className="flex flex-row gap-x-4">
                      <form onSubmit={handleSearch}>
                        <div className="relative flex items-center mt-4 md:mt-0">
                          <SearchTable />
                          <input
                            type="text"
                            placeholder={t("activity_detail_search")}
                            className="block w-full py-1.5 pr-4 bg-white border border-slate-200 rounded-lg md:w-80 placeholder-text-400 pl-10 focus:border-secondary-400 focus:ring-secondary-300 focus:outline-none focus:ring focus:ring-opacity-40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </form>
                      <select
                        name="itensPerPage"
                        id="itensPerPage"
                        data-testid="item-per-page"
                        value={itemsPerPage}
                        onChange={(e) =>
                          itemsPerPage !== e.target.value &&
                          setItemsPerPage(e.target.value)
                        }
                        className="py-1.5 pr-4 bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                  {/* table */}
                  <TableData
                    headers={headerData}
                    data={dataToPage}
                    handleOrder={handleOrder}
                    handleChangeStatus={handleChangeStatus}
                  />
                  {/* Footer */}
                  <TableDataFooter
                    pages={pages}
                    currentPage={currentPage}
                    handlePageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityDetailsDesk;
