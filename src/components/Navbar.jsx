import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useAuth from "../hooks/useAuth";
import {
  Sun,
  Moon,
  Menu,
  X,
  Coffee,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import SupportModal from "./SupportModal";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Hide navbar on admin dashboard
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <nav
        className="
          fixed top-0 left-0 w-full z-50 
          backdrop-blur-xl
         dark:bg-[#0A0A0C]/90 border-b border-white/10 dark:border-white/10
          shadow-sm transition-all duration-500
        "
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* LOGO */}
          <Link
            to="/"
            className="text-4xl font-bold tracking-tight 
              bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 
              bg-clip-text text-transparent 
              hover:opacity-90 transition-opacity"
          >
            DevHaven
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">

            <NavItem to="/" label="Home" />
            <NavItem to="/courses" label="Courses" />

            {/* If not logged in */}
            {!user && (
              <>
                <NavItem to="/login" label="Login" />
                <NavItem to="/register" label="Sign Up" />
              </>
            )}

            {/* If logged in → user dropdown */}
            {user && <UserDropdown user={user} logout={logout} />}

            {/* Support */}
            <button
              onClick={() => setShowSupport(true)}
              className="flex items-center gap-2 bg-linear-to-r 
                from-pink-500 to-purple-500 text-white px-4 py-2 
                rounded-full shadow hover:opacity-90 transition-all"
            >
              <Coffee size={16} /> Support
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-3 w-10 h-10 flex items-center justify-center rounded-full 
                bg-gray-200 dark:bg-gray-800 
                text-gray-700 dark:text-white
                hover:scale-[1.06] hover:bg-gray-300 dark:hover:bg-gray-700 
                transition-all shadow"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700 
              text-gray-700 dark:text-white transition"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0A0A0C]/95 backdrop-blur-md border-t dark:border-white/10 shadow-md">
            <div className="flex flex-col space-y-4 px-6 py-5">

              <MobileLink to="/" label="Home" setMenuOpen={setMenuOpen} />
              <MobileLink to="/courses" label="Courses" setMenuOpen={setMenuOpen} />

              {!user && (
                <>
                  <MobileLink to="/login" label="Login" setMenuOpen={setMenuOpen} />
                  <MobileLink to="/register" label="Sign Up" setMenuOpen={setMenuOpen} />
                </>
              )}

              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-left text-red-500 font-medium"
                >
                  Logout
                </button>
              )}

              <button
                onClick={() => {
                  setShowSupport(true);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 bg-linear-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full shadow"
              >
                <Coffee size={16} /> Support
              </button>

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

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </>
  );
}

//
// Desktop Link Component
//
function NavItem({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
        <Link
      to={to}
      className={`relative text-[15px] font-medium transition-colors
        ${isActive
          ? "text-indigo-600 dark:text-pink-400"
          : "dark:text-white hover:text-indigo-500 dark:hover:text-pink-400"
        }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
      )}
    </Link>
  );
}

//
// Mobile link
//
function MobileLink({ to, label, setMenuOpen }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`
        text-[15px] font-medium
        ${active
          ? "text-indigo-600 dark:text-pink-400"
          : "text-gray-800 dark:text-gray-200"
        }
      `}
    >
      {label}
    </Link>
  );
}

//
// Dropdown for logged-in users
//
function UserDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-200 
          dark:bg-gray-800 text-gray-800 dark:text-gray-100 
          shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition"
      >
        <User size={18} />
        <span>{user?.name || "Account"}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">

          {/* <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Profile
          </Link> */}

          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
