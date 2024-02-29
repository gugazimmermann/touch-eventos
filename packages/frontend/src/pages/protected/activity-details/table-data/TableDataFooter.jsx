import { useTranslation } from "react-i18next";

const TableDataFooter = ({ pages, currentPage, handlePageChange }) => {
  const { t } = useTranslation("activity_details");

  return (
    <div className="flex items-center justify-between mt-6">
      <button
        className={`flex items-center px-2 py-1 text-sm capitalize bg-white border rounded-md gap-x-2 ${
          currentPage > 1 && "transition-colors duration-200 hover:bg-slate-100"
        }`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        </svg>
        <span>{t("activity_detail_pagination_back")}</span>
      </button>
      <div className="items-center flex gap-x-3">
        {pages.length <= 10 ? (
          pages.map((p) => (
            <button
              key={`page-${p}`}
              onClick={() => currentPage !== p && handlePageChange(p)}
              className={`px-2 py-1 text-sm rounded-md ${
                currentPage === p
                  ? "text-blue-500 cursor-default"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          ))
        ) : (
          <>
            <label className="text-sm" htmlFor="selectPages">
              {t("activity_detail_pagination_page")}:{" "}
            </label>
            <select
              name="selectPages"
              id="selectPages"
              data-testid="select-pages"
              value={currentPage}
              onChange={(e) =>
                currentPage !== e.target.value &&
                handlePageChange(e.target.value)
              }
              className="px-2 py-1 text-sm bg-white border rounded-md"
            >
              {pages.map((p) => (
                <option key={`page-${p}`} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <button
        className={`flex items-center px-2 py-1 text-sm capitalize bg-white border rounded-md gap-x-2 ${
          currentPage < pages[pages.length - 1] &&
          "transition-colors duration-200 hover:bg-slate-100"
        }`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= pages[pages.length - 1]}
      >
        <span>{t("activity_detail_pagination_foward")}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
          />
        </svg>
      </button>
    </div>
  );
};

export default TableDataFooter;
