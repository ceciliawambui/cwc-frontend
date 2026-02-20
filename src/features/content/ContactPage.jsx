import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Lightbulb,
  Handshake,
  Send,
  ChevronDown,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Linkedin,
  Twitter,
  MessageCircle,
} from "lucide-react";
import client from "../../features/auth/api";
import { useTheme } from "../../context/ThemeContext";

// ─── Contact Details ──────────────────────────────────────────────────────
const CONTACT_INFO = {
  email: "devnook1@gmail.com",
  whatsapp: "+254716894482",
  whatsappDisplay: "+254 716 894 482",
  x: "https://x.com/w_a_m_b_u_i_",
  twitterHandle: "@w_a_m_b_u_i_",
  linkedin: "https://www.linkedin.com/in/cecilia-wambui-93aa73183/",
  linkedinHandle: "Cecilia Wambui",
};

const REASONS = [
  {
    id: "feedback",
    label: "General Feedback",
    desc: "Share your thoughts on the platform",
    icon: MessageSquare,
  },
  {
    id: "bug",
    label: "Report a Bug",
    desc: "Something broken? Let us know",
    icon: AlertCircle,
  },
  {
    id: "suggestion",
    label: "Content Suggestion",
    desc: "Recommend topics or courses",
    icon: Lightbulb,
  },
  {
    id: "collab",
    label: "Collaboration",
    desc: "Partner, sponsor, or build together",
    icon: Handshake,
  },
];

const PREFERRED_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

const FAQS = [
  {
    q: "How quickly will I get a response?",
    a: "Most messages are answered within 24–48 hours. Collaboration inquiries may take slightly longer.",
  },
  {
    q: "Can I suggest a specific course or topic?",
    a: "Absolutely — select 'Content Suggestion' and describe what you'd like to learn. We read every one.",
  },
  {
    q: "I found a bug, what details should I include?",
    a: "Your browser, the page you were on, what you did, and what went wrong. A screenshot is a big help.",
  },
  {
    q: "How can we collaborate?",
    a: "Pick 'Collaboration', tell us who you are and what you have in mind. We're open to courses, sponsorships, and content partnerships.",
  },
];

