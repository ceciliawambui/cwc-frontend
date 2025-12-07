// FloatingToolbar.jsx
import React from "react";

const FloatingToolbar = ({ visible, x, y, onConvert }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed z-[9999] bg-white dark:bg-dark-700 shadow-xl rounded-md p-3 border"
      style={{ top: y, left: x }}
    >
      <p className="font-semibold text-xs mb-2 text-gray-700 dark:text-gray-200">
        Convert to Code Block
      </p>

      <div className="grid grid-cols-3 gap-2">
        {[
          "javascript",
          "python",
          "html",
          "css",
          "bash",
          "json",
          "java",
          "cpp",
          "plaintext",
        ].map((lang) => (
          <button
            key={lang}
            onClick={() => onConvert(lang)}
            className="px-2 py-1 bg-gray-100 dark:bg-dark-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-dark-500"
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FloatingToolbar;
