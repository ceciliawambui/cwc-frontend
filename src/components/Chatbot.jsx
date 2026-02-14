import React, { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, 
  Send,
  Loader2,
  X,
  Minimize2,
  Trash2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

export default function Chatbot() {
  const { theme } = useTheme();

  const BRAND = "#4b9966";
  const BRAND_DARK = "#5fb87d";

  const welcomeMessage = {
    sender: "ai",
    text: "👋 **Hi! I'm Nova**, your DevNook AI assistant.\n\nHow can I help you today?",
    timestamp: new Date().toISOString()
  };

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("devnook_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [welcomeMessage];
      }
    }
    return [welcomeMessage];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-save messages
  useEffect(() => {
    localStorage.setItem("devnook_chat", JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || loading) return;

    const userMessage = {
      sender: "user",
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.sender !== "system")
        .map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        }));

      // Get API URL from environment variable
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      // Call Django backend chat endpoint (OpenRouter)
      const response = await fetch(`${API_URL}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          history: conversationHistory,
          model: "google-gemini-flash"  // Using FREE Gemini Flash model
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiResponse = data.response || "I apologize, but I couldn't generate a response.";

      const aiMessage = {
        sender: "ai",
        text: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Optional: Log which model was used and if it was free
      if (data.model_used && data.is_free !== undefined) {
        console.log(`Model: ${data.model_used}, Free: ${data.is_free}`);
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        sender: "ai",
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    toast.success("Chat cleared");
  };

  const formatMessage = (text) => {
    // Simple markdown-like formatting
    let formatted = text;
    
    // Bold text **text**
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text *text*
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code blocks ```code```
    formatted = formatted.replace(/```([\s\S]+?)```/g, 
      '<pre class="px-3 py-2 rounded mt-2 mb-2 text-xs overflow-x-auto ' + 
      (theme === "dark" ? 'bg-slate-800' : 'bg-slate-200') + '"><code>$1</code></pre>');
    
    // Inline code `code`
    formatted = formatted.replace(/`(.+?)`/g, 
      '<code class="px-1.5 py-0.5 rounded text-xs ' + 
      (theme === "dark" ? 'bg-slate-800' : 'bg-slate-200') + '">$1</code>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white z-50"
        style={{
          backgroundColor: theme === "dark" ? BRAND_DARK : BRAND
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="minimize"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Minimize2 size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border z-40 ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between text-white relative overflow-hidden"
              style={{
                backgroundColor: theme === "dark" ? BRAND_DARK : BRAND
              }}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <Sparkles size={20} className="animate-pulse" />
                  <div className="absolute inset-0 blur-lg opacity-50">
                    <Sparkles size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Nova</h3>
                  <p className="text-xs opacity-90">DevNook AI Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <button
                  onClick={clearChat}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "text-white shadow-md"
                        : theme === "dark"
                        ? "bg-slate-900 text-slate-100 border border-slate-800"
                        : "bg-slate-100 text-slate-900"
                    }`}
                    style={
                      msg.sender === "user"
                        ? {
                            backgroundColor: theme === "dark" ? BRAND_DARK : BRAND,
                            borderRadius: "18px 18px 4px 18px"
                          }
                        : { borderRadius: "18px 18px 18px 4px" }
                    }
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.text)
                      }}
                    />
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: theme === "dark" ? BRAND_DARK : BRAND }}
                >
                  <Loader2 size={16} className="animate-spin" />
                  <span className="font-medium">Nova is thinking...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className={`p-4 border-t ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex gap-2 items-end">
                <textarea
                  ref={(el) => {
                    inputRef.current = el;
                    textareaRef.current = el;
                  }}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  className={`flex-1 resize-none rounded-xl px-4 py-3 text-sm focus:outline-none border transition-colors ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                  }`}
                  style={{ maxHeight: "120px" }}
                />

                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className={`px-4 py-3 rounded-xl text-white flex items-center justify-center transition-all ${
                    !input.trim() || loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 shadow-md"
                  }`}
                  style={{
                    backgroundColor: theme === "dark" ? BRAND_DARK : BRAND
                  }}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setInput("Help me get started with coding")}
                  disabled={loading}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "bg-slate-900 hover:bg-slate-800 text-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Getting started
                </button>
                <button
                  onClick={() => setInput("Explain React hooks")}
                  disabled={loading}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    theme === "dark"
                      ? "bg-slate-900 hover:bg-slate-800 text-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Explain React
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}