import { ArrowsSort } from "../../../../icons";

const TableHeaderCel = ({ text, sort, onClick }) => {
  return (
    <th scope="col" className="py-2 px-4 text-sm font-normal text-left">
      <button
        className={`flex flex-row items-center gap-2 ${
          !sort && "cursor-default"
        }`}
        onClick={onClick}
      >
        {text}
        {sort && <ArrowsSort />}
      </button>
    </th>
  );
};

const TableData = ({ headers, data, handleOrder, handleChangeStatus }) => {
  const handleStatus = (status, deskId) => {
    const statusData = status.split("#");
    return (
      <button
        type="button"
        onClick={() => handleChangeStatus(statusData[0])}
        className={`${
          statusData[1] === "Ativo"
            ? "bg-success-100 text-success-500"
            : "bg-danger-100 text-danger-500"
        } ml-2 inline-block whitespace-nowrap rounded-lg text-center align-baseline px-2 py-1 leading-none`}
      >
        {statusData[1]}
      </button>
    );
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 ">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h, i) => (
                    <TableHeaderCel
                      key={`tableheadercel-${i}`}
                      text={h.text}
                      sort={h.sort}
                      onClick={() => h.sortType && handleOrder(h.sortType)}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.length > 0 &&
                  data.map((d, i) => (
                    <tr key={`row#${i}`}>
                      <td className="px-4 py-2 text-sm font-medium whitespace-nowrap bg-slate-50 border-r border-slate-200">
                        {i + 1}
                      </td>
                      {Object.values(d).map((v, j) => (
                        <td key={`cel#${j}`} className="px-4 py-2 text-sm font-medium whitespace-nowrap">
                          {v?.type === 'status' ? handleStatus(v.value) : v.value}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableData;
