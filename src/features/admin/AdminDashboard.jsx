/* eslint-disable no-unused-vars */
import React from "react";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";
import { LogOut, BookOpen, Layers, Bot } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome back, <span className="font-semibold">{user?.email || "User"}</span>
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Cards Grid */}
        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Card 1: Languages */}
          <DashboardCard
            icon={<BookOpen className="w-6 h-6 text-indigo-500" />}
            title="Languages"
            description="Create & manage courses or topics by programming language."
          />

          {/* Card 2: Topics */}
          <DashboardCard
            icon={<Layers className="w-6 h-6 text-emerald-500" />}
            title="Topics"
            description="Add topics, organize modules, and enrich content."
          />

          {/* Card 3: AI Tools */}
          <DashboardCard
            icon={<Bot className="w-6 h-6 text-pink-500" />}
            title="AI Tools"
            description="Summarize lessons, generate quizzes, and more with AI."
          />
        </motion.div>
      </div>
    </div>
  );
}

// 🔹 Reusable Dashboard Card Component
function DashboardCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 250 }}
      className="p-6 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-gray-800/40 shadow-lg hover:shadow-2xl border border-white/20 dark:border-gray-700/30 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-inner">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}
