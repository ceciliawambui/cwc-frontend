/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";
import {
  LogOut,
  BookOpen,
  Layers,
  Bot,
  Menu,
  X,
  Home,
  Users,
  Settings,
  LineChart,
  Search,
  Edit3,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  Line,
  LineChart as Chart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ThemeToggle from "../../components/ThemeToggle";
import AdminCourses from "./AdminCourses";
import { useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import client from "../../features/auth/api";
import {
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import AdminTopics from "./AdminTopics";





export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");

  const navLinks = [
    { name: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Languages", icon: <BookOpen className="w-5 h-5" /> },
    { name: "AI Tools", icon: <Bot className="w-5 h-5" /> },
    { name: "Users", icon: <Users className="w-5 h-5" /> },
    { name: "Settings", icon: <Settings className="w-5 h-5" /> },
    { name: "Courses", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Topics", icon: <Layers className="w-5 h-5" /> },

  ];


  const users = [
    { id: 1, name: "Jane Doe", email: "jane@example.com", role: "Instructor" },
    { id: 2, name: "John Smith", email: "john@example.com", role: "Student" },
    { id: 3, name: "Alice Brown", email: "alice@example.com", role: "Admin" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navLinks={navLinks}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        logout={logout}
      />


      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
        />

        <main className="flex-1 px-6 py-8 md:px-10">
          {activeSection === "Dashboard" && <DashboardOverview />}
          {activeSection === "Users" && <UserManagement users={users} />}
          {activeSection === "Settings" && <SettingsPanel />}
          {activeSection === "Courses" && <AdminCourses />}
          {activeSection === "Topics" && <AdminTopics />}
        </main>
      </div>
    </div>
  );
}

/* 🔹 Sidebar Component */
function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  navLinks,
  activeSection,
  setActiveSection,
  logout,
}) {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed md:static z-30 inset-y-0 left-0 w-64 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } bg-white/80 dark:bg-gray-900/70 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 shadow-xl flex flex-col transition-transform duration-300`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          KnowledgeHub
        </h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navLinks.map((item, idx) => {
          const isActive = item.name === activeSection;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, x: 4 }}
              onClick={() => setActiveSection(item.name)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                }`}
            >
              <span className="text-indigo-500">{item.icon}</span>
              {item.name}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}

/* 🔹 Top Bar Component */
function TopBar({ sidebarOpen, setSidebarOpen, user }) {
  return (
    <header className="sticky top-0 z-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-gray-700 dark:text-gray-300"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {user?.email || "admin@system.com"}
        </span>
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.email || "Admin"
          )}&background=6366F1&color=fff`}
          alt="User Avatar"
          className="w-9 h-9 rounded-full border border-indigo-400 shadow-sm"
        />
      </div>
    </header>
  );
}



/* === Reusable Stat Card === */
function DashboardCard({ icon, title, value, description }) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-700/30 text-indigo-600 dark:text-indigo-300">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* === Dashboard Overview === */
function DashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalCourses: 0,
    recentUsers: [],
    recentCourses: [],
    weeklyActivity: [],
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [userRes, courseRes, topicRes] = await Promise.all([
          client.get("/api/users/"),
          client.get("/api/courses/"),
          client.get("/api/topics/"),
        ]);

        const users = userRes.data || [];
        const courses = courseRes.data || [];
        const topics = topicRes.data || [];

        // --- Totals ---
        const totalUsers = users.length;
        const totalTopics = topics.length;
        const totalAdmins = users.filter((u) => u.role === "admin" || u.is_staff).length;
        const totalCourses = courses.length;

        // --- Weekly Activity (Mocked for Display) ---
        const weeklyActivity = Array.from({ length: 7 }).map((_, i) => ({
          day: `Day ${i + 1}`,
          users: Math.floor(Math.random() * 200) + 50,
          courses: Math.floor(Math.random() * 50) + 10,
        }));

        // --- Monthly Trends (based on created_at) ---
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const userMonthCount = Array(12).fill(0);
        const courseMonthCount = Array(12).fill(0);

        users.forEach((u) => {
          const date = new Date(u.created_at);
          if (!isNaN(date)) userMonthCount[date.getMonth()]++;
        });

        courses.forEach((c) => {
          const date = new Date(c.created_at);
          if (!isNaN(date)) courseMonthCount[date.getMonth()]++;
        });

        const monthlyTrends = months.map((m, i) => ({
          month: m,
          users: userMonthCount[i],
          courses: courseMonthCount[i],
        }));

        setStats({
          totalUsers,
          totalAdmins,
          totalCourses,
          recentUsers: users.slice(0, 5),
          recentCourses: courses.slice(0, 5),
          weeklyActivity,
          monthlyTrends,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <Toaster position="top-right" />

      {/* === Header === */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <LineChartIcon className="w-6 h-6 text-indigo-500" />
          Dashboard Analytics
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Real-time insights for platform performance
        </p>
      </div>

      {/* === Stats === */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          Loading analytics...
        </p>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DashboardCard
              icon={<Users className="w-7 h-7" />}
              title="Total Users"
              value={stats.totalUsers}
              description="Registered on the platform"
            />
            {/* <DashboardCard
              icon={<ShieldCheck className="w-7 h-7" />}
              title="Admins"
              value={stats.totalAdmins}
              description="Administrative accounts"
            /> */}
            <DashboardCard
              icon={<BookOpen className="w-7 h-7" />}
              title="Courses"
              value={stats.totalCourses}
              description="Active and published courses"
            />
            <DashboardCard
              icon={<Layers className="w-7 h-7" />}
              title="Topics"
              value={stats.totalTopics}
              description="Learning topics available"
            />

          </motion.div>

          {/* === Weekly Line Chart === */}
          <div className="rounded-2xl p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-md border border-gray-200 dark:border-gray-700 mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-indigo-500" /> Weekly Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <Chart data={stats.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />

                <Tooltip
                  // ⚡ Use safe props, no destructuring from undefined
                  wrapperStyle={{ outline: "none" }}
                  content={(tooltipProps) => {
                    if (!tooltipProps || !tooltipProps.active || !tooltipProps.payload?.length) return null;
                    const { label, payload } = tooltipProps;

                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{label || "—"}</p>
                        {payload.map((item, idx) => (
                          <p key={idx} className="text-gray-600 dark:text-gray-300">
                            {item.name || "Data"}: {item.value ?? 0}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />

                <Legend />
                <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={3} dot={{ r: 5 }} name="Users Joined" />
                <Line type="monotone" dataKey="courses" stroke="#EC4899" strokeWidth={3} dot={{ r: 5 }} name="Courses Added" />
              </Chart>
            </ResponsiveContainer>


          </div>

          {/* === Monthly Bar Chart === */}
          <div className="rounded-2xl p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-md border border-gray-200 dark:border-gray-700 mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bar className="w-5 h-5 text-pink-500" /> Monthly Growth (Users vs Courses)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />

                <Tooltip
                  wrapperStyle={{ outline: "none" }}
                  content={(tooltipProps) => {
                    if (!tooltipProps || !tooltipProps.active || !tooltipProps.payload?.length) return null;
                    const { label, payload } = tooltipProps;

                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{label || "—"}</p>
                        {payload.map((item, idx) => (
                          <p key={idx} className="text-gray-600 dark:text-gray-300">
                            {item.name || "Data"}: {item.value ?? 0}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />

                <Legend />
                <Bar dataKey="users" fill="#6366F1" name="Users" radius={[6, 6, 0, 0]} />
                <Bar dataKey="courses" fill="#EC4899" name="Courses" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* === Recent Activity === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Users */}
            <div className="rounded-2xl bg-white/70 dark:bg-gray-800/50 p-6 backdrop-blur-xl shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Users
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentUsers.map((u) => (
                  <li key={u.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {u.username || "Unnamed"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${u.role === "admin"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700/30 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300"
                        }`}
                    >
                      {u.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Courses */}
            <div className="rounded-2xl bg-white/70 dark:bg-gray-800/50 p-6 backdrop-blur-xl shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Courses
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentCourses.map((c) => (
                  <li key={c.id} className="py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{c.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {c.description || "No description available"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            {/* Topics */}
            <div className="rounded-2xl bg-white/70 dark:bg-gray-800/50 p-6 backdrop-blur-xl shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Topics
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {(stats.recentTopics || []).map((t) => (
                  <li key={t.id} className="py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </>
      )}
    </div>
  );
}




function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // --- Fetch Users ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get("/api/users/");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users (401 or server error).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Delete User ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await client.delete(`/api/users/${id}/`);
      toast.success("User deleted successfully.");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  // --- Toggle Role ---
  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "learner" : "admin";
    setUpdating(id);
    try {
      await client.patch(`/api/users/${id}/`, { role: newRole });
      toast.success(`Role changed to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role.");
    } finally {
      setUpdating(null);
    }
  };

  // --- Safe Filtering ---
  const filtered = users.filter((u) => {
    const name = u.name || u.username || "";
    const email = u.email || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-gray-800/50 p-6 backdrop-blur-xl shadow-md border border-gray-200 dark:border-gray-700">
      <Toaster position="top-right" />

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          User Management
        </h2>

        <div className="relative w-full sm:w-1/2 max-w-md mx-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6">
          Loading users...
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="px-4">Email</th>
                <th className="px-4">Role</th>
                <th className="text-right px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition"
                >
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-indigo-500" />{" "}
                    {u.name || u.username || "Unnamed User"}
                  </td>
                  <td className="px-4">{u.email || "—"}</td>
                  <td className="px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${u.role === "admin"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700/30 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300"
                        }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="text-right px-4 space-x-2">
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      disabled={updating === u.id}
                      className="text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
                      title="Toggle Role"
                    >
                      <ShieldCheck size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



/* 🔹 Settings Section */
function SettingsPanel() {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-gray-800/50 p-6 backdrop-blur-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        System Settings
      </h2>

      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          System Name
        </label>
        <input
          type="text"
          defaultValue="Knowledge Hub"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/50 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          Default Language
        </label>
        <select className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/50 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>English</option>
          <option>French</option>
          <option>Spanish</option>
        </select>
      </div>

      <button className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md">
        Save Changes
      </button>
    </div>
  );
}

