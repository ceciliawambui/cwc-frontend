import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Layers,
  Clock,
  Star,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  X,
  Grid3x3,
  TrendingUp,
  PlayCircle,
  Bookmark, 
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import useAuth from "../../../hooks/useAuth"; 
import client from "../../auth/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================================
   Modern Topic Card with Bookmark
================================ */
const TopicCard = React.memo(({ topic, theme, onClick, isBookmarked, onToggleBookmark, index }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  const handleBookmarkClick = (e) => {
    e.stopPropagation(); // Prevent navigating to topic when clicking bookmark
    onToggleBookmark(topic.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
      onClick={() => onClick(topic.slug)}
      className="group cursor-pointer h-full"
    >
      <div
        className={`h-full rounded-2xl border p-6 transition-all duration-300 relative
          ${theme === "dark"
            ? "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl"
          }
          overflow-hidden`}
      >
        {/* Hover gradient overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
          ${theme === "dark" 
            ? "bg-gradient-to-br from-slate-800/30 to-slate-900/30" 
            : "bg-gradient-to-br from-slate-50 to-white"
          }`}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header & Bookmark */}
          <div className="flex items-start justify-between mb-3">
            <h4 className={`font-bold text-base line-clamp-2 flex-1 pr-8 ${textPrimary}`}>
              {topic.title}
            </h4>
            
            {/* Bookmark Button */}
            <button
              onClick={handleBookmarkClick}
              className={`absolute top-0 right-0 p-2 rounded-full transition-all duration-300 z-20
                ${isBookmarked 
                  ? "text-emerald-500 bg-emerald-500/10" 
                  : (theme === "dark" ? "text-slate-600 hover:bg-slate-800 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600")
                }`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Topic"}
            >
              <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Description */}
          <p className={`text-sm line-clamp-3 mb-4 flex-1 ${textSecondary}`}>
            {topic.description || "Explore this topic to learn more about the subject."}
          </p>

          {/* Footer: Video Badge & Arrow */}
          <div className="flex items-center justify-between mt-auto">
             {topic.video_url ? (
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                <PlayCircle size={14} />
                <span>Includes video</span>
              </div>
            ) : <span />}

            <div className={`flex items-center text-xs font-semibold transition-colors
               ${theme === "dark" ? "text-slate-500 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-600"}`}>
               Start Learning
               <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

TopicCard.displayName = "TopicCard";

/* ================================
   Recent Topics Sidebar
================================ */
const RecentTopicsSidebar = ({ recentTopics, theme }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  if (recentTopics.length === 0) return null;

  return (
    <aside
      className={`lg:w-80 w-full rounded-2xl border p-6 mb-8 lg:mb-0
        ${theme === "dark"
          ? "bg-slate-900/50 border-slate-800"
          : "bg-white border-slate-200"
        }`}
    >
      <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textPrimary}`}>
        <TrendingUp size={20} />
        Recent Topics
      </h3>
      <ul className="space-y-2">
        {recentTopics.map((topic) => (
          <motion.li
            key={topic.id}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to={`/topics/${topic.slug}`}
              className={`block p-3 rounded-xl border transition-all
                ${theme === "dark"
                  ? "border-slate-800 hover:bg-slate-800/50 hover:border-slate-700"
                  : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              <p className={`font-semibold text-sm line-clamp-1 mb-1 ${textPrimary}`}>
                {topic.title}
              </p>
              <p className={`text-xs line-clamp-2 ${textSecondary}`}>
                {topic.description || "No description"}
              </p>
            </Link>
          </motion.li>
        ))}
      </ul>
    </aside>
  );
};

/* ================================
   Search Bar Component
================================ */
const SearchBar = ({ theme, searchTerm, setSearchTerm }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="relative max-w-2xl mx-auto">
      <Search 
        className={`absolute left-5 top-1/2 -translate-y-1/2 ${textSecondary}`}
        size={20}
      />
      <input
        type="text"
        placeholder="Search topics in this course..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full pl-14 pr-12 py-4 rounded-xl border-2 text-sm
          transition-all duration-300 focus:outline-none
          ${theme === "dark"
            ? "bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-slate-700"
            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
          }
          focus:shadow-lg`}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
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
        Loading course...
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
        {error || "Course not found"}
      </h2>
      <p className={`text-sm mb-8 text-center max-w-md ${textSecondary}`}>
        The course you're looking for doesn't exist or has been removed.
      </p>
      <Link
        to="/courses"
        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
          ${theme === "dark"
            ? "bg-white text-slate-900 hover:bg-slate-100"
            : "bg-slate-900 text-white hover:bg-slate-800"
          }
          shadow-lg hover:shadow-xl hover:scale-105`}
      >
        Browse All Courses
      </Link>
    </div>
  );
};

/* ================================
   Empty State
================================ */
const EmptyState = ({ theme, searchTerm, hasSearch }) => {
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
        {hasSearch ? "No topics found" : "No topics yet"}
      </h3>
      <p className={`text-sm ${textSecondary}`}>
        {hasSearch 
          ? `No topics match "${searchTerm}"`
          : "Topics will appear here as they're added to this course"
        }
      </p>
    </div>
  );
};

