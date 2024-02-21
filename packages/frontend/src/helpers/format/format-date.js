import { format } from "date-fns";

const formatDate = (timestamp) => {
  const timestampInMilliseconds =
    timestamp.length < 11 ? timestamp * 1000 : timestamp;
  return format(
    new Date(parseInt(timestampInMilliseconds, 10)),
    "dd/MM/yy HH:mm"
  );
};

export default formatDate;
