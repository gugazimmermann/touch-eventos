import { Gift, Survey } from "../icons";

const Banners = ({activity, final}) => {
  return (
    <div className="px-4 flex flex-col gap-4">
      {(activity.visitorGift === "YES" && !final) && (
        <div className="w-full flex flex-row bg-slate-100 rounded-md shadow-md">
          <div className="flex items-center justify-center bg-success-500 p-4 rounded-l-md ">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-start pl-2">
            {activity.visitorGiftText}
          </div>
        </div>
      )}

      {activity.raffle === "YES" ? (
        <div className="w-full flex flex-row bg-slate-100 rounded-md shadow-md">
          <div className="flex items-center justify-center bg-success-500 p-4 rounded-l-md ">
            <Survey className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-start pl-2">
            {activity.raffleText}
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-row bg-slate-100 rounded-md shadow-md">
          <div className="flex items-center justify-center bg-success-500 p-4 rounded-l-md ">
            <Survey className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-start pl-2">
            {activity.surveyText}
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
