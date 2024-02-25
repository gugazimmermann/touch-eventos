import { format } from "date-fns";

const formatDate = (timestamp, {time = true, timezone = null}) => {
  if (!timestamp) return;
  const timestampInMilliseconds =
    String(timestamp).length < 11 ? timestamp * 1000 : timestamp;
  return format(
    new Date(parseInt(timestampInMilliseconds, 10)),
    time ? "dd/MM/yy HH:mm" : "dd/MM/yy" 
  );
};

export default formatDate;
