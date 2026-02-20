import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import useAuth from "../hooks/useAuth";
import { UserCircle } from "lucide-react";
import {
  Sun,
  Moon,
  Menu,
  X,
  Coffee,
  User,
  LogOut,
  ChevronDown,
  Terminal,
  LayoutDashboard
} from "lucide-react";
import SupportModal from "./SupportModal";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for extra glassiness
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on admin dashboard
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b
          ${scrolled
            ? "backdrop-blur-xl shadow-sm"
            : "backdrop-blur-md bg-transparent"
          }
          ${theme === "dark"
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

          {/* === LOGO === */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className={`p-2 rounded-xl transition-colors
              ${theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
            >
              <Terminal size={20} strokeWidth={2.5} />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors
              ${theme === "dark" ? "text-white group-hover:text-emerald-400" : "text-slate-900 group-hover:text-emerald-600"}`}
            >
              DevNook
            </span>
          </Link>

          {/* === DESKTOP MENU === */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <NavItem to="/" label="Home" theme={theme} />
              <NavItem to="/categories" label="Categories" theme={theme} />
              <NavItem to="/courses" label="Courses" theme={theme} />
              <NavItem to="/topics" label="Topics" theme={theme} />
              <NavItem to="/blogs" label="Blogs" theme={theme} />
              <NavItem to="/contact" label="Contact" theme={theme} />

              {user && (
                <NavItem to="/dashboard" label="Library" theme={theme} />
              )}
            </div>


            <div className={`h-6 w-px ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-full transition-all duration-300 hover:rotate-12
                  ${theme === "dark"
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Support Button */}
              <button
                onClick={() => setShowSupport(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
                  ${theme === "dark"
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <Coffee size={16} className="text-emerald-500" />
                <span>Support</span>
              </button>

              {/* Auth Section */}
              {!user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors
                      ${theme === "dark" ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <UserDropdown user={user} logout={logout} theme={theme} />
              )}
            </div>
          </div>

          {/* === MOBILE TOGGLE === */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors
              ${theme === "dark" ? "text-slate-200 hover:bg-slate-800" : "text-slate-800 hover:bg-slate-100"}`}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* === MOBILE MENU === */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t overflow-hidden
                ${theme === "dark"
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200"
                }`}
            >
              <div className="px-6 py-6 flex flex-col space-y-4">
                <MobileLink to="/" label="Home" setMenuOpen={setMenuOpen} theme={theme} />
                <MobileLink to="/categories" label="Categories" setMenuOpen={setMenuOpen} theme={theme} />
                <MobileLink to="/courses" label="Courses" setMenuOpen={setMenuOpen} theme={theme} />
                <MobileLink to="/blogs" label="Blogs" setMenuOpen={setMenuOpen} theme={theme} />
                <MobileLink to="/contact" label="Contact" setMenuOpen={setMenuOpen} theme={theme} />
                {user && (
                  <MobileLink
                    to="/dashboard"
                    label="Library"
                    setMenuOpen={setMenuOpen}
                    theme={theme}
                  />
                )}


                <div className={`h-px w-full my-4 ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`} />

                {!user ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className={`w-full text-center py-3 rounded-xl font-semibold border
                        ${theme === "dark"
                          ? "border-slate-700 text-slate-300"
                          : "border-slate-200 text-slate-700"}`}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center py-3 rounded-xl font-semibold bg-emerald-600 text-white"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <span className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full text-left px-2 py-2 text-rose-500 font-medium text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </>
  );
}

// === HELPER COMPONENTS ===

function NavItem({ to, label, theme }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link to={to} className="relative group py-2">
      <span className={`text-sm font-medium transition-colors duration-300
        ${isActive
          ? (theme === "dark" ? "text-emerald-400" : "text-emerald-600")
          : (theme === "dark" ? "text-slate-400 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-900")
        }`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-emerald-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </Link>
  );
}

function MobileLink({ to, label, setMenuOpen, theme }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`block text-lg font-medium transition-colors
        ${isActive
          ? "text-emerald-500"
          : (theme === "dark" ? "text-slate-400" : "text-slate-600")
        }
      `}
    >
      {label}
    </Link>
  );
}

function UserDropdown({ user, logout, theme }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-1 py-1 pr-3 rounded-full border transition-all
          ${theme === "dark"
            ? "bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600"
            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white">
          {user.name?.charAt(0) || "U"}
        </div>
        <span className="text-xs font-semibold max-w-[80px] truncate">{user.name}</span>
        <ChevronDown size={14} className="opacity-50" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden
                ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
            >
              <div className={`px-4 py-3 border-b text-xs
                ${theme === "dark" ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"}`}>
                Signed in as <br />
                <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {user.email}
                </span>
              </div>

              <div className="p-1">
                {/* NEW PROFILE LINK */}
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                     ${theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <UserCircle size={16} />
                  My Profile
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                     ${theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <div className={`h-px my-1 ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`} />

                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                     ${theme === "dark" ? "text-rose-400 hover:bg-rose-900/20" : "text-rose-600 hover:bg-rose-50"}`}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}