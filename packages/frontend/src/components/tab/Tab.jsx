import Alert from "../Alert";
import Loading from "../Loading";

const Tab = ({ error, loading, size, tabs, selectedTab, onTabClick }) => {
  const tabSize = (s) => {
    switch (s) {
      case "xs":
        return "max-w-xs";
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-lg";
      case "xl":
        return "max-w-xl";
      case "2xl":
        return "max-w-2xl";
      case "3xl":
        return "max-w-3xl";
      case "4xl":
        return "max-w-4xl";
      case "5xl":
        return "max-w-5xl";
      case "6xl":
        return "max-w-6xl";
      case "7xl":
        return "max-w-7xl";
      case "full":
        return "max-w-full";
      default:
        return "max-w-full";
    }
  };

  return (
    <div
      data-testid="tab-container"
      className={`flex flex-col justify-center mx-auto ${tabSize(size)}`}
    >
      <div className="w-full border-b border-background-500">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`inline-flex items-center px-4 py-2 text-center whitespace-nowrap ${
              selectedTab === i
                ? "rounded-t-md bg-background-500 text-white"
                : "bg-transparent"
            }`}
            onClick={() => onTabClick(i)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="bg-white p-4">
        {error && <Alert message={error} type="danger" />}
        {loading ? (
          <Loading />
        ) : (
          tabs[selectedTab] && tabs[selectedTab].compoment
        )}
      </div>
    </div>
  );
};

export default Tab;
