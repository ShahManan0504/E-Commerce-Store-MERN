import React, { Fragment } from "react";

export default function Input({
  id,
  type,
  value,
  required,
  handleChange,
  placeholder,
}) {
  return (
    <Fragment>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => handleChange(e)}
        className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        placeholder={placeholder}
      />
    </Fragment>
  );
}
