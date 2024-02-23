import { useTranslation } from "react-i18next";
import { Folder, FolderOpen, Reload } from "../../../icons";

const TooltipItem = ({ children, tooltipsText }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2 whitespace-nowrap rounded border border-light bg-white px-4 py-1.5 text-sm opacity-0 group-hover:opacity-100">
        <span className="absolute -top-1 left-1/2 -z-10 h-2 w-2 -translate-x-1/2 rotate-45 rounded-sm border-l border-t border-light bg-white" />
        {tooltipsText}
      </div>
    </div>
  );
};

const DashboardButtons = ({ archived, setArchived, reload }) => {
  const { t } = useTranslation("admin");
  
  return (
    <div className="flex flow-row justify-end gap-4">
      <TooltipItem tooltipsText={t("dashboard_button_active")}>
        <button
          className={`${
            !archived ? "bg-primary-500" : "bg-background-500"
          } flex justify-center items-center h-8 w-10 text-sm tracking-wide text-white capitalize rounded-lg shadow-md`}
          onClick={() => setArchived(false)}
        >
          <FolderOpen />
        </button>
      </TooltipItem>
      <TooltipItem tooltipsText={t("dashboard_button_archived")}>
        <button
          className={`${
            archived ? "bg-primary-500" : "bg-background-500"
          } flex justify-center items-center h-8 w-10 text-sm tracking-wide text-white capitalize rounded-lg shadow-md`}
          onClick={() => setArchived(true)}
        >
          <Folder />
        </button>
      </TooltipItem>
      <TooltipItem tooltipsText={t("dashboard_button_reload")}>
        <button
          className="bg-info-500 flex justify-center items-center h-8 w-10 text-sm tracking-wide text-white capitalize rounded-lg shadow-md"
          onClick={() => reload(true)}
        >
          <Reload />
        </button>
      </TooltipItem>
    </div>
  );
};

export default DashboardButtons;
