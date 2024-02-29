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
}) => {
  return (
    <input
      className="block w-full px-4 py-2 mt-4 text-text-700 placeholder-text-500 bg-white border rounded-lg"
      disabled={disabled}
      required={required}
      autoComplete={autocomplete}
      name={value}
      id={value}
      type={type}
      placeholder={placeholder}
      value={values && values[value] ? (mask ? mask(values[value]) : values[value]): ""}
      onChange={(e) =>
        setValues && setValues({ ...values, [value]: e.target.value })
      }
      onBlur={(e) => onBlur && onBlur(e)}
    />
  );
};

export default InputField;
