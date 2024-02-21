import { Link } from "react-router-dom";
import ROUTES from "../../../constants/routes";
import {
  CalendarBolt,
  CalendarClock,
  CalendarOff,
  Email,
  MapPin,
  Sms,
  Visitors,
} from "../../../icons";

const EventCard = ({ data }) => {
  const statusColor = (data) => {
    if (data.active === 0 || data?.payment !== "success") return "bg-purple-500";
    if (data.status === "OPEN") return "bg-success-500";
    if (data.status === "AWAITING") return "bg-primary-500";
    if (data.status === "FINISHED") return "bg-background-500";
    return "bg-background-500";
  };

  return (
    <div className="w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-lg">
      <Link to={`/${ROUTES.ADMIN.EVENT}/${data.eventId}`}>
        <img
          className="object-contain w-full h-36 bg-background-200"
          src={data.logo}
          alt="avatar"
        />
        <div className={`flex items-center p-2 ${statusColor(data)}`}>
          <h1 className="font-semibold text-white text-center w-full">
            {data.name}
          </h1>
        </div>
        <div className="p-2">
          <div className="flex items-center">
            {data.finished ? (
              <CalendarOff />
            ) : data.started ? (
              <CalendarBolt />
            ) : (
              <CalendarClock />
            )}
            <h1 className="px-2 text-sm font-bold">{data.dates}</h1>
          </div>
          <div className="flex items-center mt-2">
            <MapPin />
            <h1 className="px-2 text-sm">{data.location}</h1>
          </div>
          <div className="grid grid-cols-2 mt-2">
            {data.verificationType === "SMS" ? (
              <div className="flex items-center">
                <Sms />
                <h1 className="px-2 text-sm">SMS</h1>
              </div>
            ) : (
              <div className="flex items-center">
                <Email />
                <h1 className="px-2 text-sm">EMAIL</h1>
              </div>
            )}
            <div className="flex items-center">
              <Visitors />
              <h1 className="px-2 text-sm">{data.visitors}</h1>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
