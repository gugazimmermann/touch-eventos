const Alert = ({ type, title, message, center }) => {
  const alertColor = (type) => {
    if (type === "success")
      return "bg-success-100 border-success-400 text-success-700";
    if (type === "info") return "bg-info-100 border-info-400 text-info-700";
    if (type === "warning")
      return "bg-warning-100 border-warning-400 text-warning-700";
    if (type === "danger")
      return "bg-danger-100 border-danger-400 text-danger-700";
    return "bg-success-100 border-success-400 text-success-700";
  };

  return (
    <div
      data-testid="alert"
      className={`border ${alertColor(
        type
      )} px-2 py-1.5 rounded-lg relative mb-2 ${center && 'text-center'}`}
    >
      {title && <strong className="font-bold mr-2">{title}</strong>}
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default Alert;
