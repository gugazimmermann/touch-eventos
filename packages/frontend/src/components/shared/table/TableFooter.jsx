import { ArrowBack, ArrowFoward } from "../../../pages/shared/icons";

const FooterButtonBack = () => {
  return (
    <button
      type="button"
      className="flex items-center px-4 py-2 text-sm capitalize bg-white border rounded-md gap-x-2 hover:bg-background-100"
    >
      <ArrowBack />
      <span>Voltar</span>
    </button>
  );
};

const FooterButtonFoward = () => {
  return (
    <button
      type="button"
      className="flex items-center px-4 py-2 text-sm capitalize bg-white border rounded-md gap-x-2 hover:bg-background-100"
    >
      <span>Avançar</span>

      <ArrowFoward />
    </button>
  );
};

const FooterButton = ({ number, active, disabled }) => {
  return (
    <button
      type="button"
      className={`px-2 py-1 text-sm rounded-md ${
        active
          ? "text-secondary-500 bg-secondary-100"
          : disabled
          ? "text-text-500 cursor-default"
          : "text-text-500 hover:bg-text-100"
      }`}
    >
      {number}
    </button>
  );
};

const TableFooter = () => {
  return (
    <div className="flex items-center justify-between mt-4">
      <FooterButtonBack />
      <div className="items-center hidden md:flex gap-x-3">
        <FooterButton number={1} active={true} />
        <FooterButton number={2} />
        <FooterButton number={3} />
        <FooterButton number={"..."} disabled={true} />
        <FooterButton number={12} />
        <FooterButton number={13} />
        <FooterButton number={14} />
      </div>
      <FooterButtonFoward />
    </div>
  );
};

export default TableFooter;
