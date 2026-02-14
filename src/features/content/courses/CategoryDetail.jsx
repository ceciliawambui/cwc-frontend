import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import client from "../../auth/api";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Search,
  BookOpen,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  X,
  FileText,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { resolveCourseIcon } from '../../../utils/courseIcons';
import SafeIcon from "../../../components/SafeIcon";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================================
   Topic Item Component
================================ */
const TopicItem = ({ topic, theme, index }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/topics/by-slug/${topic.slug}`}
        className={`block px-4 py-3 rounded-lg transition-all duration-200
          ${theme === "dark"
            ? "hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700"
            : "hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
          }
          group`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`mt-0.5 ${textSecondary}`}>
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold mb-1 line-clamp-1 ${textPrimary}`}>
                {topic.title}
              </h4>
              {topic.description && (
                <p className={`text-xs line-clamp-2 ${textSecondary}`}>
                  {topic.description}
                </p>
              )}
            </div>
          </div>
          <ChevronRight 
            size={16} 
            className={`shrink-0 transition-transform group-hover:translate-x-1
              ${theme === "dark" ? "text-slate-600" : "text-slate-400"}`}
          />
        </div>
      </Link>
    </motion.div>
  );
};

/* ================================
   Expandable Course Card with Topics
================================ */
const CourseCard = React.memo(({ course, theme, onClick, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";
  const CourseIcon = resolveCourseIcon(course.title);

  // Use the topicCount that was fetched in the parent component
  const topicCount = course.topicCount || 0;

  const handleToggleTopics = async (e) => {
    e.stopPropagation();
    
    if (!isExpanded && topics.length === 0 && topicCount > 0) {
      setLoadingTopics(true);
      try {
        const res = await client.get(`${BASE_URL}/api/courses/${course.slug}/`);
        setTopics(res.data.topics || res.data.articles || []);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setLoadingTopics(false);
      }
    }
    
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
    >
      <div
        className={`rounded-2xl border transition-all duration-300
          ${theme === "dark"
            ? "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
          }
          overflow-hidden`}
      >
        {/* Course Header - Clickable */}
        <div
          onClick={() => onClick(course.slug)}
          className="p-6 cursor-pointer relative"
        >
          {/* Hover gradient overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
            ${theme === "dark" 
              ? "bg-gradient-to-br from-slate-800/20 to-slate-900/20" 
              : "bg-gradient-to-br from-slate-50/50 to-white/50"
            }`}
          />

          <div className="relative z-10">
            {/* Icon & Title Row */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                transition-all duration-300 group-hover:scale-110
                ${theme === "dark" 
                  ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700" 
                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                }`}
              >
                <SafeIcon icon={CourseIcon} className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg line-clamp-2 mb-1 ${textPrimary}`}>
                  {course.title}
                </h3>
              </div>

              <ChevronRight
                size={20}
                className={`shrink-0 ml-2 transition-all duration-300 
                  ${theme === "dark" ? "text-slate-600" : "text-slate-400"}
                  group-hover:translate-x-1`}
              />
            </div>

            {/* Description */}
            <p className={`text-sm line-clamp-2 mb-4 ${textSecondary}`}>
              {course.description || "Explore comprehensive resources and learning materials in this course."}
            </p>

            {/* Stats & Topics Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`flex items-center gap-1.5 text-xs font-medium
                  ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
                >
                  <BookOpen size={14} />
                  {topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-medium
                  ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}
                >
                  <Clock size={14} />
                  Updated
                </span>
              </div>

              {topicCount > 0 && (
                <button
                  onClick={handleToggleTopics}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-200
                    ${theme === "dark"
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  {isExpanded ? 'Hide Topics' : 'Show Topics'}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Topics Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`px-6 pb-6 pt-2 border-t
                ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}
              >
                {loadingTopics ? (
                  <div className="flex items-center justify-center py-8">
                    <div className={`w-8 h-8 rounded-lg border-2 border-t-transparent animate-spin
                      ${theme === "dark" ? "border-slate-700" : "border-slate-300"}`}
                    />
                  </div>
                ) : topics.length > 0 ? (
                  <div className="space-y-2">
                    <div className={`text-xs font-semibold mb-3 ${textSecondary}`}>
                      Course Topics ({topics.length})
                    </div>
                    {topics.map((topic, idx) => (
                      <TopicItem 
                        key={topic.id} 
                        topic={topic} 
                        theme={theme} 
                        index={idx}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className={`text-sm ${textSecondary}`}>
                      No topics available yet
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

CourseCard.displayName = "CourseCard";

/* ================================
   Search Bar Component
================================ */
const SearchBar = ({ theme, search, setSearch }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="relative max-w-2xl">
      <Search 
        className={`absolute left-5 top-1/2 -translate-y-1/2 ${textSecondary}`}
        size={20}
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search courses in this category..."
        className={`w-full pl-14 pr-12 py-4 rounded-xl border-2 text-sm
          transition-all duration-300 focus:outline-none
          ${theme === "dark"
            ? "bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-slate-700"
            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
          }
          focus:shadow-lg`}
      />
      {search && (
        <button
          onClick={() => setSearch("")}
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
        Loading category...
      </p>
    </div>
  );
};

/* ================================
   Error State
================================ */
const ErrorState = ({ theme, error }) => {
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
        {error || "Category not found"}
      </h2>
      <p className={`text-sm mb-8 ${textSecondary}`}>
        This category might have been moved or doesn't exist
      </p>
      <Link
        to="/categories"
        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
          ${theme === "dark"
            ? "bg-white text-slate-900 hover:bg-slate-100"
            : "bg-slate-900 text-white hover:bg-slate-800"
          }
          shadow-lg hover:shadow-xl hover:scale-105`}
      >
        Browse All Categories
      </Link>
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
          <Layers size={28} className={textSecondary} />
        )}
      </div>
      <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>
        {hasSearch ? `No courses found` : "No courses yet"}
      </h3>
      <p className={`text-sm ${textSecondary}`}>
        {hasSearch 
          ? `No courses match "${searchQuery}"`
          : "Courses will appear here as they're added to this category"
        }
      </p>
    </div>
  );
};

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [category, setCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTopicCounts, setLoadingTopicCounts] = useState(true);
  const [error, setError] = useState(null);

  /* Fetch category and then fetch topic counts */
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) {
        setError("No category specified");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch category with basic course info
        const categoryRes = await client.get(`${BASE_URL}/api/categories/${slug}/`);
        setCategory(categoryRes.data);
        const coursesData = categoryRes.data.courses || [];
        
        // Show courses immediately (without topic counts)
        setCourses(coursesData.map(course => ({ ...course, topicCount: 0 })));
        setLoading(false);

        // Step 2: Fetch topic counts for each course in parallel
        setLoadingTopicCounts(true);
        const coursesWithCounts = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const courseRes = await client.get(`${BASE_URL}/api/courses/${course.slug}/`);
              const topics = courseRes.data.topics || courseRes.data.articles || [];
              return {
                ...course,
                topicCount: topics.length
              };
            } catch (err) {
              console.error(`Failed to fetch topics for ${course.title}:`, err);
              return {
                ...course,
                topicCount: 0
              };
            }
          })
        );

        setCourses(coursesWithCounts);
        setLoadingTopicCounts(false);
      } catch (err) {
        console.error("Error fetching category:", err);
        if (err.response?.status === 404) {
          setError("Category not found");
        } else {
          setError("Failed to load category");
        }
        setLoading(false);
        setLoadingTopicCounts(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  /* Filtered courses */
  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [courses, search]);

  /* Calculate total topics across all courses */
  const totalTopics = useMemo(() => {
    return courses.reduce((sum, course) => sum + (course.topicCount || 0), 0);
  }, [courses]);

  const handleCourseClick = useCallback(
    (courseSlug) => {
      navigate(`/courses/${courseSlug}`);
    },
    [navigate]
  );

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  /* Loading */
  if (loading) {
    return <LoadingState theme={theme} />;
  }

  /* Error */
  if (error || !category) {
    return <ErrorState theme={theme} error={error} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative pt-24 pb-12 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <Link
            to="/categories"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-8
              ${theme === "dark" ? "text-slate-400 hover:text-slate-300" : "text-slate-600 hover:text-slate-700"}
              transition-colors group`}
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Categories
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
              {category.title}
            </h1>

            {/* Description */}
            <p className={`text-base md:text-lg max-w-3xl leading-relaxed mb-8 ${textSecondary}`}>
              {category.description ||
                "Explore curated courses and comprehensive learning resources in this domain."}
            </p>

            {/* Enhanced Stats */}
            <div className="flex flex-wrap gap-4">
              <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl
                ${theme === "dark" 
                  ? "bg-slate-900/50 border border-slate-800" 
                  : "bg-slate-50 border border-slate-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${theme === "dark" ? "bg-slate-800" : "bg-white"}`}
                >
                  <Layers size={18} className={theme === "dark" ? "text-slate-400" : "text-slate-600"} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${textPrimary}`}>
                    {courses.length}
                  </div>
                  <div className={`text-xs ${textSecondary}`}>
                    {courses.length === 1 ? 'Course' : 'Courses'}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl
                ${theme === "dark" 
                  ? "bg-slate-900/50 border border-slate-800" 
                  : "bg-slate-50 border border-slate-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                  ${theme === "dark" ? "bg-slate-800" : "bg-white"}`}
                >
                  <BookOpen size={18} className={theme === "dark" ? "text-slate-400" : "text-slate-600"} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${textPrimary}`}>
                    {loadingTopicCounts ? (
                      <div className={`w-12 h-7 rounded animate-pulse
                        ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`}
                      />
                    ) : (
                      totalTopics
                    )}
                  </div>
                  <div className={`text-xs ${textSecondary}`}>
                    Total {totalTopics === 1 ? 'Topic' : 'Topics'}
                  </div>
                </div>
              </div>

              {filteredCourses.length > 0 && search && (
                <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl
                  ${theme === "dark" 
                    ? "bg-emerald-900/20 border border-emerald-800" 
                    : "bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  <Search size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <div className={`text-sm font-medium ${textPrimary}`}>
                    {filteredCourses.length} result{filteredCourses.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-16">
        {/* Search Bar */}
        {courses.length > 0 && (
          <div className="mb-12">
            <SearchBar theme={theme} search={search} setSearch={setSearch} />
          </div>
        )}

        {/* Courses Section */}
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
              {search ? "Search Results" : "All Courses"}
            </h2>
            {filteredCourses.length > 0 && (
              <span className={`text-sm ${textSecondary}`}>
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                {search && ` matching "${search}"`}
              </span>
            )}
          </div>

          {/* Courses Grid or Empty State */}
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
                className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {filteredCourses.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    theme={theme}
                    onClick={handleCourseClick}
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
                <EmptyState theme={theme} searchQuery={search} hasSearch={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
            Explore More Learning Paths
          </h2>
          <p className={`text-sm mb-6 max-w-xl mx-auto ${textSecondary}`}>
            Discover other categories and expand your knowledge across different domains
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
              Browse All Categories
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