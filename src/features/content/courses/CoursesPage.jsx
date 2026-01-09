import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import { CalendarDays } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Logo mapper
const logoMap = {
  python: "https://cdn.simpleicons.org/python",
  javascript: "https://cdn.simpleicons.org/javascript",
  react: "https://cdn.simpleicons.org/react",
  django: "https://cdn.simpleicons.org/django",
  node: "https://cdn.simpleicons.org/nodedotjs",
  html: "https://cdn.simpleicons.org/html5",
  css: "https://cdn.simpleicons.org/css",
  java: "https://cdn.simpleicons.org/java",
  git: "https://cdn.simpleicons.org/git",
  figma: "https://cdn.simpleicons.org/figma",
  tailwind: "https://cdn.simpleicons.org/tailwindcss",
  typescript: "https://cdn.simpleicons.org/typescript",
  linux: "https://cdn.simpleicons.org/linux",
  php: "https://cdn.simpleicons.org/php",
  next: "https://cdn.simpleicons.org/nextdotjs",
  vue: "https://cdn.simpleicons.org/vuedotjs",
};

// Course Card Component
const CourseCard = React.memo(function CourseCard({ course, theme }) {
  const date = useMemo(() => {
    if (!course.created_at) return "";
    const d = new Date(course.created_at);
    return isNaN(d) ? "" : d.toLocaleDateString();
  }, [course.created_at]);

  const logoUrl = useMemo(() => {
    if (!course.title) return "https://cdn.simpleicons.org/codepen";
    const key = course.title.toLowerCase();
    return Object.keys(logoMap).find((k) => key.includes(k))
      ? logoMap[Object.keys(logoMap).find((k) => key.includes(k))]
      : "https://cdn.simpleicons.org/codepen";
  }, [course.title]);

  // CRITICAL: Use slug for navigation
  const courseLink = course.slug;
  
  // Debug logging
  console.log(`Course "${course.title}": slug="${course.slug}", id="${course.id}"`);

  if (!courseLink) {
    console.warn(`⚠️ Course "${course.title}" has no slug!`);
    return null; // Don't render if no slug
  }

  return (
    <Link to={`/courses/${courseLink}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={`relative overflow-hidden rounded-3xl border shadow-xl backdrop-blur-lg transition-all duration-300 cursor-pointer
          ${theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-800 hover:shadow-gray-700/40"
            : "bg-white border-gray-200 hover:shadow-gray-300/50"
          }`}
      >
        <div className="p-7 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt={course.title} className="w-8 h-8 object-contain" />
            <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {course.title}
            </h3>
          </div>

          <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {course.description || "Explore key insights and guided lessons designed to boost your skillset."}
          </p>

          <div className={`flex justify-between items-center text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>{date}</span>
            </div>

            <span className={`font-medium transition-all group-hover:underline ${theme === "dark" ? "text-indigo-400 group-hover:text-indigo-300" : "text-indigo-600 group-hover:text-indigo-500"}`}>
              View Topics →
            </span>
          </div>
        </div>

        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500
          ${theme === "dark" ? "bg-gradient-to-br from-indigo-400 to-pink-400" : "bg-gradient-to-br from-indigo-200 to-pink-200"}`}
        />
      </motion.div>
    </Link>
  );
});

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Fetching courses from:", `${BASE_URL}/api/courses/`);
      const res = await axios.get(`${BASE_URL}/api/courses/`);
      
      console.log("📦 Full API Response:", res.data);
      
      let data = res.data;
      
      // Handle different response structures
      if (Array.isArray(data)) {
        console.log("✅ Response is array, length:", data.length);
        setCourses(data);
      } else if (data.results && Array.isArray(data.results)) {
        console.log("✅ Response has results array, length:", data.results.length);
        setCourses(data.results);
      } else {
        console.error("❌ Unexpected API response structure:", res.data);
        setError("Invalid response format from server");
        setCourses([]);
        return;
      }

      // Verify courses have slugs
      const coursesData = Array.isArray(data) ? data : data.results;
      const missingSlug = coursesData.filter(c => !c.slug);
      if (missingSlug.length > 0) {
        console.warn("⚠️ Courses missing slug:", missingSlug.map(c => c.title));
      }
      
    } catch (err) {
      console.error("❌ Failed to load courses:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.detail || err.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white" : "bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900"}`}>
        <div className="container mx-auto px-6 pt-32">
          <div className="text-center py-32">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white" : "bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900"}`}>
        <div className="container mx-auto px-6 pt-32">
          <div className="text-center py-32">
            <p className="text-lg text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={fetchCourses}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white" : "bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900"}`}>
      <div className="container mx-auto px-6 pt-32 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`text-5xl font-extrabold tracking-tight mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        >
          Explore Inspiring Tech Courses
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className={`max-w-2xl mx-auto text-lg leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        >
          Curated lessons and learning paths to help you master coding, design, and innovation. Built for curious, young learners.
        </motion.p>
      </div>

      <div className="container mx-auto px-6 pb-24">
        {courses.length === 0 ? (
          <div className="text-center py-32 text-lg text-gray-500">
            No courses available yet. Check back soon!
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} theme={theme} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}