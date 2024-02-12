const FormButton = ({
  size = "w-1/2",
  testid,
  text,
  disabled = false,
  color = "text-white bg-primary-500",
  type = "button",
  onClick,
}) => {
  return (
    <button
      data-testid={testid}
      disabled={disabled}
      type={type}
      className={`${size} px-6 py-2 text-sm font-medium tracking-wide capitalize rounded-lg ${color}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default FormButton;
