/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import heroImg from "../../assets/student.jpg";
import {
  GraduationCap,
  Layers,
  Users,
  RefreshCcw,
} from "lucide-react";
import Chatbot from "../../components/Chatbot";

const BASE_URL = import.meta.env.VITE_API_BASE;
console.log("API Base URL:", BASE_URL);

export default function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, topicRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/courses/`),
          axios.get(`${BASE_URL}/api/topics/`),
        ]);
        console.log("COURSES:", courseRes.data);
        console.log("TOPICS:", topicRes.data);
        setCourses(courseRes.data.slice(0, 3));
        setTopics(topicRes.data.slice(0, 6));
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-white/80" : "text-gray-600";
  const bgPrimary = theme === "dark" ? "bg-gray-950" : "bg-white";

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden transition-colors duration-500 ${bgPrimary}`}>
      <section className="relative container mx-auto px-6 pt-28 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={`text-5xl md:text-5xl font-extrabold leading-tight ${textPrimary}`}>
            {/* Explore. Learn. Build. <br /> */}
            Your Safe Space <br />
            <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            for Tech Mastery.
            </span>
          </h1>
          <p className={`mt-6 text-base leading-relaxed max-w-lg ${textSecondary}`}>
          DevHaven is a modern space where developers of all levels come to learn, 
  sharpen their skills, and stay ahead. Explore curated topics, practical 
  tutorials, and real-world learning paths designed to help you grow with confidence.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md hover:opacity-90 transition"
            >
              Explore Courses
            </Link>
            <Link
              to="/register"
              className={`px-6 py-3 rounded-full border text-sm font-semibold transition 
                ${theme === "dark" ? "border-white/30 text-white hover:bg-gray-900" : "border-gray-400 text-gray-700 hover:bg-gray-50"}`}
            >
              Join the Community
            </Link>
          </div>

          <div className="mt-12 flex gap-12 flex-wrap">
            <div>
              <h3 className={`text-3xl font-bold ${textPrimary}`}>80+</h3>
              <p className={`text-sm ${textSecondary}`}>Tech Topics</p>
            </div>
            <div>
              <h3 className={`text-3xl font-bold ${textPrimary}`}>10K+</h3>
              <p className={`text-sm ${textSecondary}`}>Active Learners</p>
            </div>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative w-full">
            <div className="absolute inset-0 bg-linear-to-tr from-purple-600/30 to-pink-500/30 rounded-3xl blur-2xl"></div>
            <img src={heroImg} alt="Hero" className="relative w-full max-w-md mx-auto rounded-3xl shadow-2xl" />
          </div>
        </motion.div>
      </section>

      <section className="py-20 border-t border-white/10 container mx-auto px-6">
        <motion.h2
          className={`text-3xl font-bold mb-14 text-center ${textPrimary}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Why DevHaven?
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Structured Learning",
              desc: "Follow guided learning paths that reflect real-world tech stacks — from Frontend to DevOps.",
              icon: GraduationCap,
              color: "from-indigo-500 to-purple-500",
            },
            {
              title: "Expert-Curated",
              desc: "Each topic and course is reviewed by mentors and tech professionals working in the field.",
              icon: Layers,
              color: "from-blue-500 to-cyan-500",
            },
            {
              title: "Community Driven",
              desc: "Engage with other learners, collaborate on projects, and grow together in an inspiring environment.",
              icon: Users,
              color: "from-pink-500 to-rose-500",
            },
            {
              title: "Always Updated",
              desc: "Stay current with new frameworks, tools, and best practices through continuously refreshed content.",
              icon: RefreshCcw,
              color: "from-green-500 to-emerald-500",
            },
          ].map(({ title, desc, icon: Icon, color }, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`relative p-8 rounded-2xl border shadow-sm hover:shadow-lg overflow-hidden transition
          ${theme === "dark" ? "bg-gray-900 border-white/10" : "bg-gray-50 border-gray-200"}`}
            >
              <div
                className={`absolute -top-8 -right-8 w-24 h-24 bg-linear-to-br ${color} opacity-10 blur-3xl rounded-full`}
              ></div>


              <div
                className={`w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-linear-to-br ${color} text-white shadow-lg`}
              >
                <Icon size={26} />
              </div>

              {/* Content */}
              <h4 className={`text-xl font-semibold mb-3 ${textPrimary}`}>{title}</h4>
              <p className={`text-sm ${textSecondary}`}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED COURSES ---------------- */}
      <section className="py-20 border-t border-white/10 container mx-auto px-6">
        <motion.h2
          className={`text-3xl font-bold mb-12 text-center ${textPrimary}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Featured Learning Paths
        </motion.h2>

        {loading ? (
          <div className="text-center opacity-70">Loading courses...</div>
        ) : (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const key = course.title.toLowerCase();

              // Map titles to SimpleIcons CDN logos
              const getLogoUrl = () => {
                if (key.includes("python")) return "https://cdn.simpleicons.org/python";
                if (key.includes("javascript")) return "https://cdn.simpleicons.org/javascript";
                if (key.includes("react")) return "https://cdn.simpleicons.org/react";
                if (key.includes("django")) return "https://cdn.simpleicons.org/django";
                if (key.includes("node")) return "https://cdn.simpleicons.org/nodedotjs";
                if (key.includes("html")) return "https://cdn.simpleicons.org/html5";
                if (key.includes("css")) return "https://cdn.simpleicons.org/css3";
                if (key.includes("java")) return "https://cdn.simpleicons.org/java";
                if (key.includes("figma")) return "https://cdn.simpleicons.org/figma";
                if (key.includes("tailwind")) return "https://cdn.simpleicons.org/tailwindcss";
                if (key.includes("typescript")) return "https://cdn.simpleicons.org/typescript";
                if (key.includes("vue")) return "https://cdn.simpleicons.org/vuedotjs";
                if (key.includes("php")) return "https://cdn.simpleicons.org/php";
                return "https://cdn.simpleicons.org/codepen";
              };

              return (
                <motion.div
                  key={course.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 250 }}
                  className={`rounded-3xl overflow-hidden border shadow-lg group transition
              ${theme === "dark"
                      ? "bg-gray-900 border-white/10"
                      : "bg-white border-gray-200"
                    }`}
                >
                  <div className="p-8">
                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={getLogoUrl()}
                        alt={course.title}
                        className="w-6 h-6 object-contain"
                      />
                      <h3 className={`text-2xl font-bold ${textPrimary}`}>
                        {course.title}
                      </h3>
                    </div>

                    <p className={`text-sm mb-5 ${textSecondary}`}>
                      {course.description ||
                        "Explore expert-curated resources for developers."}
                    </p>

                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow hover:opacity-90"
                    >
                      Explore →
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------------- LATEST TOPICS ---------------- */}
      {/* LATEST TOPICS */}
      <section className="py-20 border-t border-white/10 container mx-auto px-6">
        <motion.h2
          className={`text-3xl font-bold mb-12 text-center ${textPrimary}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Latest Added Topics
        </motion.h2>

        {loading ? (
          <div className="text-center opacity-70">Loading topics...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic) => {
              const courseTitle = topic.course_detail?.title || "";
              return (
                <motion.div
                  key={topic.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-3xl border shadow-lg p-6 transition-all hover:shadow-xl overflow-hidden 
                    ${theme === "dark"
                      ? "bg-linear-to-br from-gray-900 via-gray-950 to-black border-gray-800 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                    }`}
                >
                  {/* Top-right course tag */}
                  {courseTitle && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${theme === "dark"
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-indigo-100 text-indigo-700"
                          }`}
                      >
                        {courseTitle}
                      </span>
                    </div>
                  )}

                  <h4 className={`font-semibold text-lg mb-3 pr-16 ${textPrimary}`}>
                    {topic.title}
                  </h4>

                  <p
                    className={`text-sm opacity-80 mb-4 line-clamp-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    {topic.description ||
                      "Fresh insights and trends from the tech world."}
                  </p>

                  <Link
                    to={`/topics/${topic.slug}`}
                    className={`inline-block text-xs font-medium underline transition-colors
                      ${theme === "dark"
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-indigo-600 hover:text-indigo-500"
                      }`}
                  >
                    Read →
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>


      <section className="relative py-24">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-20 blur-2xl"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h2 className={`text-4xl font-bold mb-6 ${textPrimary}`}>Join Our Learning Community</h2>
          <p className={`max-w-2xl mx-auto mb-8 ${textSecondary}`}>
            Be part of a growing ecosystem where developers share, build, and grow together.
            Let’s shape the future of tech education, one project at a time.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-md hover:opacity-90 transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
