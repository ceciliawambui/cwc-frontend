import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  // Sync state to <html> class & localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((v) => !v)}
      aria-label="Toggle theme"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg
                 bg-gradient-to-r from-indigo-500 to-pink-500 text-white ${className}`}
    >
      {dark ? (
        <Sun size={18} className="text-yellow-300" />
      ) : (
        <Moon size={18} className="text-gray-200" />
      )}
    </button>
  );
}

