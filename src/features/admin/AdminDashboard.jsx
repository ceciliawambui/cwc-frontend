/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, BookOpen, Layers, Bot, Menu, X, Home, Users,
  Settings, LineChart, Search, Edit3, Trash2, Folder,
  MessageCircle, ChevronRight, TrendingUp, BarChart2,
  ShieldCheck, User as UserIcon, Bell, ArrowUpRight,
  Newspaper, Tag, LayoutDashboard, RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer, Line, LineChart as Chart,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar,
} from "recharts";
import ThemeToggle from "../../components/ThemeToggle";
import AdminCourses from "./AdminCourses";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import client from "../../features/auth/api";
import AdminTopics from "./AdminTopics";
import AdminCategories from "./AdminCategories";
import AdminBlogs from "./AdminBlogs";
import AdminMessages from "./AdminMessages";
import { LineChart as LineChartIcon } from "lucide-react";

// ── Sidebar nav config ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { name: "Dashboard",  icon: LayoutDashboard, section: "Dashboard"  },
  { name: "Categories", icon: Tag,              section: "Categories" },
  { name: "Courses",    icon: BookOpen,         section: "Courses"    },
  { name: "Topics",     icon: Layers,           section: "Topics"     },
  { name: "Blogs",      icon: Newspaper,        section: "Blogs"      },
  { name: "Messages",   icon: MessageCircle,    section: "Messages"   },
  { name: "Users",      icon: Users,            section: "Users"      },
  { name: "Settings",   icon: Settings,         section: "Settings"   },
];

// ── Accent palette ──────────────────────────────────────────────────────────
const GREEN  = "#4b9966";
const GREEN_L = "rgba(75,153,102,0.1)";
const GREEN_B = "rgba(75,153,102,0.2)";

