import { useCallback, useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MailOpen,
  CheckCircle2,
  Archive,
  Filter,
  X,
  Phone,
  Globe,
  Mail,
  AlertTriangle,
  TrendingUp,
  Reply,
  Inbox,
  Clock,
  ChevronDown,
  ExternalLink,
  StickyNote,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import client from "../../features/auth/api";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const REASON_OPTIONS = [
  { value: "all", label: "All Reasons" },
  { value: "feedback", label: "Feedback" },
  { value: "bug", label: "Bug Report" },
  { value: "suggestion", label: "Suggestion" },
  { value: "collab", label: "Collaboration" },
];

const PREFERRED_ICONS = {
  email: <Mail size={12} />,
  whatsapp: <Phone size={12} />,
  twitter: <Globe size={12} />,
  linkedin: <Globe size={12} />,
};

// Status config — colors that work beautifully on light backgrounds
const STATUS = {
  unread: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Unread",
    ringHover: "hover:ring-blue-300",
  },
  read: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Read",
    ringHover: "hover:ring-amber-300",
  },
  replied: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Replied",
    ringHover: "hover:ring-emerald-300",
  },
  archived: {
    bg: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: "Archived",
    ringHover: "hover:ring-slate-300",
  },
};

const REASON = {
  feedback: {
    emoji: "💬",
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Feedback",
    avatarBg: "bg-gradient-to-br from-blue-400 to-blue-600",
  },
  bug: {
    emoji: "🐛",
    bg: "bg-rose-100",
    text: "text-rose-700",
    label: "Bug Report",
    avatarBg: "bg-gradient-to-br from-rose-400 to-rose-600",
  },
  suggestion: {
    emoji: "💡",
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Suggestion",
    avatarBg: "bg-gradient-to-br from-amber-400 to-amber-500",
  },
  collab: {
    emoji: "🤝",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Collaboration",
    avatarBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
  },
};

// ── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.read;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.border} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Message Detail Drawer ─────────────────────────────────────────────────
function MessageDrawer({ messageId, onClose, onUpdated, onDeleted }) {
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("message"); // message | notes

  useEffect(() => {
    if (!messageId) return;
    setLoading(true);
    client
      .get(`/admin/contact/${messageId}/`)
      .then((res) => {
        setMsg(res.data);
        setNotes(res.data.admin_notes || "");
      })
      .catch(() => toast.error("Failed to load message"))
      .finally(() => setLoading(false));
  }, [messageId]);

  async function updateStatus(newStatus) {
    try {
      const res = await client.patch(`/admin/contact/${messageId}/`, {
        status: newStatus,
      });
      setMsg(res.data);
      onUpdated(res.data);
      toast.success(`Marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function saveNotes() {
    setSaving(true);
    try {
      const res = await client.patch(`/admin/contact/${messageId}/`, {
        admin_notes: notes,
      });
      setMsg(res.data);
      onUpdated(res.data);
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete message from ${msg?.name}? This cannot be undone.`
      )
    )
      return;
    try {
      await client.delete(`/admin/contact/${messageId}/delete/`);
      toast.success("Message deleted");
      onDeleted(messageId);
      onClose();
    } catch {
      toast.error("Failed to delete message");
    }
  }

  const reason = REASON[msg?.reason] || REASON.feedback;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] h-full flex flex-col bg-white border-l border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
              <div className="space-y-1.5">
                <div className="w-32 h-3.5 bg-slate-100 rounded animate-pulse" />
                <div className="w-24 h-3 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0 ${reason.avatarBg}`}
              >
                {msg?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {msg?.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{msg?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#4b9966]" size={30} />
          </div>
        ) : msg ? (
          <>
            {/* Status strip */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
              <div className="flex items-center gap-2">
                <StatusBadge status={msg.status} />
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${reason.bg} ${reason.text}`}
                >
                  {reason.emoji} {reason.label}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(msg.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-white flex-shrink-0">
              {[
                { key: "message", label: "Message", icon: MessageSquare },
                { key: "notes", label: "Notes", icon: StickyNote },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.key
                      ? "border-[#4b9966] text-[#4b9966]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === "message" ? (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6 space-y-5"
                  >
                    {/* Sender details */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3">
                        Sender Details
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] text-slate-400 mb-1">Email</p>
                          <a
                            href={`mailto:${msg.email}`}
                            className="text-sm text-[#4b9966] hover:underline font-medium truncate block"
                          >
                            {msg.email}
                          </a>
                        </div>
                        {msg.phone && (
                          <div>
                            <p className="text-[11px] text-slate-400 mb-1">Phone</p>
                            <a
                              href={`tel:${msg.phone}`}
                              className="text-sm text-slate-700 hover:text-slate-900 font-medium"
                            >
                              {msg.phone}
                            </a>
                          </div>
                        )}
                        <div>
                          <p className="text-[11px] text-slate-400 mb-1">
                            Prefers reply via
                          </p>
                          <p className="text-sm text-slate-700 font-medium flex items-center gap-1.5 capitalize">
                            <span className="text-slate-400">
                              {PREFERRED_ICONS[msg.preferred_contact]}
                            </span>
                            {msg.preferred_contact_display}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 mb-1">Received</p>
                          <p className="text-sm text-slate-700 font-medium">
                            {new Date(msg.created_at).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message body */}
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3">
                        Message
                      </p>
                      <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap shadow-sm">
                        {msg.message}
                      </div>
                    </div>

                    {/* Quick reply */}
                    <a
                      href={
                        msg.preferred_contact === "whatsapp" && msg.phone
                          ? `https://wa.me/${msg.phone.replace(/\D/g, "")}`
                          : `mailto:${msg.email}?subject=Re: Your message on DevNook`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        background: "linear-gradient(135deg, #4b9966, #38bdf8)",
                      }}
                    >
                      <Reply size={16} />
                      Reply via{" "}
                      {msg.preferred_contact === "whatsapp"
                        ? "WhatsApp"
                        : "Email"}
                      <ExternalLink size={13} className="opacity-70" />
                    </a>

                    {/* Status actions */}
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3">
                        Update Status
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {["read", "replied", "archived", "unread"].map((s) => {
                          const cfg = STATUS[s];
                          const isActive = msg.status === s;
                          return (
                            <button
                              key={s}
                              onClick={() => updateStatus(s)}
                              disabled={isActive}
                              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                                isActive
                                  ? `${cfg.bg} ${cfg.border} ${cfg.text} cursor-default`
                                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {isActive && (
                                <span className="mr-1">✓</span>
                              )}
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-rose-600 border-2 border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition-all"
                    >
                      <Trash2 size={15} />
                      Delete message permanently
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6 space-y-4"
                  >
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Internal notes are private — never shown to the sender.
                    </p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={10}
                      placeholder="Add private notes, follow-up reminders, context..."
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#4b9966] text-sm text-slate-800 placeholder:text-slate-400 px-4 py-3 rounded-xl outline-none transition-all resize-none leading-relaxed"
                    />
                    <button
                      onClick={saveNotes}
                      disabled={saving}
                      className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-[#4b9966]/30 text-[#4b9966] hover:bg-[#4b9966]/5 hover:border-[#4b9966]/50 transition-all disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Notes"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────────
export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [msgsRes, statsRes] = await Promise.all([
        client.get("/admin/contact/"),
        client.get("/admin/contact/stats/"),
      ]);
      setMessages(
        Array.isArray(msgsRes.data)
          ? msgsRes.data
          : msgsRes.data.results || []
      );
      setStats(statsRes.data);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    let out = [...messages];
    const q = search.trim().toLowerCase();
    if (q)
      out = out.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
      );
    if (statusFilter !== "all") out = out.filter((m) => m.status === statusFilter);
    if (reasonFilter !== "all") out = out.filter((m) => m.reason === reasonFilter);
    return out;
  }, [messages, search, statusFilter, reasonFilter]);

  useEffect(() => setPage(1), [search, statusFilter, reasonFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function handleUpdated(updated) {
    setMessages((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
    );
  }

  function handleDeleted(id) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  const STAT_CARDS = stats
    ? [
        {
          label: "Total Messages",
          value: stats.total,
          icon: Inbox,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          valueColor: "text-slate-900",
          trend: null,
        },
        {
          label: "Unread",
          value: stats.unread,
          icon: MailOpen,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          valueColor: "text-amber-600",
          trend: stats.unread > 0 ? "needs attention" : null,
        },
        {
          label: "Replied",
          value: stats.replied,
          icon: CheckCircle2,
          iconBg: "bg-emerald-100",
          iconColor: "text-emerald-600",
          valueColor: "text-emerald-600",
          trend: null,
        },
        {
          label: "This Week",
          value: stats.this_week ?? stats.total,
          icon: TrendingUp,
          iconBg: "bg-violet-100",
          iconColor: "text-violet-600",
          valueColor: "text-slate-900",
          trend: null,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1.5"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Messages
              </h1>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                Contact submissions from DevNook users
                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm font-semibold"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STAT_CARDS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                    <s.icon size={18} className={s.iconColor} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${s.valueColor}`}>{s.value}</p>
                {s.trend && (
                  <p className="text-xs text-amber-500 font-medium mt-1">{s.trend}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── FILTERS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-slate-100"
        >
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#4b9966] focus:bg-white outline-none transition-all"
                placeholder="Search by name or email..."
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status pills */}
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTIONS.map((s) => {
                const active = statusFilter === s.value;
                const cfg = STATUS[s.value];
                return (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                      active
                        ? s.value === "all"
                          ? "bg-slate-800 text-white border-slate-800"
                          : `${cfg.bg} ${cfg.border} ${cfg.text}`
                        : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Reason dropdown */}
            <div className="relative">
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm text-slate-700 font-medium focus:border-[#4b9966] focus:bg-white outline-none transition-all cursor-pointer"
              >
                {REASON_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-xs text-slate-400 font-medium mb-4 px-1">
          Showing {paginated.length} of {filtered.length} messages
        </p>

        {/* ── TABLE ── */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-[#4b9966]" size={36} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm"
          >
            <Inbox className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-slate-700 font-semibold mb-1">No messages found</p>
            <p className="text-slate-400 text-sm">
              {search
                ? `No results for "${search}"`
                : "Try adjusting your filters"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
          >
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-6 py-3.5 border-b border-slate-100 bg-slate-50">
              {["Sender", "Reason", "Preferred", "Status", "Date"].map(
                (h) => (
                  <span
                    key={h}
                    className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold"
                  >
                    {h}
                  </span>
                )
              )}
            </div>

            {/* Rows */}
            {paginated.map((msg, idx) => {
              const reason = REASON[msg.reason] || REASON.feedback;
              const isUnread = msg.status === "unread";

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setOpenId(msg.id)}
                  className={`grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-50 cursor-pointer items-center transition-all duration-150 hover:bg-slate-50 group ${
                    isUnread ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  {/* Sender */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${reason.avatarBg}`}
                    >
                      {msg.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm truncate transition-colors group-hover:text-[#4b9966] ${
                          isUnread
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-700"
                        }`}
                      >
                        {msg.name}
                        {isUnread && (
                          <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 align-middle" />
                        )}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {msg.email}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${reason.bg} ${reason.text}`}
                  >
                    {reason.emoji} {reason.label}
                  </span>

                  {/* Preferred contact */}
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium capitalize">
                    <span className="text-slate-400">
                      {PREFERRED_ICONS[msg.preferred_contact]}
                    </span>
                    {msg.preferred_contact_display}
                  </span>

                  {/* Status */}
                  <StatusBadge status={msg.status} />

                  {/* Date */}
                  <span className="text-xs text-slate-400 whitespace-nowrap font-medium">
                    {new Date(msg.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  page === p
                    ? "text-white shadow-md"
                    : "bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={
                  page === p
                    ? {
                        background:
                          "linear-gradient(135deg, #4b9966, #38bdf8)",
                        border: "none",
                      }
                    : {}
                }
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </div>

      {/* ── MESSAGE DRAWER ── */}
      <AnimatePresence>
        {openId && (
          <MessageDrawer
            messageId={openId}
            onClose={() => setOpenId(null)}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}