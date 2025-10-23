/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Link } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/courses/`);
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-700 ease-in-out">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-6 py-24">

        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
            Knowledge Hub
          </h1>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Admin
            </Link>
            <Link
              to="/register"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
            No courses available.
          </div>
        ) : (
          <motion.main
            className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {courses.map((course) => (
              <motion.article
                key={course.id}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="rounded-2xl p-6 glass-effect shadow-lg border border-white/20 dark:border-gray-800 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {course.title || course.name}
                  </h3>
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                      course.color || "from-indigo-500 to-pink-500"
                    } opacity-90`}
                  />
                </div>

                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {course.description || "Curated course notes & examples."}
                </p>

                <div className="mt-4">
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Explore →
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.main>
        )}
      </div>
    </div>
  );
}
