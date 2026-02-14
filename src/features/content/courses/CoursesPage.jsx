import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import {
  CalendarDays,
  Search,
  X,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  Filter,
  Grid3x3,
  List,
  Sparkles,
} from "lucide-react";
import { resolveCourseIcon } from '../../../utils/courseIcons';
import SafeIcon from "../../../components/SafeIcon";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================================
   Modern Course Card Component
================================ */
const CourseCard = React.memo(function CourseCard({ course, theme, index }) {
  const date = useMemo(() => {
    if (!course.created_at) return "Recently added";
    const d = new Date(course.created_at);
    return isNaN(d) ? "Recently added" : d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, [course.created_at]);

  const icon = useMemo(
    () => resolveCourseIcon(course?.title),
    [course?.title]
  );

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  if (!course.slug) {
    console.warn(`Course "${course.title}" has no slug!`);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      <Link to={`/courses/${course.slug}`} className="block h-full">
        <div
          className={`relative h-full rounded-2xl border p-6 transition-all duration-300
            ${theme === "dark"
              ? "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl"
            }
            overflow-hidden`}
        >
          {/* Hover gradient overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            ${theme === "dark" 
              ? "bg-gradient-to-br from-slate-800/30 to-slate-900/30" 
              : "bg-gradient-to-br from-slate-50 to-white"
            }`}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                transition-all duration-300 group-hover:scale-110
                ${theme === "dark" 
                  ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300" 
                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700"
                }`}
              >
                <SafeIcon icon={icon} className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold mb-1 line-clamp-2 ${textPrimary}
                  transition-colors duration-300`}
                >
                  {course.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className={`text-sm mb-6 line-clamp-3 flex-1 leading-relaxed ${textSecondary}`}>
              {course.description || "Explore comprehensive lessons and resources designed to enhance your skills."}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                <CalendarDays size={14} />
                <span>{date}</span>
              </div>

              <div className={`inline-flex items-center gap-2 text-sm font-semibold
                ${theme === "dark" ? "text-slate-300" : "text-slate-700"}
                group-hover:gap-3 transition-all duration-300`}
              >
                View Course
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

/* ================================
   Search Bar Component
================================ */
const SearchBar = ({ theme, searchQuery, setSearchQuery }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="relative w-full max-w-2xl">
      <Search 
        className={`absolute left-5 top-1/2 -translate-y-1/2 ${textSecondary}`}
        size={20}
      />
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search courses by title or description..."
        className={`w-full pl-14 pr-12 py-4 rounded-xl border-2 text-sm
          transition-all duration-300 focus:outline-none
          ${theme === "dark"
            ? "bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-slate-700"
            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
          }
          focus:shadow-lg`}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
            ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
        >
          <X size={16} className={textSecondary} />
        </button>
      )}
    </div>
  );
};

/* ================================
   Loading State
================================ */
const LoadingState = ({ theme }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className={`w-16 h-16 rounded-2xl border-4 border-t-transparent animate-spin mb-6
        ${theme === "dark" ? "border-slate-700" : "border-slate-300"}`}
      />
      <p className={`text-base ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
        Loading courses...
      </p>
    </div>
  );
};

/* ================================
   Error State
================================ */
const ErrorState = ({ theme, error, onRetry }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6
        ${theme === "dark" ? "bg-red-900/20" : "bg-red-50"}`}
      >
        <AlertCircle size={40} className="text-red-500" />
      </div>
      <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>
        Failed to load courses
      </h2>
      <p className={`text-sm mb-8 text-center max-w-md ${textSecondary}`}>
        {error || "Something went wrong while fetching the courses"}
      </p>
      <button
        onClick={onRetry}
        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
          ${theme === "dark"
            ? "bg-white text-slate-900 hover:bg-slate-100"
            : "bg-slate-900 text-white hover:bg-slate-800"
          }
          shadow-lg hover:shadow-xl hover:scale-105`}
      >
        Try Again
      </button>
    </div>
  );
};

/* ================================
   Empty State
================================ */
const EmptyState = ({ theme, searchQuery, hasSearch }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="text-center py-20">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
        ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
      >
        {hasSearch ? (
          <Search size={28} className={textSecondary} />
        ) : (
          <BookOpen size={28} className={textSecondary} />
        )}
      </div>
      <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>
        {hasSearch ? "No courses found" : "No courses available"}
      </h3>
      <p className={`text-sm ${textSecondary}`}>
        {hasSearch 
          ? `No courses match "${searchQuery}". Try a different search term.`
          : "Courses will appear here as they're added. Check back soon!"
        }
      </p>
    </div>
  );
};

/* ================================
   Stats Bar Component
================================ */
const StatsBar = ({ theme, totalCourses, filteredCount, searchQuery }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl
        ${theme === "dark" ? "bg-slate-900/50" : "bg-slate-50"}`}
      >
        <BookOpen size={16} className={textSecondary} />
        <span className={`font-medium ${textSecondary}`}>
          {searchQuery ? `${filteredCount} of ${totalCourses}` : `${totalCourses}`} 
          {' '}{totalCourses === 1 ? 'Course' : 'Courses'}
        </span>
      </div>
      {searchQuery && (
        <span className={textSecondary}>
          matching "{searchQuery}"
        </span>
      )}
    </div>
  );
};

