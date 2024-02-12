const InputField = ({
  disabled = false,
  required,
  placeholder,
  value,
  values,
  setValues,
  options,
  onBlur,
}) => {
  return (
    <select
      className="block w-full px-4 py-2 mt-4 text-text-700 placeholder-text-500 bg-white border rounded-lg"
      disabled={disabled}
      required={required}
      name={value}
      id={value}
      placeholder={placeholder}
      value={values && values[value] ? values[value] : ""}
      onChange={(e) =>
        setValues && setValues({ ...values, [value]: e.target.value })
      }
      onBlur={(e) => onBlur && onBlur(e)}
    >
      <option value="">{placeholder}</option>
      {(options || []).map((d) => (
        <option key={d.value} value={d.value}>
          {d?.text || d.value}
        </option>
      ))}
    </select>
  );
};

export default InputField;
