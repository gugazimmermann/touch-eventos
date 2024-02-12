const TableStatus = ({ status, text }) => {
  return (
    <div
      className={`inline px-3 py-1 rounded-full gap-x-2 ${
        status === "success"
          ? "text-success-500 bg-success-100"
          : "text-danger-500 bg-danger-100"
      }`}
    >
      {text}
    </div>
  );
};

export default TableStatus;
