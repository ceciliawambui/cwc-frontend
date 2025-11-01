/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/courses/${id}/`);
        setCourse(res.data);
        setTopics(res.data.topics || []);
        const recentRes = await axios.get(`${BASE_URL}/api/topics/?ordering=-created_at&limit=8`);
        setRecentTopics(recentRes.data.results || recentRes.data);
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse 
        text-gray-500 dark:text-gray-400">
        Loading course...
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Course not found.
      </div>
    );

  return (
    <div
      className={`relative flex flex-col lg:flex-row w-full min-h-screen mt-6 transition-colors duration-500
      ${theme === "dark"
        ? "bg-gray-950 text-white"
        : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* --- Floating Sidebar --- */}
      <aside
        className={`lg:w-80 w-full lg:fixed lg:right-6 lg:top-24 backdrop-blur-md shadow-xl rounded-2xl p-6 h-fit z-20 border
        ${theme === "dark"
          ? "bg-gray-900/70 border-gray-800"
          : "bg-white/70 border-gray-200"
        }`}
      >
        <h3
          className={`font-bold text-xl mb-4
          ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"} `}
        >
          Recently Added Topics
        </h3>

        {recentTopics.length ? (
          <ul className="space-y-3">
            {recentTopics.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/topics/${t.slug}`}
                  className={`block p-3 rounded-lg transition
                  ${theme === "dark"
                    ? "hover:bg-gray-800 text-gray-200"
                    : "hover:bg-indigo-50 text-gray-800"
                  }`}
                >
                  <p className={`font-semibold
                    ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    {t.title}
                  </p>
                  <p className={`text-sm line-clamp-2
                    ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {t.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={`${theme === "dark" ? "text-gray-500" : "text-gray-500"} text-sm`}
          >
            No recent topics available.
          </p>
        )}
      </aside>

      {/* --- Main Course Section --- */}
      <main className="flex-1 lg:ml-10 lg:mr-[25rem] px-6 py-10">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-4xl font-extrabold mt-4 mb-3 bg-gradient-to-r from-indigo-700 to-purple-600 text-transparent bg-clip-text"
        >
          {course.title}
        </motion.h1>

        {/* === Topics List === */}
        <div
          className={`mt-6 border-t pt-8
          ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
        >
          <h3
            className={`font-bold text-2xl mb-4 flex items-center gap-2
            ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"}`}
          >
            <BookOpen size={22} /> Topics in this Course
          </h3>

          {/* search input */}
          <div className="relative max-w-md mx-auto mt-10 mb-12">
            <div
              className={`flex items-center rounded-full px-4 py-2 shadow-sm border
              ${theme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-gray-100 border-gray-300"
              }`}
            >
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm
                ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
              />
              <Search size={18} className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
            </div>
          </div>

          {filteredTopics.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() => navigate(`/topics/${topic.slug}`)}
                  className={`cursor-pointer p-5 rounded-xl border shadow-sm transition-all
                  ${theme === "dark"
                    ? "bg-gray-900/70 border-gray-800 hover:shadow-lg hover:border-pink-400"
                    : "bg-white/70 border-gray-200 hover:shadow-lg hover:border-pink-400"
                  }`}
                >
                  <h4 className={`font-semibold mb-2
                    ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    {topic.title}
                  </h4>

                  <p className={`text-sm line-clamp-3
                    ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {topic.description || "No description yet."}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              No topics found matching “{searchTerm}”.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