// ═══════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-red-400" />
          </div>
          <p className="text-slate-700 font-bold text-lg">Access Denied</p>
          <p className="text-slate-400 text-sm mt-1">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        logout={logout}
        user={user}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          activeSection={activeSection}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 md:px-10 max-w-screen-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === "Dashboard"  && <DashboardOverview />}
                {activeSection === "Categories" && <AdminCategories />}
                {activeSection === "Courses"    && <AdminCourses />}
                {activeSection === "Topics"     && <AdminTopics />}
                {activeSection === "Blogs"      && <AdminBlogs />}
                {activeSection === "Messages"   && <AdminMessages />}
                {activeSection === "Users"      && <UserManagement />}
                {activeSection === "Settings"   && <SettingsPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ sidebarOpen, setSidebarOpen, activeSection, setActiveSection, logout, user }) {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 200 }}
      className={`
        fixed md:sticky top-0 z-30 h-screen w-64 flex flex-col
        bg-white border-r border-slate-100 shadow-sm
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${GREEN}, #38bdf8)` }}
          >
            D
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            DevNook
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
        >
          <X size={16} />
        </button>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-50">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "A")}&background=4b9966&color=fff&size=64`}
            alt="avatar"
            className="w-8 h-8 rounded-lg flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{user?.email || "admin"}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold px-3 mb-3">
          Navigation
        </p>
        {NAV_LINKS.map((item) => {
          const Icon = item.icon;
          const active = item.section === activeSection;
          return (
            <motion.button
              key={item.name}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveSection(item.section); setSidebarOpen(false); }}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-150 group relative
                ${active
                  ? "text-white shadow-md"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }
              `}
              style={active ? { background: `linear-gradient(135deg, ${GREEN}, #38bdf8)` } : {}}
            >
              <Icon size={17} className={active ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
              {item.name}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <ChevronRight size={14} className="text-white/60" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </motion.aside>
  );
}

// ── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ sidebarOpen, setSidebarOpen, user, activeSection }) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 py-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
            {activeSection}
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">DevNook Admin Panel</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-100">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "A")}&background=4b9966&color=fff&size=64`}
            alt="avatar"
            className="w-8 h-8 rounded-xl border-2 border-slate-100"
          />
          <span className="text-sm font-semibold text-slate-600 hidden lg:block">
            {user?.email?.split("@")[0] || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-600">
          <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
          {item.name}: <span className="font-semibold text-slate-800">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
          <Icon size={16} className={iconColor} />
        </div>
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Recent list card ─────────────────────────────────────────────────────────
function RecentCard({ title, icon: Icon, iconColor, iconBg, items, renderItem }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
      </div>
      <ul className="divide-y divide-slate-50 space-y-0">
        {(items || []).length === 0 ? (
          <li className="py-4 text-center text-slate-400 text-xs">No data yet</li>
        ) : (
          items.map((item, i) => (
            <li key={item.id || i} className="py-2.5">
              {renderItem(item)}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard Overview
// ═══════════════════════════════════════════════════════════════════════════
function DashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalAdmins: 0, totalCategories: 0,
    totalCourses: 0, totalTopics: 0, totalBlogs: 0, totalMessages: 0,
    recentUsers: [], recentCategories: [], recentCourses: [],
    recentTopics: [], weeklyActivity: [], monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await client.get("/admin/dashboard/stats/");
      const data = res.data;
      setStats({
        totalUsers:       data.totals?.users      ?? 0,
        totalCourses:     data.totals?.courses    ?? 0,
        totalTopics:      data.totals?.topics     ?? 0,
        totalCategories:  data.totals?.categories ?? 0,
        totalBlogs:       data.totals?.blogs      ?? 0,
        totalMessages:    data.totals?.messages   ?? 0,
        weeklyActivity:   data.weeklyActivity     ?? [],
        monthlyTrends:    data.monthlyTrends      ?? [],
        recentUsers:      data.recent?.users      ?? [],
        recentCategories: data.recent?.categories ?? [],
        recentCourses:    data.recent?.courses    ?? [],
        recentTopics:     data.recent?.topics     ?? [],
      });
    } catch {
      toast.error("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const STAT_CARDS = [
    {
      icon: Users,       label: "Total Users",       value: stats.totalUsers,
      sub: "Registered learners",
      iconBg: "bg-blue-50", iconColor: "text-blue-600",
    },
    {
      icon: Tag,         label: "Categories",        value: stats.totalCategories,
      sub: "Learning categories",
      iconBg: "bg-violet-50", iconColor: "text-violet-600",
    },
    {
      icon: BookOpen,    label: "Courses",            value: stats.totalCourses,
      sub: "Published & active",
      iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
    },
    {
      icon: Layers,      label: "Topics",             value: stats.totalTopics,
      sub: "Learning resources",
      iconBg: "bg-amber-50", iconColor: "text-amber-600",
    },
    {
      icon: Newspaper,   label: "Blogs",              value: stats.totalBlogs,
      sub: "Published articles",
      iconBg: "bg-pink-50", iconColor: "text-pink-600",
    },
    {
      icon: MessageCircle, label: "Messages",         value: stats.totalMessages,
      sub: "User submissions",
      iconBg: "bg-cyan-50", iconColor: "text-cyan-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton header */}
        <div className="h-8 w-56 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="text-3xl font-bold text-slate-900"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time insights for DevNook platform
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white transition-all text-sm font-semibold"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat cards — 6 across */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.06} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly line chart */}
        <ChartCard title="Weekly Activity" icon={TrendingUp} iconColor="text-emerald-600">
          <ResponsiveContainer width="100%" height={260}>
            <Chart data={stats.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#64748b" }}
              />
              <Line type="monotone" dataKey="users"      stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }}  name="Users"      />
              <Line type="monotone" dataKey="categories" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: "#ef4444" }}  name="Categories" />
              <Line type="monotone" dataKey="courses"    stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3, fill: "#ec4899" }}  name="Courses"    />
              <Line type="monotone" dataKey="topics"     stroke={GREEN}   strokeWidth={2.5} dot={{ r: 3, fill: GREEN }}      name="Topics"     />
            </Chart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly bar chart */}
        <ChartCard title="Monthly Growth" icon={BarChart2} iconColor="text-blue-600">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthlyTrends} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12, color: "#64748b" }} />
              <Bar dataKey="users"      fill="#6366f1" name="Users"      radius={[4,4,0,0]} />
              <Bar dataKey="categories" fill="#ef4444" name="Categories" radius={[4,4,0,0]} />
              <Bar dataKey="courses"    fill="#ec4899" name="Courses"    radius={[4,4,0,0]} />
              <Bar dataKey="topics"     fill={GREEN}   name="Topics"     radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent activity row — 4 cols */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Recent Activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <RecentCard
            title="Recent Users"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            items={stats.recentUsers}
            renderItem={(u) => (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || u.email || "U")}&background=e2e8f0&color=64748b&size=32`}
                    className="w-7 h-7 rounded-lg flex-shrink-0"
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{u.username || "Unnamed"}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                  u.role === "admin"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {u.role}
                </span>
              </div>
            )}
          />

          <RecentCard
            title="Recent Categories"
            icon={Tag}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            items={stats.recentCategories}
            renderItem={(cat) => (
              <div>
                <p className="text-xs font-semibold text-slate-700">{cat.title}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {cat.description || "No description"}
                </p>
              </div>
            )}
          />

          <RecentCard
            title="Recent Courses"
            icon={BookOpen}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            items={stats.recentCourses}
            renderItem={(c) => (
              <div>
                <p className="text-xs font-semibold text-slate-700 truncate">{c.title}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {c.description || "No description"}
                </p>
              </div>
            )}
          />

          <RecentCard
            title="Recent Topics"
            icon={Layers}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            items={stats.recentTopics}
            renderItem={(t) => (
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-slate-700 truncate">{t.title}</p>
                <p className="text-[10px] text-slate-400 flex-shrink-0">
                  {new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// User Management
// ═══════════════════════════════════════════════════════════════════════════
function UserManagement() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get("/users/");
      setUsers(Array.isArray(res.data?.results) ? res.data.results : []);
    } catch {
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await client.delete(`/api/users/${id}/`);
      toast.success("User deleted.");
      setUsers((p) => p.filter((u) => u.id !== id));
    } catch { toast.error("Failed to delete user."); }
  };

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "learner" : "admin";
    setUpdating(id);
    try {
      await client.patch(`/api/users/${id}/`, { role: newRole });
      toast.success(`Role changed to ${newRole}.`);
      fetchUsers();
    } catch { toast.error("Failed to update role."); }
    finally { setUpdating(null); }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = safeUsers.filter((u) => {
    const q = search.toLowerCase();
    return (u.name || u.username || "").toLowerCase().includes(q)
      || (u.email || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Georgia', serif" }}>
            Users
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage platform members and their roles</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#4b9966] outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-6 py-3.5 bg-slate-50 border-b border-slate-100">
          {["Name", "Email", "Role", "Actions"].map((h, i) => (
            <span key={h} className={`text-[11px] text-slate-400 uppercase tracking-widest font-semibold ${i === 3 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-3 text-slate-200" size={40} />
            <p className="text-slate-500 font-semibold">No users found</p>
          </div>
        ) : (
          filtered.map((u, idx) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-50 items-center hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || u.email || "U")}&background=e2e8f0&color=64748b&size=32`}
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  alt=""
                />
                <p className="text-sm font-semibold text-slate-700 truncate">{u.name || u.username || "Unnamed"}</p>
              </div>
              <p className="text-sm text-slate-500 truncate">{u.email || "—"}</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                u.role === "admin"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}>
                {u.role}
              </span>
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => handleRoleToggle(u.id, u.role)}
                  disabled={updating === u.id}
                  className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-50"
                  title="Toggle Role"
                >
                  <ShieldCheck size={16} />
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Settings Panel
// ═══════════════════════════════════════════════════════════════════════════
function SettingsPanel() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Georgia', serif" }}>
          Settings
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">Configure your platform preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-3">
          General
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              System Name
            </label>
            <input
              type="text"
              defaultValue="DevNook"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm text-slate-800 focus:border-[#4b9966] focus:bg-white outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Default Language
            </label>
            <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm text-slate-800 focus:border-[#4b9966] focus:bg-white outline-none transition-all font-medium">
              <option>English</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #4b9966, #38bdf8)" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}