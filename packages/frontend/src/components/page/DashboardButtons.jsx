import { Folder, FolderOpen } from "../../pages/shared/icons";

const DashboardButtons = ({ archived, setArchived }) => {
  return (
    <div className="flex flow-row justify-end gap-4">
      <button
        className={`${
          !archived ? "bg-primary-500" : "bg-background-500"
        } flex items-center px-2 py-1 text-sm tracking-wide text-white capitalize rounded-lg`}
        onClick={() => setArchived(false)}
      >
        <FolderOpen />
        <span className="mx-1">Ativos</span>
      </button>
      <button
        className={`${
          archived ? "bg-primary-500" : "bg-background-500"
        } flex items-center px-2 py-1 text-sm tracking-wide text-white capitalize rounded-lg`}
        onClick={() => setArchived(true)}
      >
        <Folder />
        <span className="mx-1">Arquivados</span>
      </button>
    </div>
  );
};

export default DashboardButtons;
