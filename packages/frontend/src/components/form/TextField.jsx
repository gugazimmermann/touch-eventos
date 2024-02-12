const TextField = ({
  disabled = false,
  required,
  placeholder,
  value,
  values,
  setValues,
  onBlur,
  mask,
}) => {
  return (
    <textarea
      className="block w-full px-4 py-2 mt-4 h-36 text-text-700 placeholder-text-500 bg-white border rounded-lg"
      disabled={disabled}
      required={required}
      name={value}
      id={value}
      placeholder={placeholder}
      value={values && values[value] ? (mask ? mask(values[value]) : values[value]): ""}
      onChange={(e) =>
        setValues && setValues({ ...values, [value]: e.target.value })
      }
      onBlur={(e) => onBlur && onBlur(e)}
    />
  );
};

export default TextField;