/* ================================
   Course Detail Page
================================ */
export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth(); 

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Course Data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) {
        setError("No course identifier provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/courses/${slug}/`);
        
        if (!res.data) throw new Error("No data returned from API");

        setCourse(res.data);
        setTopics(res.data.topics || []);
      } catch (err) {
        console.error("Failed to load course:", err);
        if (err.response?.status === 404) {
          setError("Course not found");
        } else {
          setError("Failed to load course. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [slug]);

  // 2. Fetch User Bookmarks (If user is logged in)
  useEffect(() => {
    if (!user) {
      setBookmarkedTopicIds(new Set());
      return;
    }
  
    const fetchBookmarks = async () => {
      try {
        const res = await client.get("/bookmarks/");
  
        const bookmarks = res.data.results || [];
        const ids = new Set(bookmarks.map(b => b.topic.id));
  
        setBookmarkedTopicIds(ids);
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      }
    };
  
    fetchBookmarks();
  }, [user]);
  

  // 3. Handle Bookmark Toggle
  const handleBookmarkToggle = async (topicId) => {
    // If not authenticated, redirect to login
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Optimistic UI Update: Toggle state immediately for better UX
    setBookmarkedTopicIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });

    try {
      // Call API to toggle bookmark
      // Ensure you send Auth headers if required
      await client.post(`${BASE_URL}/api/topics/${topicId}/bookmark/`);
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
      // Revert state if API call fails
      setBookmarkedTopicIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(topicId)) {
          newSet.delete(topicId);
        } else {
          newSet.add(topicId);
        }
        return newSet;
      });
      alert("Something went wrong saving the topic.");
    }
  };

  // Memoized recent topics
  const recentTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    return [...topics]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);
  }, [topics]);

  // Memoized filtered topics
  const filteredTopics = useMemo(() => {
    if (!searchTerm.trim()) return topics;
    const searchLower = searchTerm.toLowerCase();
    return topics.filter((topic) => 
      topic.title.toLowerCase().includes(searchLower) ||
      (topic.description && topic.description.toLowerCase().includes(searchLower))
    );
  }, [topics, searchTerm]);

  // Stable navigation callback
  const handleTopicClick = useCallback(
    (topicSlug) => {
      navigate(`/topics/${topicSlug}`);
    },
    [navigate]
  );

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  // Loading state
  if (loading) return <LoadingState theme={theme} />;

  // Error state
  if (error || !course) return <ErrorState theme={theme} error={error} />;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative pt-24 pb-12 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          {/* <Link
            to="/courses"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-8
              ${theme === "dark" ? "text-slate-400 hover:text-slate-300" : "text-slate-600 hover:text-slate-700"}
              transition-colors group`}
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Courses
          </Link> */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Category Badge
            {course.category && (
              <div className="mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
                  ${theme === "dark" 
                    ? "bg-slate-800 text-slate-300 border border-slate-700" 
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <Grid3x3 size={14} />
                  {course.category}
                </span>
              </div>
            )} */}

            {/* Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
              {course.title}
            </h1>

            {/* Description */}
            <p className={`text-base md:text-lg max-w-3xl leading-relaxed mb-8 ${textSecondary}`}>
              {course.description || 
                "Dive into an immersive learning experience filled with practical lessons and insights."}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl
                ${theme === "dark" ? "bg-slate-900/50" : "bg-slate-50"}`}
              >
                <Layers size={18} className={theme === "dark" ? "text-slate-400" : "text-slate-600"} />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  {topics.length} {topics.length === 1 ? 'Topic' : 'Topics'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl
                ${theme === "dark" ? "bg-slate-900/50" : "bg-slate-50"}`}
              >
                <Clock size={18} className={theme === "dark" ? "text-slate-400" : "text-slate-600"} />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  Updated Regularly
                </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl
                ${theme === "dark" ? "bg-slate-900/50" : "bg-slate-50"}`}
              >
                <Star size={18} className="text-yellow-500" />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  Featured
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search Bar */}
            {topics.length > 0 && (
              <div className="mb-12">
                <SearchBar theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </div>
            )}

            {/* Topics Section */}
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
                  {searchTerm ? "Search Results" : "All Topics"}
                </h2>
                {filteredTopics.length > 0 && (
                  <span className={`text-sm ${textSecondary}`}>
                    {filteredTopics.length} {filteredTopics.length === 1 ? 'topic' : 'topics'}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </span>
                )}
              </div>

              {/* Topics Grid or Empty State */}
              <AnimatePresence mode="wait">
                {topics.length === 0 ? (
                  <motion.div
                    key="no-topics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState theme={theme} hasSearch={false} />
                  </motion.div>
                ) : filteredTopics.length > 0 ? (
                  <motion.div
                    key="topics-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredTopics.map((topic, index) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        theme={theme}
                        index={index}
                        onClick={handleTopicClick}
                        // Pass bookmark props
                        isBookmarked={bookmarkedTopicIds.has(topic.id)}
                        onToggleBookmark={handleBookmarkToggle}
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
                    <EmptyState theme={theme} searchTerm={searchTerm} hasSearch={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
              <RecentTopicsSidebar recentTopics={recentTopics} theme={theme} />
            </div>
          </div>
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
            Explore More Courses
          </h2>
          <p className={`text-sm mb-6 max-w-xl mx-auto ${textSecondary}`}>
            Discover other learning paths and expand your knowledge across different topics
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/courses"
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
                ${theme === "dark"
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-800"
                }
                shadow-lg hover:shadow-xl hover:scale-105`}
            >
              Browse All Courses
            </Link>
            <Link
              to="/categories"
              className={`px-6 py-3 rounded-xl border font-semibold text-sm transition-all
                ${theme === "dark"
                  ? "border-slate-700 text-white hover:bg-slate-800"
                  : "border-slate-300 text-slate-900 hover:bg-slate-50"
                }
                hover:scale-105`}
            >
              View Categories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}