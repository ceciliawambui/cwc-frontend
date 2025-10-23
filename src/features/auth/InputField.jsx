import React from "react";
import clsx from "clsx";

export default function InputField({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  autoFocus = false,
  className = "",
}) {
  return (
    <label className={clsx("block w-full", className)} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full rounded-xl py-3 px-4 bg-white/90 dark:bg-gray-900/60 border border-gray-300/40 dark:border-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300">
            {icon}
          </div>
        )}
      </div>
    </label>
  );
}

