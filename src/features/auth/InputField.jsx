import React from "react";

export default function InputField({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  autoFocus = false,
}) {
  return (
    <label className="block">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full bg-white/6 dark:bg-black/20 border border-white/8 rounded-xl py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
            {icon}
          </div>
        )}
      </div>
    </label>
  );
}
