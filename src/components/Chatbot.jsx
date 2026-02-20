import React, { useState, useEffect, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  X,
  Trash2,
  Bot,
  User,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL    = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const BRAND      = "#4b9966";
const BRAND_DARK = "#5fb87d";

const WELCOME_MESSAGE = {
  id:        "welcome",
  sender:    "ai",
  text:      "**Hi! I'm Nova** 👋 your DevNook AI assistant.\n\nAsk me anything about coding, web development, or how to get the most out of DevNook.",
  timestamp: new Date().toISOString(),
  error:     false,
};

const QUICK_PROMPTS = [
  "Help me get started",
  "Explain React hooks",
  "Best Python resources",
  "What is DevNook?",
];

// ── Markdown formatter ────────────────────────────────────────────────────────

/**
 * Converts a small subset of Markdown to safe HTML.
 * Order matters — code blocks must be handled before inline elements.
 */
function parseMarkdown(raw, isDark) {
  const codeBlockBg  = isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-800";
  const inlineCodeBg = isDark ? "bg-slate-700 text-pink-300"  : "bg-slate-200 text-pink-700";

  let html = raw
    // Escape raw HTML to prevent XSS
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Fenced code blocks  ```lang\n...\n```
  html = html.replace(
    /```(\w*)\n?([\s\S]*?)```/g,
    (_, lang, code) =>
      `<pre class="rounded-xl px-4 py-3 mt-2 mb-2 text-xs overflow-x-auto font-mono leading-relaxed ${codeBlockBg}"><code>${code.trim()}</code></pre>`,
  );

  // Inline code  `code`
  html = html.replace(
    /`([^`]+)`/g,
    (_, code) =>
      `<code class="px-1.5 py-0.5 rounded text-xs font-mono ${inlineCodeBg}">${code}</code>`,
  );

  // Bold  **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic  *text*
  html = html.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");

  // Unordered list lines  - item
  html = html.replace(
    /((?:^|\n)- .+)+/g,
    (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((l) => `<li class="ml-4 list-disc">${l.replace(/^- /, "")}</li>`)
        .join("");
      return `<ul class="my-2 space-y-1">${items}</ul>`;
    },
  );

  // Line breaks (after list handling)
  html = html.replace(/\n/g, "<br />");

  return html;
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, isDark, brandColor }) {
  const isUser = msg.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm
          ${isUser ? "opacity-0 pointer-events-none" : ""}`}
        style={{ backgroundColor: brandColor }}
      >
        <Bot size={14} />
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed shadow-sm
          ${isUser
            ? "text-white rounded-2xl rounded-br-sm"
            : isDark
              ? "bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-2xl rounded-bl-sm"
              : "bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm"
          }
          ${msg.error ? (isDark ? "bg-red-950/40 border-red-800/50 text-red-300" : "bg-red-50 border border-red-200 text-red-700") : ""}
        `}
        style={isUser && !msg.error ? { backgroundColor: brandColor } : {}}
      >
        {msg.error && (
          <span className="flex items-center gap-1.5 text-xs font-medium mb-1.5 opacity-70">
            <AlertCircle size={12} /> Connection error
          </span>
        )}
        <div
          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text, isDark) }}
          className="[&_strong]:font-semibold [&_pre]:whitespace-pre-wrap"
        />
        <span className={`block mt-1.5 text-[10px] opacity-40 ${isUser ? "text-right" : ""}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator({ isDark, brandColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-end gap-2.5"
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
        style={{ backgroundColor: brandColor }}
      >
        <Bot size={14} />
      </div>
      <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${isDark ? "bg-slate-800/90 border border-slate-700/60" : "bg-slate-100"}`}>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: brandColor }}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Chatbot() {
  const { theme } = useTheme();
  const isDark     = theme === "dark";
  const brandColor = isDark ? BRAND_DARK : BRAND;

  // In-memory session messages only; no localStorage to avoid stale/corrupt state
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus textarea when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 120);
    }
  }, [open]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  // Build history array from current messages (excluding the welcome message)
  const buildHistory = useCallback(() =>
    messages
      .filter((m) => m.id !== "welcome" && !m.error)
      .map((m) => ({
        role:    m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
  [messages]);

  const sendMessage = useCallback(async () => {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg = {
      id:        crypto.randomUUID(),
      sender:    "user",
      text:      query,
      timestamp: new Date().toISOString(),
      error:     false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: buildHistory(),
          model:   "google-gemini-flash",
        }),
      });

      // Attempt to parse JSON even on error status for the error message
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned ${res.status} with no JSON body.`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || `Request failed with status ${res.status}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id:        crypto.randomUUID(),
          sender:    "ai",
          text:      data.response,
          timestamp: new Date().toISOString(),
          error:     false,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Couldn't reach Nova. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id:        crypto.randomUUID(),
          sender:    "ai",
          text:      "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
          error:     true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, buildHistory]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    toast.success("Chat cleared");
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  return (
    <>
      {/* ── Floating trigger button ──────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        aria-label={open ? "Close chat" : "Open chat with Nova"}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-white z-50"
        style={{ backgroundColor: brandColor }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{   rotate:  90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate:  90, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{   rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Sparkles size={22} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread dot — visible only when closed and there's more than the welcome msg */}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
        )}
      </motion.button>

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 24, scale: 0.94  }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed bottom-24 right-6 w-[400px] h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border z-40
              ${isDark
                ? "bg-slate-950 border-slate-800/80"
                : "bg-white border-slate-200"
              }`}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between text-white flex-shrink-0 relative overflow-hidden"
              style={{ backgroundColor: brandColor }}
            >
              {/* Subtle shimmer overlay */}
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm`}>
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Nova</h3>
                  <p className="text-[11px] opacity-80 leading-tight">DevNook AI Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1 relative z-10">
                <button
                  onClick={clearChat}
                  disabled={messages.length <= 1}
                  title="Clear chat"
                  className="hover:bg-white/20 p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isDark={isDark}
                  brandColor={brandColor}
                />
              ))}

              <AnimatePresence>
                {loading && (
                  <TypingIndicator isDark={isDark} brandColor={brandColor} />
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div
              className={`flex-shrink-0 px-4 py-4 border-t
                ${isDark ? "border-slate-800/80 bg-slate-950" : "border-slate-100 bg-white"}`}
            >
              {/* Quick prompts */}
              <div className="flex gap-2 flex-wrap mb-3">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    disabled={loading}
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors
                      ${isDark
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Textarea + Send */}
              <div className={`flex items-end gap-2 rounded-2xl border p-2 transition-colors
                ${isDark
                  ? "bg-slate-900 border-slate-800 focus-within:border-slate-700"
                  : "bg-slate-50 border-slate-200 focus-within:border-slate-300"
                }`}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nova anything…"
                  disabled={loading}
                  className={`flex-1 resize-none bg-transparent text-sm focus:outline-none px-2 py-1.5 leading-relaxed
                    ${isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"}
                    disabled:opacity-50`}
                  style={{ maxHeight: "120px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 shadow-md"
                  style={{ backgroundColor: brandColor }}
                  aria-label="Send message"
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={15} />
                  }
                </button>
              </div>
              <p className={`text-[10px] mt-2 text-center ${isDark ? "text-slate-700" : "text-slate-400"}`}>
                Shift + Enter for a new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}