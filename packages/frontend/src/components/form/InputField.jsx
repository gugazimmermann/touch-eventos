const InputField = ({
  disabled = false,
  required,
  autocomplete = "off",
  type = "text",
  placeholder,
  value,
  values,
  setValues,
  onBlur,
  mask,
  className,
}) => {
  return (
    <input
      className={`block w-full px-4 py-2 text-text-700 placeholder-text-500 bg-white border rounded-lg ${
        className ? className : "mt-4"
      }`}
      disabled={disabled}
      required={required}
      autoComplete={autocomplete}
      name={value}
      id={value}
      type={type}
      placeholder={placeholder}
      value={
        values && values[value]
          ? mask
            ? mask(values[value])
            : values[value]
          : ""
      }
      onChange={(e) =>
        setValues && setValues({ ...values, [value]: e.target.value })
      }
      onBlur={(e) => onBlur && onBlur(e)}
    />
  );
};

export default InputField;