const SOCIAL_LINKS = [
  {
    href: `mailto:${CONTACT_INFO.email}`,
    icon: Mail,
    label: "Email",
    handle: CONTACT_INFO.email,
    colorClass: "text-blue-500",
    iconBgDark: "bg-blue-900/30",
    iconBgLight: "bg-blue-50",
    hoverDark: "hover:border-blue-700/50 hover:bg-blue-900/20",
    hoverLight: "hover:border-blue-200 hover:bg-blue-50/60",
  },
  {
    href: `https://wa.me/${CONTACT_INFO.whatsapp.replace(/\D/g, "")}`,
    icon: MessageCircle,
    label: "WhatsApp",
    handle: CONTACT_INFO.whatsappDisplay,
    colorClass: "text-[#4b9966]",
    iconBgDark: "bg-[#4b9966]/20",
    iconBgLight: "bg-emerald-50",
    hoverDark: "hover:border-[#4b9966]/50 hover:bg-[#4b9966]/10",
    hoverLight: "hover:border-emerald-200 hover:bg-emerald-50/60",
  },
  {
    href: CONTACT_INFO.x,
    icon: Twitter,
    label: "Twitter / X",
    handle: CONTACT_INFO.twitterHandle,
    colorClass: "text-slate-400",
    iconBgDark: "bg-slate-800",
    iconBgLight: "bg-slate-100",
    hoverDark: "hover:border-slate-600 hover:bg-slate-800/60",
    hoverLight: "hover:border-slate-300 hover:bg-slate-50",
  },
  {
    href: CONTACT_INFO.linkedin,
    icon: Linkedin,
    label: "LinkedIn",
    handle: CONTACT_INFO.linkedinHandle,
    colorClass: "text-sky-500",
    iconBgDark: "bg-sky-900/30",
    iconBgLight: "bg-sky-50",
    hoverDark: "hover:border-sky-700/50 hover:bg-sky-900/20",
    hoverLight: "hover:border-sky-200 hover:bg-sky-50/60",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────
function FAQItem({ faq, theme }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border-b last:border-0 ${
        theme === "dark" ? "border-slate-800" : "border-slate-100"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center py-4 text-left gap-4 group"
      >
        <span
          className={`text-sm font-semibold transition-colors group-hover:text-[#4b9966] ${
            theme === "dark" ? "text-slate-200" : "text-slate-800"
          }`}
        >
          {faq.q}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-all duration-300 ${
            open
              ? "rotate-180 text-[#4b9966]"
              : theme === "dark"
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p
              className={`text-sm pb-4 leading-relaxed ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Social Link ──────────────────────────────────────────────────────────
function SocialLink({ link, theme }) {
  const Icon = link.icon;
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 group ${
        theme === "dark"
          ? `bg-slate-900/40 border-slate-800 ${link.hoverDark}`
          : `bg-white border-slate-200 ${link.hoverLight}`
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          theme === "dark" ? link.iconBgDark : link.iconBgLight
        }`}
      >
        <Icon size={16} className={link.colorClass} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[11px] font-medium uppercase tracking-wider ${
            theme === "dark" ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {link.label}
        </p>
        <p
          className={`text-sm font-semibold truncate ${
            theme === "dark" ? "text-slate-200" : "text-slate-800"
          }`}
        >
          {link.handle}
        </p>
      </div>
      <ArrowUpRight
        size={14}
        className={`flex-shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          theme === "dark"
            ? "text-slate-600 group-hover:text-slate-400"
            : "text-slate-300 group-hover:text-slate-500"
        }`}
      />
    </a>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ContactPage() {
  const { theme } = useTheme();

  const [selectedReason, setSelectedReason] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferred_contact: "email",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [focused, setFocused] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const activeReason = REASONS.find((r) => r.id === selectedReason);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  const cardCls =
    theme === "dark"
      ? "bg-slate-900/50 border-slate-800 backdrop-blur-sm"
      : "bg-white border-slate-200";

  const inputBase =
    theme === "dark"
      ? "bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      await client.post("/contact/", {
        ...form,
        reason: selectedReason || "feedback",
      });
      setStatus("sent");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setForm({ name: "", email: "", phone: "", preferred_contact: "email", message: "" });
    setSelectedReason(null);
    setErrorMsg("");
  }

  const inputCls = (field) =>
    `w-full text-sm px-4 py-3 rounded-xl outline-none border-2 transition-all duration-200 ${inputBase} ${
      focused === field
        ? "border-[#4b9966] shadow-[0_0_0_3px_rgba(75,153,102,0.12)]"
        : theme === "dark"
        ? "hover:border-slate-600"
        : "hover:border-slate-300"
    }`;

  const formIsValid = form.name && form.email && form.message;

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      {/* ── HERO ── */}
      <section
        className={`relative pt-24 pb-16 border-b ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#4b9966 1px,transparent 1px),linear-gradient(90deg,#4b9966 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow blob */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-56 rounded-full bg-[#4b9966]/6 blur-3xl" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 ${
                theme === "dark"
                  ? "bg-[#4b9966]/10 text-[#4b9966] border border-[#4b9966]/25"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4b9966] animate-pulse" />
              Get in touch
            </span>

            <h1
              className={`text-4xl md:text-5xl font-bold leading-[1.1] mb-5 tracking-tight ${textPrimary}`}
              style={{ fontFamily: "'Georgia', serif" }}
            >
              We'd love to{" "}
              <span className="text-[#4b9966]">hear from you.</span>
            </h1>

            <p className={`text-lg leading-relaxed max-w-xl ${textSecondary}`}>
              Question, idea, bug, or collaboration, pick a reason and drop us
              a message. Every note gets a real reply.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── REASON SELECTOR ── */}
      <section
        className={`border-b ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="container mx-auto px-6 py-10">
          <p
            className={`text-xs uppercase tracking-widest font-semibold mb-5 ${
              theme === "dark" ? "text-slate-500" : "text-slate-400"
            }`}
          >
            What brings you here?
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {REASONS.map((r, i) => {
              const active = selectedReason === r.id;
              const Icon = r.icon;
              return (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelectedReason(active ? null : r.id)}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 overflow-hidden group ${
                    active
                      ? theme === "dark"
                        ? "border-[#4b9966] bg-[#4b9966]/10"
                        : "border-[#4b9966] bg-emerald-50"
                      : theme === "dark"
                      ? "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      active
                        ? "bg-[#4b9966] text-white"
                        : theme === "dark"
                        ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <p
                    className={`font-bold text-sm mb-1 transition-colors ${
                      active
                        ? "text-[#4b9966]"
                        : theme === "dark"
                        ? "text-slate-200"
                        : "text-slate-800"
                    }`}
                  >
                    {r.label}
                  </p>
                  <p
                    className={`text-xs leading-snug ${
                      theme === "dark" ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {r.desc}
                  </p>
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4b9966] flex items-center justify-center"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={2.5}
                        className="w-3 h-3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <div className="container mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* LEFT — Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <div
            className={`rounded-2xl border-2 overflow-hidden transition-colors ${cardCls}`}
          >
            {/* Form header */}
            <div
              className={`px-8 py-5 border-b flex items-center gap-3 ${
                theme === "dark"
                  ? "border-slate-800 bg-slate-900/30"
                  : "border-slate-100 bg-slate-50/80"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  activeReason
                    ? "bg-[#4b9966] text-white"
                    : theme === "dark"
                    ? "bg-slate-800 text-slate-400"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {activeReason ? (
                  <activeReason.icon size={18} />
                ) : (
                  <Mail size={18} />
                )}
              </div>
              <div>
                <p className={`text-sm font-bold ${textPrimary}`}>
                  {activeReason?.label || "Send a message"}
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  {activeReason?.desc ||
                    "Select a reason above, or just write to us"}
                </p>
              </div>
            </div>

            {/* Form body */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {status === "sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-14 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(75,153,102,0.12)",
                        border: "2px solid rgba(75,153,102,0.3)",
                      }}
                    >
                      <CheckCircle2 size={28} className="text-[#4b9966]" />
                    </motion.div>
                    <h3 className={`text-xl font-bold ${textPrimary}`}>
                      Message sent!
                    </h3>
                    <p className={`text-sm max-w-xs leading-relaxed ${textSecondary}`}>
                      Thanks for reaching out. We'll reply to{" "}
                      <span className="text-[#4b9966] font-semibold">
                        {form.email}
                      </span>{" "}
                      within 24–48 hours.
                    </p>
                    <button
                      onClick={reset}
                      className="mt-4 text-sm font-semibold underline underline-offset-4 text-[#4b9966] hover:text-emerald-500 transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-xs uppercase tracking-wider font-semibold mb-2 ${textSecondary}`}
                        >
                          Full name *
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          onFocus={() => setFocused("name")}
                          onBlur={() => setFocused(null)}
                          placeholder="Jane Doe"
                          required
                          className={inputCls("name")}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-xs uppercase tracking-wider font-semibold mb-2 ${textSecondary}`}
                        >
                          Email address *
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          placeholder="jane@example.com"
                          required
                          className={inputCls("email")}
                        />
                      </div>
                    </div>

                    {/* Phone + Preferred */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-xs uppercase tracking-wider font-semibold mb-2 ${textSecondary}`}
                        >
                          Phone{" "}
                          <span
                            className={`normal-case font-normal ${
                              theme === "dark"
                                ? "text-slate-600"
                                : "text-slate-400"
                            }`}
                          >
                            (optional)
                          </span>
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          onFocus={() => setFocused("phone")}
                          onBlur={() => setFocused(null)}
                          placeholder="+254 700 000 000"
                          className={inputCls("phone")}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-xs uppercase tracking-wider font-semibold mb-2 ${textSecondary}`}
                        >
                          Preferred reply
                        </label>
                        <select
                          name="preferred_contact"
                          value={form.preferred_contact}
                          onChange={handleChange}
                          onFocus={() => setFocused("preferred_contact")}
                          onBlur={() => setFocused(null)}
                          className={inputCls("preferred_contact")}
                        >
                          {PREFERRED_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label
                          className={`text-xs uppercase tracking-wider font-semibold ${textSecondary}`}
                        >
                          Message *
                        </label>
                        <span
                          className={`text-xs tabular-nums ${
                            form.message.length > 480
                              ? "text-rose-400"
                              : theme === "dark"
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          {form.message.length}/500
                        </span>
                      </div>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                        rows={6}
                        maxLength={500}
                        required
                        placeholder={
                          selectedReason === "bug"
                            ? "Describe what happened, what you expected, and your browser/device..."
                            : selectedReason === "suggestion"
                            ? "What topic or course would you like to see on DevNook?"
                            : selectedReason === "collab"
                            ? "Tell us about yourself and what you have in mind..."
                            : "What's on your mind?"
                        }
                        className={`${inputCls("message")} resize-none`}
                      />
                    </div>

                    {/* Error */}
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm rounded-xl px-4 py-3 flex items-center gap-2.5 ${
                          theme === "dark"
                            ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                            : "text-rose-600 bg-rose-50 border border-rose-200"
                        }`}
                      >
                        <AlertCircle size={15} className="flex-shrink-0" />
                        {errorMsg}
                      </motion.div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "sending" || !formIsValid}
                      className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.01] ${
                        formIsValid
                          ? "text-white"
                          : theme === "dark"
                          ? "bg-slate-800 text-slate-500 border-2 border-slate-700"
                          : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                      }`}
                      style={
                        formIsValid
                          ? {
                              background:
                                "linear-gradient(135deg, #4b9966, #38bdf8)",
                              border: "none",
                            }
                          : {}
                      }
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Send message
                        </>
                      )}
                    </button>

                    <p
                      className={`text-center text-xs ${
                        theme === "dark" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      No spam, ever. Your info is only used to reply to you.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Status card */}
          <div className={`rounded-2xl border-2 p-5 transition-colors ${cardCls}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#4b9966] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4b9966]">
                Active & responding
              </span>
            </div>
            <p className={`text-sm font-bold mb-1 ${textPrimary}`}>
              Replies within 24–48 hours
            </p>
            <p className={`text-xs leading-relaxed ${textSecondary}`}>
              Every message is read and responded to personally — no bots, no
              auto-replies.
            </p>
          </div>

          {/* Direct reach */}
          <div className={`rounded-2xl border-2 p-5 transition-colors ${cardCls}`}>
            <p
              className={`text-xs uppercase tracking-widest font-semibold mb-4 ${
                theme === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Or reach out directly
            </p>
            <div className="space-y-2">
              {SOCIAL_LINKS.map((link) => (
                <SocialLink key={link.label} link={link} theme={theme} />
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className={`rounded-2xl border-2 p-5 transition-colors ${cardCls}`}>
            <p
              className={`text-xs uppercase tracking-widest font-semibold mb-2 ${
                theme === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Quick answers
            </p>
            {FAQS.map((f) => (
              <FAQItem key={f.q} faq={f} theme={theme} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}