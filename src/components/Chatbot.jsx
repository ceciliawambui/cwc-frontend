/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "http://127.0.0.1:8000/";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call semantic search API
      const res = await axios.get(`${BASE_URL}api/semantic-search/`, {
        params: { q: input },
      });

      // Sort by score descending and take top 4
      const topResults = res.data.results
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      const aiMessage = { sender: "ai", results: topResults };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 z-50"
      >
        💬
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col overflow-hidden z-50"
          >
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && (
                <p className="text-gray-400 text-sm">
                  Ask me anything about the topics!
                </p>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.sender === "ai" ? (
                    <div className="inline-block px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                      {msg.results ? (
                        msg.results.length > 0 ? (
                          msg.results.map((res, i) => (
                            <p key={i} className="mb-1">
                              <a
                                href={`http://localhost:5173${res.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline"
                              >
                                {res.title}
                              </a>
                            </p>
                          ))
                        ) : (
                          <p>No relevant results found.</p>
                        )
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  ) : (
                    <div className="inline-block px-3 py-2 rounded-lg bg-indigo-600 text-white">
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}

              {loading && <p className="text-gray-400 text-sm">AI is typing...</p>}
            </div>

            <div className="flex p-2 border-t border-gray-200 dark:border-gray-700">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask a question..."
                className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
