import { useState } from "react";

function InputFieldAutoComplete({
  disabled = false,
  required,
  mask,
  placeholder,
  value,
  values,
  setValues,
  suggestions,
}) {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizeString = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleChange = (e) => {
    const inputVal = e.target.value;
    if (inputVal === "") {
      setShowSuggestions(false);
    } else {
      const newFilteredSuggestions = suggestions.filter((s) =>
        normalizeString(s.toLowerCase()).startsWith(
          normalizeString(inputVal.toLowerCase())
        )
      );
      setFilteredSuggestions(newFilteredSuggestions);
      setShowSuggestions(true);
    }
    setValues({ ...values, [value]: inputVal });
  };

  const handleSuggestionClick = (s) => {
    setValues({ ...values, [value]: s });
    setShowSuggestions(false);
  };

  const handleSuggestionKeyDown = (e, suggestion) => {
    if (e.key === "Enter") handleSuggestionClick(suggestion);
  };

  return (
    <div className="relative">
      <input
        disabled={disabled}
        required={required}
        type="text"
        className="block w-full px-4 py-2 mt-4 text-text-700 placeholder-text-500 bg-white border rounded-lg"
        placeholder={placeholder}
        value={
          values && values[value]
            ? mask
              ? mask(values[value])
              : values[value]
            : ""
        }
        onChange={handleChange}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full border border-t-0 rounded-b p-1 bg-white z-10">
          {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className="cursor-pointer p-1 hover:bg-background-200"
              onClick={() => handleSuggestionClick(suggestion)}
              onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InputFieldAutoComplete;
