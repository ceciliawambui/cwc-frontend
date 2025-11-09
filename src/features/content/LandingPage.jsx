/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import heroImg from "../../assets/student.jpg";
import Chatbot from "../../components/Chatbot";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/";

export default function LandingPage() {
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
      className={`min-h-screen flex flex-col overflow-hidden transition-colors duration-500 
        ${theme === "dark" ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
    >
      {/* <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div> */}

      {/* Hero */}
      <section className="relative container mx-auto px-6 pt-28 pb-16 grid md:grid-cols-2 gap-10 items-center">

        {/* text */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1
            className={`text-5xl md:text-6xl font-extrabold leading-tight 
              ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Unlock Modern{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Tech Knowledge
            </span>
          </h1>

          <p
            className={`mt-5 max-w-md text-base leading-relaxed 
              ${theme === "dark" ? "text-white/80" : "text-gray-600"}`}
          >
            Dive into structured, community-curated resources covering React,
            Django, UI/UX, DevOps, and every tool shaping the modern developer’s stack.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all"
            >
              View Courses
            </Link>
            <Link
              to="/login"
              className={`px-6 py-3 rounded-full border text-sm transition
                ${theme === "dark"
                  ? "border-white/40 text-white hover:bg-gray-800"
                  : "border-gray-400 text-gray-700 hover:bg-gray-100"}`}
            >
              Log In
            </Link>
          </div>

          <div className="mt-10 flex gap-8 flex-wrap text-center">
            <div>
              <h3 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>80+</h3>
              <p className={`${theme === "dark" ? "text-white/70" : "text-gray-500"} text-sm`}>Tech Topics</p>
            </div>
            <div>
              <h3 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>10K+</h3>
              <p className={`${theme === "dark" ? "text-white/70" : "text-gray-500"} text-sm`}>Active Learners</p>
            </div>
          </div>
        </motion.div>

        {/* image */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <img src={heroImg} className="w-full max-w-md mx-auto rounded-xl drop-shadow-2xl" />
        </motion.div>
      </section>

      {/* Topics */}
      <main className="container mx-auto px-6 pb-24">
        <motion.h2
          className={`text-3xl font-bold mb-10 text-center 
            ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Explore Tech Courses
        </motion.h2>

        {loading ? (
          <div className={`${theme === "dark" ? "text-white/70" : "text-gray-500"} text-center py-20`}>
            Loading topics...
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
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
                {/* title */}
                <h3
                  className={`relative text-lg font-bold mb-2
          ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  {course.title}
                </h3>

                {/* description */}
                <p className={`relative text-sm ${theme === "dark" ? "text-white/80" : "text-gray-600"}`}>
                  {course.description || "Discover insights, code patterns, and guides for this topic."}
                </p>

                {/* bottom details */}
                <div className={`relative mt-4 flex justify-between items-center 
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
      </main>
      <Chatbot />

    </div>
  );
}
