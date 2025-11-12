// src/components/Footer.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`py-8 text-center text-xs border-t mt-auto
      ${theme === "dark" ? "text-white/70 border-gray-800" : "text-gray-500 border-gray-200"}`}
    >
      © {new Date().getFullYear()} Knowledge Hub -  Explore. Learn. Build.
    </footer>
  );
}
