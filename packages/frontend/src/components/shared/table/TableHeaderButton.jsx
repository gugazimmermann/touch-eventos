import { TableOrder } from "../../../pages/shared/icons";

const TableHeaderButton = ({ title }) => {
  return (
    <button className="flex items-center gap-x-2 focus:outline-none">
      <span>{title}</span>
      <TableOrder />
    </button>
  );
};

export default TableHeaderButton;
