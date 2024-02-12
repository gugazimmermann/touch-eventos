import { useTranslation } from "react-i18next";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TableFooter from "./TableFooter";

const Table = ({ header, items, perPage }) => {
  const { t } = useTranslation("components");

  return (
    <div className="flex flex-col mt-4">
      <div className="overflow-x-auto inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-background-200 rounded-lg">
          <table className="min-w-full divide-y divide-background-200">
            <TableHeader items={header} />
            <tbody className="bg-white divide-y divide-background-200">
              {items.length > 0 ? (
                <TableRow items={items} />
              ) : (
                <td
                  className="px-4 py-4 text-sm whitespace-nowrap text-center font-bold"
                  colSpan={header.length}
                >
                  {t("table_no_item")}
                </td>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {items.length > perPage && <TableFooter />}
    </div>
  );
};

export default Table;
