import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Menu, X } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="
        fixed top-0 left-0 w-full z-50 backdrop-blur-xl
        bg-white/80 dark:bg-[#0A0A0C]/90 border-b border-white/10 dark:border-white/10
        shadow-sm transition-all duration-500
        mb-6 md:mb-10
      "
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight bg-gradient-to-r 
            from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent 
            hover:opacity-90 transition-opacity"
        >
          Knowledge Hub
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" label="Home" />
          <NavLink to="/courses" label="Courses" />
          <NavLink to="/login" label="Login" />
          <NavLink to="/register" label="Sign Up" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="ml-3 w-10 h-10 flex items-center justify-center rounded-full 
              bg-gray-200 dark:bg-gray-700 
              text-gray-700 dark:text-white
              hover:scale-[1.06] hover:bg-gray-300 dark:hover:bg-gray-600 
              transition-all duration-300 shadow"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700 
            text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0A0A0C]/95 backdrop-blur-md border-t border-white/10 shadow-md">
          <div className="flex flex-col space-y-4 px-6 py-5">
            <MobileLink to="/" label="Home" setMenuOpen={setMenuOpen} />
            <MobileLink to="/courses" label="Courses" setMenuOpen={setMenuOpen} />
            <MobileLink to="/login" label="Login" setMenuOpen={setMenuOpen} />
            <MobileLink to="/register" label="Sign Up" setMenuOpen={setMenuOpen} />

            <button
              onClick={() => {
                toggleTheme();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 text-gray-800 dark:text-white font-medium"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ------------------ sub components ------------------ */

function NavLink({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative text-[15px] font-medium transition-colors
        ${isActive
          ? "text-indigo-600 dark:text-pink-400"
          : "text-gray-700 dark:text-white hover:text-indigo-500 dark:hover:text-pink-400"
        }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
      )}
    </Link>
  );
}

function MobileLink({ to, label, setMenuOpen }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-[15px] font-medium transition-colors
        ${isActive
          ? "text-indigo-600 dark:text-pink-400"
          : "text-gray-800 dark:text-white hover:text-indigo-500 dark:hover:text-pink-400"
        }`}
    >
      {label}
    </Link>
  );
}
