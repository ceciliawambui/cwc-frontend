/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import { CalendarDays } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/courses/`);
        setCourses(res.data || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Date formatter
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return isNaN(date) ? "" : date.toLocaleDateString();
  };

  // Logo picker — smartly fetches the matching Simple Icons logo
  const getLogoUrl = (title) => {
    if (!title) return "https://cdn.simpleicons.org/code";
    const key = title.toLowerCase();

    // Common tech keyword mappings
    if (key.includes("python")) return "https://cdn.simpleicons.org/python";
    if (key.includes("javascript")) return "https://cdn.simpleicons.org/javascript";
    if (key.includes("react")) return "https://cdn.simpleicons.org/react";
    if (key.includes("django")) return "https://cdn.simpleicons.org/django";
    if (key.includes("node")) return "https://cdn.simpleicons.org/nodedotjs";
    if (key.includes("html")) return "https://cdn.simpleicons.org/html5";
    if (key.includes("css")) return "https://cdn.simpleicons.org/css";
    if (key.includes("java")) return "https://cdn.simpleicons.org/java";
    if (key.includes("git")) return "https://cdn.simpleicons.org/git";
    if (key.includes("figma")) return "https://cdn.simpleicons.org/figma";
    if (key.includes("tailwind")) return "https://cdn.simpleicons.org/tailwindcss";
    if (key.includes("typescript")) return "https://cdn.simpleicons.org/typescript";
    if (key.includes("linux")) return "https://cdn.simpleicons.org/linux";
    if (key.includes("php")) return "https://cdn.simpleicons.org/php";
    if (key.includes("next")) return "https://cdn.simpleicons.org/nextdotjs";
    if (key.includes("vue")) return "https://cdn.simpleicons.org/vuedotjs";

    // Default fallback
    return "https://cdn.simpleicons.org/code";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 
        ${
          theme === "dark"
            ? "bg-linear-to-b from-gray-950 via-gray-900 to-black text-white"
            : "bg-linear-to-b from-white via-gray-50 to-gray-100 text-gray-900"
        }`}
    >
      <div className="container mx-auto px-6 pt-32 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`text-5xl font-extrabold tracking-tight mb-4 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Explore Inspiring Tech Courses
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className={`max-w-2xl mx-auto text-lg leading-relaxed ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Curated lessons and learning paths to help you master coding, design,
          and innovation. Built for curious, young learners.
        </motion.p>
      </div>

      <div className="container mx-auto px-6 pb-24">
        {loading ? (
          <div
            className={`text-center py-32 text-lg ${
              theme === "dark" ? "text-white/70" : "text-gray-600"
            }`}
          >
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-32 text-lg text-gray-500">
            No courses available yet. Check back soon!
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {courses.map((course) => (
              <Link
                to={`/courses/${course.id}`}
                key={course.id}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={`relative overflow-hidden rounded-3xl border shadow-xl backdrop-blur-lg transition-all duration-300 cursor-pointer
                    ${
                      theme === "dark"
                        ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-800 hover:shadow-gray-700/40"
                        : "bg-white border-gray-200 hover:shadow-gray-300/50"
                    }`}
                >
                  <div className="p-7 flex flex-col h-full justify-between">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={getLogoUrl(course.title)}
                        alt={course.title}
                        className="w-8 h-8 object-contain"
                      />
                      <h3
                        className={`text-xl font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {course.title}
                      </h3>
                    </div>

                    <p
                      className={`text-sm leading-relaxed mb-6 line-clamp-3 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {course.description ||
                        "Explore key insights and guided lessons designed to boost your skillset."}
                    </p>

                    <div
                      className={`flex justify-between items-center text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        <span>{formatDate(course.created_at)}</span>
                      </div>

                      <span
                        className={`font-medium transition-all group-hover:underline ${
                          theme === "dark"
                            ? "text-indigo-400 group-hover:text-indigo-300"
                            : "text-indigo-600 group-hover:text-indigo-500"
                        }`}
                      >
                        View Topics →
                      </span>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 
                      ${
                        theme === "dark"
                          ? "bg-linear-to-br from-indigo-400 to-pink-400"
                          : "bg-linear-to-br from-indigo-200 to-pink-200"
                      }`}
                  ></div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
