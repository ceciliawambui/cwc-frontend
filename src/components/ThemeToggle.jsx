import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-all shadow-md"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="text-yellow-400 w-5 h-5" />
      ) : (
        <Moon className="text-gray-700 w-5 h-5" />
      )}
    </button>
  );
}


