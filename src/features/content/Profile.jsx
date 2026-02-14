import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useAuth from "../../hooks/useAuth";
import client from "../auth/api";

export default function Profile() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Text colors helper
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";
  const inputBg = theme === "dark" ? "bg-slate-950 border-slate-700 focus:border-emerald-500" : "bg-white border-slate-200 focus:border-emerald-500";

  // Form State
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when typing
    if (message.text) setMessage({ type: "", text: "" });
  };

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      // Adjust endpoint to match your Django URL
      await client.post("/auth/change-password/", {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      
      setMessage({ type: "success", text: "Password updated successfully!" });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const errorText = error.response?.data?.detail || "Failed to update password. Check your current password.";
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-6 ${theme === "dark" ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10">
          <h1 className={`text-3xl font-bold ${textPrimary}`}>Account Settings</h1>
          <p className={`mt-2 ${textSecondary}`}>Manage your personal details and security.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* === LEFT COLUMN: User Identity Card === */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-1 h-fit p-8 rounded-3xl border shadow-sm
              ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <div className="flex flex-col items-center text-center">
              {/* Avatar Generator */}
              <div className="relative mb-6 group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-emerald-500/20">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                {/* Optional: Add Photo Edit Overlay here if you implement image upload */}
              </div>

              <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>
                {user?.name || "User Name"}
              </h2>
              <p className={`text-sm font-medium px-3 py-1 rounded-full mb-6
                ${theme === "dark" ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                Student Account
              </p>

              <div className="w-full space-y-4 text-left">
                <div className={`p-4 rounded-2xl flex items-center gap-4
                  ${theme === "dark" ? "bg-slate-950/50" : "bg-slate-50"}`}>
                  <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-slate-800 text-slate-300" : "bg-white text-slate-600 shadow-sm"}`}>
                    <Mail size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-medium uppercase tracking-wider mb-0.5 ${textSecondary}`}>Email Address</p>
                    <p className={`text-sm font-semibold truncate ${textPrimary}`}>{user?.email}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl flex items-center gap-4
                  ${theme === "dark" ? "bg-slate-950/50" : "bg-slate-50"}`}>
                  <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-slate-800 text-slate-300" : "bg-white text-slate-600 shadow-sm"}`}>
                    <User size={18} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-0.5 ${textSecondary}`}>Member Since</p>
                    <p className={`text-sm font-semibold ${textPrimary}`}>
                      {new Date(user?.date_joined || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* === RIGHT COLUMN: Security Form === */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`lg:col-span-2 p-8 md:p-10 rounded-3xl border shadow-sm
              ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${textPrimary}`}>Security</h3>
                <p className={`text-sm ${textSecondary}`}>Update your password securely</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
              {/* Feedback Message */}
              <AnimatePresence mode="wait">
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl flex items-start gap-3 text-sm
                      ${message.type === "success" 
                        ? (theme === "dark" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200")
                        : (theme === "dark" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-rose-50 text-rose-700 border border-rose-200")
                      }`}
                  >
                    {message.type === "success" ? <CheckCircle2 size={18} className="mt-0.5" /> : <AlertCircle size={18} className="mt-0.5" />}
                    <p>{message.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current Password */}
              <div className="space-y-2">
                <label className={`text-sm font-semibold ${textPrimary}`}>Current Password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} size={18} />
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 outline-none transition-all ${inputBg} ${textPrimary}`}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility('current')}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 hover:text-emerald-500 transition-colors ${textSecondary}`}
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={`h-px w-full ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`} />

              {/* New Password */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${textPrimary}`}>New Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} size={18} />
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 outline-none transition-all ${inputBg} ${textPrimary}`}
                      placeholder="Min 6 chars"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility('new')}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 hover:text-emerald-500 transition-colors ${textSecondary}`}
                    >
                      {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${textPrimary}`}>Confirm Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} size={18} />
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-2 outline-none transition-all ${inputBg} ${textPrimary}`}
                      placeholder="Repeat password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility('confirm')}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 hover:text-emerald-500 transition-colors ${textSecondary}`}
                    >
                      {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}