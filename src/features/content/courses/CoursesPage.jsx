/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";   

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
        console.error("Failed to load topics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 
      ${theme === "dark" ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
    >
      <div className="container mx-auto px-6 pt-32 pb-24">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-4xl font-extrabold text-center mb-12
            ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          All Tech Courses
        </motion.h1>

        {loading ? (
          <div className={`${theme === "dark" ? "text-white/70" : "text-gray-500"} text-center py-20`}>
            Loading courses...
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <motion.div
                key={course.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`group relative p-6 rounded-2xl shadow-md border backdrop-blur-md transition-all overflow-hidden
                  ${theme === "dark"
                    ? "bg-[#0b0c10] border-white/10 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                  }`}
              >
                <h3 className={`text-lg font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {course.title}
                </h3>

                <p className={`text-sm ${theme === "dark" ? "text-white/80" : "text-gray-600"}`}>
                  {course.description || "Discover insights, code patterns, and guides for this topic."}
                </p>

                <div className={`mt-4 flex justify-between items-center 
                  ${theme === "dark" ? "text-white/70" : "text-gray-500"}`}>
                  <Link to={`/courses/${course.id}`} className="text-sm font-medium underline">
                    View topics →
                  </Link>
                  <span className="text-xs">
                    {course.created_at ? new Date(course.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
