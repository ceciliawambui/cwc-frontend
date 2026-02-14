/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bookmark,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Layers,
  Zap,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import heroImg from "../../assets/student.jpg";
import Chatbot from "../../components/Chatbot";
import SafeIcon from "../../components/SafeIcon";
import { resolveCourseIcon } from "../../utils/courseIcons";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/* ================================
   Scroll To Top
================================ */
const ScrollTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl
            bg-slate-900 dark:bg-white text-white dark:text-slate-900
            shadow-lg hover:shadow-xl transition-all duration-300
            hover:scale-110 border border-slate-800 dark:border-slate-200"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* ================================
   Modern Card Component
================================ */
const ModernCard = ({ theme, className = "", children, hoverable = true }) => (
  <div
    className={`rounded-2xl border transition-all duration-300
      ${theme === "dark"
        ? "bg-slate-900/50 border-slate-800 backdrop-blur-sm"
        : "bg-white border-slate-200"
      }
      ${hoverable ? "hover:shadow-xl hover:scale-[1.02]" : ""}
      ${className}`}
  >
    {children}
  </div>
);

/* ================================
   Topic Type Badge
================================ */
const TypeBadge = ({ type, size = "sm" }) => {
  const styles = {
    article: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", icon: BookOpen },
    video: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-300", icon: Layers },
    guide: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", icon: Zap },
    reference: { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-300", icon: Star },
    topic: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300", icon: BookOpen },
  };

  const config = styles[type] || styles.article;
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <Icon size={size === "sm" ? 12 : 14} />
      {type}
    </span>
  );
};