/* ================================
   Courses Page
================================ */
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/courses/`);
      let data = res.data;

      // Handle different response structures
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data.results && Array.isArray(data.results)) {
        setCourses(data.results);
      } else {
        setError("Invalid response format from server");
        setCourses([]);
        return;
      }

      const coursesData = Array.isArray(data) ? data : data.results;
      const missingSlug = coursesData.filter(c => !c.slug);
      if (missingSlug.length > 0) {
        console.warn("Courses missing slug:", missingSlug.map(c => c.title));
      }

    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    
    const query = searchQuery.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      (course.description && course.description.toLowerCase().includes(query))
    );
  }, [courses, searchQuery]);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  if (loading) {
    return <LoadingState theme={theme} />;
  }

  if (error) {
    return <ErrorState theme={theme} error={error} onRetry={fetchCourses} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative pt-32 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
                ${theme === "dark" 
                  ? "bg-slate-800 text-slate-300 border border-slate-700" 
                  : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <TrendingUp size={14} />
                Learning Paths
              </span>
            </div>

            {/* Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
              Discover{" "}
              <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>
                Courses
              </span>
            </h1>

            {/* Description */}
            <p className={`text-base md:text-lg leading-relaxed ${textSecondary}`}>
              Curated learning paths designed to help you master coding, design, 
              and innovation. From fundamentals to advanced topics, find the 
              perfect course for your journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Stats Section */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <SearchBar 
            theme={theme}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <StatsBar 
            theme={theme}
            totalCourses={courses.length}
            filteredCount={filteredCourses.length}
            searchQuery={searchQuery}
          />
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {courses.length === 0 ? (
            <motion.div
              key="no-courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState theme={theme} hasSearch={false} />
            </motion.div>
          ) : filteredCourses.length > 0 ? (
            <motion.div
              key="courses-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  theme={theme}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState theme={theme} searchQuery={searchQuery} hasSearch={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 pb-20">
        <div
          className={`rounded-2xl border p-12 text-center transition-all duration-300
            ${theme === "dark"
              ? "bg-slate-900/50 border-slate-800"
              : "bg-white border-slate-200"
            }`}
        >
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${textPrimary}`}>
            Looking for something specific?
          </h2>
          <p className={`text-sm mb-6 max-w-xl mx-auto ${textSecondary}`}>
            Explore our categories or browse individual topics to find exactly 
            what you need to learn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/categories"
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
                ${theme === "dark"
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-800"
                }
                shadow-lg hover:shadow-xl hover:scale-105`}
            >
              Browse Categories
            </Link>
            <Link
              to="/topics"
              className={`px-6 py-3 rounded-xl border font-semibold text-sm transition-all
                ${theme === "dark"
                  ? "border-slate-700 text-white hover:bg-slate-800"
                  : "border-slate-300 text-slate-900 hover:bg-slate-50"
                }
                hover:scale-105`}
            >
              Explore Topics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}