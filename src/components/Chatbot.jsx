/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Mic, MicOff } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function Chatbot() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("nova_chat");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "Show me AI topics",
    "How to learn Django?",
    "Explain React context",
    "Suggest beginner Python resources",
  ];

  const sendMessage = async (text) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMessage = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/api/semantic-search/`, {
        params: { q: query },
      });

      const topResults = res.data.results
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      const aiMessage = { sender: "ai", results: topResults };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("nova_chat", JSON.stringify(messages));
  }, [messages]);

  // Speech recognition
  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in your browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
        <AnimatePresence>
          {showTooltip && !open && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="mb-3 w-60 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <p className="font-semibold mb-1">
                Hi 👋 I'm <span className="text-indigo-500">Nova - DevHaven AI Assistant</span>!
              </p>
              <p className="text-xs">
                Ask me anything about topics or any resources you would want.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => {
            setOpen(!open);
            setShowTooltip(false); 
          }}
          className="w-14 h-14 rounded-full bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
          whileTap={{ scale: 0.95 }}
          title="Ask Nova"
        >
          <Sparkles size={24} />
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed bottom-24 right-6 w-96 max-h-[75vh] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/40 dark:border-gray-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-indigo-600/90 to-purple-600/90 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="text-white" size={18} />
                <h3 className="text-sm font-semibold">Nova — Your Knowledge Assistant</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <Sparkles size={32} className="mb-2 text-indigo-400" />
                  <p className="text-sm mb-4">
                    Hi 👋 I’m <span className="text-indigo-500">Nova</span>. Ask me about topics or courses!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-indigo-600 hover:text-white transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-3 flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                        msg.sender === "user"
                          ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white"
                          : "bg-gray-100/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {msg.sender === "ai" && msg.results ? (
                        msg.results.length > 0 ? (
                          msg.results.map((res, i) => (
                            <p key={i} className="mb-1">
                              <a
                                href={`http://localhost:5173${res.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-500 dark:text-indigo-400 hover:underline"
                              >
                                {res.title}
                              </a>
                            </p>
                          ))
                        ) : (
                          <p>No relevant results found.</p>
                        )
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start mb-3">
                  <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                    <Loader2 className="animate-spin" size={14} />
                    Nova is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center p-3 border-t border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
              <motion.button
                onClick={handleMicClick}
                animate={listening ? { scale: [1, 1.2, 1], opacity: [1, 0.6, 1] } : {}}
                transition={{ duration: 1, repeat: listening ? Infinity : 0 }}
                className={`p-2 rounded-lg transition ${
                  listening
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={listening ? "Listening..." : "Ask Nova anything..."}
                className="flex-1 mx-2 p-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={() => sendMessage()}
                disabled={loading}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
