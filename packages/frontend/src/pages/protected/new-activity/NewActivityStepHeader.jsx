import { useTranslation } from "react-i18next";
import { Activity, CheckList, CreditCard } from "../../../icons";

const NewActivityStepHeader = ({ step, setStep, paymentSuccess }) => {
  const { t } = useTranslation("new_activity");

  const stepIconColor = ({ current, done }) => {
    if (paymentSuccess) return "bg-success-300 text-success-700";
    if (current && !done) return "bg-primary-300 text-primary-700";
    else if (!current && done) return "bg-success-300 text-success-700";
    else return "bg-slate-300 text-slate-700";
  };

  const stepTextColor = ({ current, done }) => {
    if (paymentSuccess) return "text-success-500";
    if (current && !done) return "text-primary-500 font-bold";
    else if (!current && done) return "text-success-500";
    else return "text-text-500";
  };

  const stepLink = (number) => {
    if (paymentSuccess) return "cursor-default";
    if (number < step) return "cursor-pointer hover:bg-primary-50";
  };

  const renderStep = (number, text, icon) => {
    return (
      <li className="w-20 flex-auto">
        <div
          className={`flex items-center pl-2 leading-5 no-underline after:ml-2  after:h-px after:w-full after:flex-1 after:bg-slate-300 after:content-[''] focus:outline-none ${stepLink(
            number
          )}`}
          onClick={() => number < step && !paymentSuccess && setStep(number)}
        >
          <span
            className={`m-2 flex h-8 w-8 items-center justify-center rounded-full text-sm ${stepIconColor(
              { current: step === number, done: step > number }
            )}`}
          >
            {icon}
          </span>
          <span
            className={`after:flex ${stepTextColor({
              current: step === number,
              done: step > number,
            })}`}
          >
            {text}
          </span>
        </div>
      </li>
    );
  };

  return (
    <ul className="relative m-0 flex list-none justify-between overflow-hidden p-0 transition-[height] duration-200 ease-in-out">
      {renderStep(1, t("new_activity_step_details"), <Activity />)}
      {renderStep(2, t("new_activity_step_survey"), <CheckList />)}
      {renderStep(3, t("new_activity_step_payment"), <CreditCard />)}
    </ul>
  );
};

export default NewActivityStepHeader;