/* ================================
   Search Component with Results
================================ */
const SearchSection = ({ theme, allTopics }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allTopics
      .filter(topic =>
        topic.title.toLowerCase().includes(query) ||
        (topic.description && topic.description.toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [searchQuery, allTopics]);

  useEffect(() => {
    setShowResults(searchQuery.trim().length > 0);
  }, [searchQuery]);

  const handleClear = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="relative">
        <Search
          className={`absolute left-5 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          size={20}
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics, courses, technologies..."
          className={`w-full pl-14 pr-12 py-4 rounded-2xl border-2 text-sm
            transition-all duration-300 focus:outline-none
            ${theme === "dark"
              ? "bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-slate-700"
              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
            }
            focus:shadow-lg`}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className={`absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-lg
              ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
          >
            <X size={18} className={theme === "dark" ? "text-slate-400" : "text-slate-500"} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-50 w-full mt-3 rounded-2xl border overflow-hidden
              ${theme === "dark"
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200"
              }
              shadow-2xl`}
          >
            {filteredTopics.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <div className={`px-4 py-3 text-xs font-medium border-b
                  ${theme === "dark"
                    ? "text-slate-400 border-slate-800 bg-slate-900/50"
                    : "text-slate-600 border-slate-200 bg-slate-50"
                  }`}
                >
                  {filteredTopics.length} result{filteredTopics.length !== 1 ? 's' : ''} found
                </div>
                {filteredTopics.map((topic, idx) => (
                  <Link
                    key={topic.id}
                    to={`/topics/by-slug/${topic.slug}`}
                    onClick={() => handleClear()}
                    className={`block px-5 py-4 border-b transition-colors
                      ${theme === "dark"
                        ? "border-slate-800 hover:bg-slate-800/50"
                        : "border-slate-100 hover:bg-slate-50"
                      }
                      ${idx === filteredTopics.length - 1 ? "border-b-0" : ""}
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold mb-1 line-clamp-1
                          ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                        >
                          {topic.title}
                        </h4>
                        <p className={`text-xs line-clamp-2
                          ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {topic.description || "No description available"}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={theme === "dark" ? "text-slate-600" : "text-slate-400"}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  No topics found for "{searchQuery}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================================
   Beginner Courses Grid
================================ */
const BeginnerCoursesSection = ({ theme, courses }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  if (!courses || courses.length === 0) return null;

  return (
    <section className="container mx-auto px-6 mb-24">
      <div className="text-center mb-12">
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4
          ${theme === "dark"
            ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          Perfect for Beginners
        </span>
        <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textPrimary}`}>
          Start Your Learning Journey
        </h2>
        <p className={`text-sm max-w-2xl mx-auto ${textSecondary}`}>
          Handpicked courses designed for those taking their first steps in tech.
          Clear explanations, practical examples, and supportive content.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => {
          const Icon = resolveCourseIcon(course.title);
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ModernCard theme={theme} className="p-6 h-full flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
                  ${theme === "dark"
                    ? "bg-slate-800 text-emerald-400"
                    : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <SafeIcon icon={Icon} className="w-6 h-6" />
                </div>

                <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>
                  {course.title}
                </h3>

                <p className={`text-sm mb-4 flex-1 line-clamp-3 ${textSecondary}`}>
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold
                      text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all"
                  >
                    Start Learning
                    <ArrowUpRight size={14} />
                  </Link>
                  <span className={`text-xs ${textSecondary}`}>
                    Beginner
                  </span>
                </div>
              </ModernCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

/* ================================
   Landing Page
================================ */
export default function LandingPage() {
  const { theme } = useTheme();

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [beginnerCourses, setBeginnerCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]);

  useEffect(() => {
    // Fetch all topics for search
    axios.get(`${API_BASE_URL}/api/topics/`).then(res => {
      const topicsData = res.data.results || res.data;
      setAllTopics(topicsData);
      setTopics(topicsData.slice(0, 6));
    });

    // Fetch categories
    axios.get(`${API_BASE_URL}/api/categories/`).then(res => {
      setCategories((res.data.results || res.data).slice(0, 3));
    });

    // Fetch courses
    axios.get(`${API_BASE_URL}/api/courses/`).then(res => {
      const coursesData = res.data.results || res.data;
      setCourses(coursesData.slice(0, 3));

      // Filter beginner courses (you can customize this logic)
      const beginnerFiltered = coursesData
        .filter(course =>
          course.title.toLowerCase().includes('intro') ||
          course.title.toLowerCase().includes('beginner') ||
          course.title.toLowerCase().includes('basics') ||
          course.title.toLowerCase().includes('fundamentals') ||
          course.description?.toLowerCase().includes('beginner')
        )
        .slice(0, 6);

      // If no courses match, just take the first 6
      setBeginnerCourses(beginnerFiltered.length > 0 ? beginnerFiltered : coursesData.slice(0, 6));
    });
  }, []);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="min-h-screen">

      {/* ================= HERO ================= */}
      <section className="relative pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
                  ${theme === "dark"
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <TrendingUp size={14} />
                  Knowledge Platform for Developers
                </span>
              </div>

              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
                Learn at your own pace.{" "}
                <span className="text-[#4b9966]">
                  Master new skills.
                </span>
              </h1>


              <p className={`text-base md:text-lg mb-8 max-w-xl leading-relaxed ${textSecondary}`}>
                DevNook is a resource-first learning platform. Explore curated content,
                save what matters, and build knowledge that sticks, all at your own rhythm.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/categories"
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
                    ${theme === "dark"
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                    }
                    shadow-lg hover:shadow-xl hover:scale-105`}
                >
                  Explore Categories
                </Link>
                <Link
                  to="/courses"
                  className={`px-6 py-3 rounded-xl border font-semibold text-sm transition-all
                    ${theme === "dark"
                      ? "border-slate-700 text-white hover:bg-slate-800"
                      : "border-slate-300 text-slate-900 hover:bg-slate-50"
                    }
                    hover:scale-105`}
                >
                  Browse Courses
                </Link>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-20
                  ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`}
                />
                <img
                  src={heroImg}
                  alt="Learning Experience"
                  className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto lg:max-w-none"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH ================= */}
      <section className="container mx-auto px-6 mb-20">
        <SearchSection theme={theme} allTopics={allTopics} />
      </section>

      {/* ================= BEGINNER COURSES ================= */}
      <BeginnerCoursesSection theme={theme} courses={beginnerCourses} />

      {/* ================= CATEGORIES ================= */}
      <section className="container mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textPrimary}`}>
            Explore by Category
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            Dive into organized collections of knowledge
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ModernCard theme={theme} className="p-8 h-full flex flex-col">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4
                  ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
                >
                  <Layers size={20} className={theme === "dark" ? "text-slate-400" : "text-slate-600"} />
                </div>

                <h3 className={`text-xl font-bold mb-3 ${textPrimary}`}>
                  {cat.title}
                </h3>

                <p className={`text-sm mb-6 flex-1 ${textSecondary}`}>
                  {cat.description || "Explore curated knowledge in this domain."}
                </p>

                <Link
                  to={`/categories/${cat.slug}`}
                  className={`inline-flex items-center gap-2 text-sm font-semibold
                    ${theme === "dark" ? "text-slate-300" : "text-slate-700"}
                    hover:gap-3 transition-all`}
                >
                  Explore
                  <ArrowUpRight size={14} />
                </Link>
              </ModernCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FEATURED COURSES ================= */}
      <section className="container mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textPrimary}`}>
            Featured Courses
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            Comprehensive learning paths for skill development
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const Icon = resolveCourseIcon(course.title);
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ModernCard theme={theme} className="p-8 h-full flex flex-col group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                    ${theme === "dark"
                      ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}
                  >
                    <SafeIcon icon={Icon} className="w-6 h-6" />
                  </div>

                  <h3 className={`text-xl font-bold mb-3 ${textPrimary}`}>
                    {course.title}
                  </h3>

                  <p className={`text-sm mb-6 flex-1 line-clamp-3 ${textSecondary}`}>
                    {course.description}
                  </p>

                  <Link
                    to={`/courses/${course.slug}`}
                    className={`inline-flex items-center gap-2 text-sm font-semibold
                      ${theme === "dark" ? "text-slate-300" : "text-slate-700"}
                      hover:gap-3 transition-all`}
                  >
                    View Course
                    <ArrowUpRight size={14} />
                  </Link>
                </ModernCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================= RECENT TOPICS ================= */}
      <section className="container mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textPrimary}`}>
            Recent Topics
          </h2>
          <p className={`text-sm ${textSecondary}`}>
            Latest additions to our knowledge base
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, idx) => {
            const courseTitle = topic.course_info?.title || "";
            const CourseIcon = resolveCourseIcon(courseTitle);

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ModernCard theme={theme} className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <TypeBadge type="topic" />
                    {courseTitle && CourseIcon && (
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                          ${theme === "dark"
                            ? "bg-slate-800 text-slate-300"
                            : "bg-slate-100 text-slate-700"
                          }`}
                        title={courseTitle}
                      >
                        <SafeIcon icon={CourseIcon} className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{courseTitle}</span>
                      </div>
                    )}
                  </div>

                  <h4 className={`text-base font-bold mb-2 line-clamp-2 ${textPrimary}`}>
                    {topic.title}
                  </h4>

                  <p className={`text-sm mb-4 flex-1 line-clamp-2 ${textSecondary}`}>
                    {topic.description || "Learn more about this topic"}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <Link
                      to={`/topics/by-slug/${topic.slug}`}
                      className={`text-sm font-semibold
                        ${theme === "dark" ? "text-slate-300" : "text-slate-700"}
                        hover:underline`}
                    >
                      Read →
                    </Link>
                    <button
                      className={`p-1.5 rounded-lg transition-colors
                        ${theme === "dark"
                          ? "hover:bg-slate-800 text-slate-400"
                          : "hover:bg-slate-100 text-slate-500"
                        }`}
                      title="Save for later"
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>
                </ModernCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative py-20 mb-16">
        <div className="container mx-auto px-6">
          <ModernCard theme={theme} className="p-12 md:p-16 text-center" hoverable={false}>
            <div className="max-w-3xl mx-auto">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>
                Ready to start learning?
              </h2>
              <p className={`text-base mb-8 ${textSecondary}`}>
                Join thousands of learners building skills that matter.
                Free to start, forever accessible.
              </p>
              <Link
                to="/register"
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm
                  ${theme === "dark"
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                  }
                  shadow-lg hover:shadow-xl transition-all hover:scale-105`}
              >
                Get Started Free
                <ChevronRight size={16} />
              </Link>
            </div>
          </ModernCard>
        </div>
      </section>

      <Chatbot />
      <ScrollTop />
    </div>
  );
}