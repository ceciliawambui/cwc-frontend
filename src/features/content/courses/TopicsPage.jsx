import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Sparkles,
  PlayCircle,
  ArrowUpDown,
  Grid3x3,
  List,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import client from "../../auth/api";
import toast from "react-hot-toast";
import { resolveCourseIcon } from '../../../utils/courseIcons';
import SafeIcon from "../../../components/SafeIcon";
import useAuth from "../../../hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================================
   Topic Card Component
================================ */
const TopicCard = ({ topic, theme, onClick, isBookmarked, onToggleBookmark, index, viewMode }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";
  
  const courseTitle = topic.course_info?.title || "Unknown Course";
  const CourseIcon = resolveCourseIcon(courseTitle);

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onToggleBookmark(topic.id);
  };

  if (viewMode === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.3 }}
        onClick={() => onClick(topic.slug)}
        className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200
          ${theme === 'dark'
            ? 'border-slate-800 hover:bg-slate-900/50 hover:border-slate-700'
            : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
      >
        <div className="flex items-center gap-4">
          {/* Course Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <SafeIcon icon={CourseIcon} className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold mb-1 line-clamp-1 group-hover:text-blue-500 transition-colors
              ${textPrimary}`}>
              {topic.title}
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className={textSecondary}>{courseTitle}</span>
              {topic.reading_time && (
                <>
                  <span className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`} />
                  <span className={`flex items-center gap-1 ${textSecondary}`}>
                    <Clock size={12} />
                    {topic.reading_time} min
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {topic.video_url && (
              <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-500/10">
                <PlayCircle size={14} className="text-blue-500" />
              </div>
            )}
            <button
              onClick={handleBookmarkClick}
              className={`p-1.5 rounded-lg transition-colors
                ${isBookmarked 
                  ? 'text-emerald-500 bg-emerald-500/10' 
                  : theme === 'dark' 
                    ? 'text-slate-600 hover:bg-slate-800 hover:text-slate-300' 
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            >
              <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1
              ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`} />
          </div>
        </div>
      </motion.div>
    );
  }

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
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <SafeIcon icon={CourseIcon} className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                  ${theme === 'dark' 
                    ? 'bg-blue-900/30 text-blue-300' 
                    : 'bg-blue-50 text-blue-700'}`}>
                  {courseTitle}
                </span>
              </div>
            </div>

            {/* Bookmark */}
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-full transition-all duration-300 z-20
                ${isBookmarked 
                  ? "text-emerald-500 bg-emerald-500/10" 
                  : theme === 'dark' 
                    ? "text-slate-600 hover:bg-slate-800 hover:text-slate-300" 
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-lg mb-3 line-clamp-2 ${textPrimary}`}>
            {topic.title}
          </h3>

          {/* Description */}
          <p className={`text-sm line-clamp-3 mb-4 flex-1 ${textSecondary}`}>
            {topic.description || "Explore this topic to learn more about the subject."}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-xs">
              {topic.reading_time && (
                <span className={`flex items-center gap-1 ${textSecondary}`}>
                  <Clock size={14} />
                  {topic.reading_time} min
                </span>
              )}
              {topic.video_url && (
                <span className="flex items-center gap-1 text-blue-500">
                  <PlayCircle size={14} />
                  Video
                </span>
              )}
            </div>

            <div className={`flex items-center text-xs font-semibold transition-colors
              ${theme === "dark" ? "text-slate-500 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-600"}`}>
              Read
              <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ================================
   Filters Panel
================================ */
const FiltersPanel = ({ filters, setFilters, courses, theme, onClose }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleReset = () => {
    setFilters({ course: '', difficulty: '', hasVideo: false });
  };

  const hasActiveFilters = filters.course || filters.difficulty || filters.hasVideo;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`rounded-2xl border p-6
        ${theme === 'dark' 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-white border-slate-200 shadow-lg'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-bold text-lg flex items-center gap-2 ${textPrimary}`}>
          <Filter size={20} />
          Filters
        </h3>
        <button
          onClick={onClose}
          className={`lg:hidden p-2 rounded-lg transition-colors
            ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
        >
          <X size={18} />
        </button>
      </div>

      {/* Course Filter */}
      <div className="mb-6">
        <label className={`block text-sm font-semibold mb-3 ${textPrimary}`}>
          Course
        </label>
        <select
          value={filters.course}
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all
            ${theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-900'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-6">
        <label className={`block text-sm font-semibold mb-3 ${textPrimary}`}>
          Difficulty
        </label>
        <div className="space-y-2">
          {difficulties.map((diff) => (
            <label
              key={diff.value}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${filters.difficulty === diff.value
                  ? theme === 'dark'
                    ? 'bg-blue-900/30 border border-blue-800'
                    : 'bg-blue-50 border border-blue-200'
                  : theme === 'dark'
                    ? 'hover:bg-slate-800 border border-transparent'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={diff.value}
                checked={filters.difficulty === diff.value}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-4 h-4 text-blue-500 focus:ring-blue-500"
              />
              <span className={`text-sm font-medium ${textPrimary}`}>
                {diff.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Video Filter */}
      <div className="mb-6">
        <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
          ${filters.hasVideo
            ? theme === 'dark'
              ? 'bg-blue-900/30 border border-blue-800'
              : 'bg-blue-50 border border-blue-200'
            : theme === 'dark'
              ? 'hover:bg-slate-800 border border-transparent'
              : 'hover:bg-slate-50 border border-transparent'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.hasVideo}
            onChange={(e) => setFilters({ ...filters, hasVideo: e.target.checked })}
            className="w-4 h-4 text-blue-500 focus:ring-blue-500 rounded"
          />
          <PlayCircle size={16} className="text-blue-500" />
          <span className={`text-sm font-medium ${textPrimary}`}>
            Has Video Tutorial
          </span>
        </label>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all
            ${theme === 'dark'
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
        >
          Reset Filters
        </button>
      )}
    </motion.div>
  );
};

/* ================================
   Pagination Component
================================ */
const Pagination = ({ currentPage, totalPages, onPageChange, theme }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2.5 rounded-xl transition-all
          ${currentPage === 1
            ? theme === 'dark' ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
      >
        <ChevronLeft size={18} />
      </button>

      {getPageNumbers().map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className={`px-3 ${textSecondary}`}>
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all
              ${currentPage === page
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-600 text-white'
                : theme === 'dark'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2.5 rounded-xl transition-all
          ${currentPage === totalPages
            ? theme === 'dark' ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
      >
        <ChevronRight size={18} />
      </button>
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
        Loading topics...
      </p>
    </div>
  );
};

/* ================================
   Empty State
================================ */
const EmptyState = ({ theme, hasFilters, searchQuery }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="text-center py-20">
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
        ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
        {hasFilters ? (
          <Filter size={32} className={textSecondary} />
        ) : (
          <BookOpen size={32} className={textSecondary} />
        )}
      </div>
      <h3 className={`text-2xl font-bold mb-3 ${textPrimary}`}>
        {hasFilters ? "No topics match your filters" : "No topics found"}
      </h3>
      <p className={`text-sm max-w-md mx-auto ${textSecondary}`}>
        {hasFilters 
          ? "Try adjusting your filters or search query to find what you're looking for"
          : searchQuery
            ? `No topics match "${searchQuery}"`
            : "Topics will appear here as they're added to the platform"
        }
      </p>
    </div>
  );
};

/* ================================
   Main Topics Page
================================ */
export default function TopicsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    course: searchParams.get('course') || '',
    difficulty: searchParams.get('difficulty') || '',
    hasVideo: searchParams.get('hasVideo') === 'true',
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'compact'
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'title', 'reading-time'

  const ITEMS_PER_PAGE = 24;

  // Fetch topics and courses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [topicsRes, coursesRes] = await Promise.all([
          client.get('/topics/'),
          client.get('/courses/')
        ]);

        const topicsData = topicsRes.data.results || topicsRes.data;
        const coursesData = coursesRes.data.results || coursesRes.data;

        setTopics(topicsData);
        setCourses(coursesData);
      } catch (err) {
        console.error("Failed to load topics:", err);
        toast.error("Failed to load topics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch bookmarks
  useEffect(() => {
    if (!user) {
      setBookmarkedTopicIds(new Set());
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const res = await client.get("/bookmarks/");
        const bookmarks = res.data.results || res.data;
        const ids = new Set(bookmarks.map(b => b.topic.id));
        setBookmarkedTopicIds(ids);
      } catch (err) {
        console.error("Failed to fetch bookmarks", err);
      }
    };

    fetchBookmarks();
  }, [user]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async (topicId) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

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
      await client.post(`${BASE_URL}/api/topics/${topicId}/bookmark/`);
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
      setBookmarkedTopicIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(topicId)) {
          newSet.delete(topicId);
        } else {
          newSet.add(topicId);
        }
        return newSet;
      });
    }
  };

  // Filter and search logic
  const filteredAndSortedTopics = useMemo(() => {
    let result = [...topics];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(topic =>
        topic.title.toLowerCase().includes(query) ||
        (topic.description && topic.description.toLowerCase().includes(query)) ||
        (topic.course_info?.title && topic.course_info.title.toLowerCase().includes(query))
      );
    }

    // Filter by course
    if (filters.course) {
      result = result.filter(topic => topic.course === filters.course);
    }

    // Filter by difficulty
    if (filters.difficulty) {
      result = result.filter(topic => topic.difficulty === filters.difficulty);
    }

    // Filter by video
    if (filters.hasVideo) {
      result = result.filter(topic => topic.video_url);
    }

    // Sort
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'reading-time':
        result.sort((a, b) => (a.reading_time || 0) - (b.reading_time || 0));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return result;
  }, [topics, searchQuery, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTopics.length / ITEMS_PER_PAGE);
  const paginatedTopics = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTopics.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTopics, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.course) params.set('course', filters.course);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.hasVideo) params.set('hasVideo', 'true');
    setSearchParams(params);
  }, [searchQuery, filters]);

  const handleTopicClick = useCallback((slug) => {
    navigate(`/topics/by-slug/${slug}`);
  }, [navigate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  const hasActiveFilters = filters.course || filters.difficulty || filters.hasVideo;

  if (loading) return <LoadingState theme={theme} />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <section className="pt-32 pb-12 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border
                ${theme === "dark" 
                  ? "bg-slate-800 text-slate-300 border-slate-700" 
                  : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <TrendingUp size={14} />
                Knowledge Library
              </span>
            </div>

            {/* Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
              Explore{" "}
              <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>
                All Topics
              </span>
            </h1>

            {/* Description */}
            <p className={`text-base md:text-lg leading-relaxed ${textSecondary}`}>
              Browse through our comprehensive collection of {topics.length} topics covering everything from fundamentals to advanced concepts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Controls */}
      <section className="sticky top-0 z-40 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search 
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`}
                size={20}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, courses, keywords..."
                className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 text-sm transition-all
                  ${theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-slate-700"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg
                    ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                >
                  <X size={16} className={textSecondary} />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex-1 lg:flex-none
                  ${theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="recent">Most Recent</option>
                <option value="title">A to Z</option>
                <option value="reading-time">Reading Time</option>
              </select>

              {/* View Mode */}
              <div className={`flex items-center gap-1 p-1 rounded-xl border
                ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all
                    ${viewMode === 'grid'
                      ? theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                      : textSecondary
                    }`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all
                    ${viewMode === 'compact'
                      ? theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                      : textSecondary
                    }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`lg:hidden px-4 py-3 rounded-xl border text-sm font-medium transition-all relative
                  ${theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                  }`}
              >
                <Filter size={18} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className={`text-xs font-semibold ${textSecondary}`}>
                Active filters:
              </span>
              {filters.course && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                  {courses.find(c => c.id === filters.course)?.title}
                </span>
              )}
              {filters.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                  ${theme === 'dark' ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                  {filters.difficulty}
                </span>
              )}
              {filters.hasVideo && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'}`}>
                  Has Video
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32">
              <FiltersPanel 
                filters={filters}
                setFilters={setFilters}
                courses={courses}
                theme={theme}
                onClose={() => setShowFilters(false)}
              />
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowFilters(false)}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30 }}
                  className="absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiltersPanel 
                    filters={filters}
                    setFilters={setFilters}
                    courses={courses}
                    theme={theme}
                    onClose={() => setShowFilters(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Topics Grid */}
          <main className="lg:col-span-9">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className={`text-sm ${textSecondary}`}>
                Showing {paginatedTopics.length} of {filteredAndSortedTopics.length} topics
                {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>

            {/* Topics Display */}
            <AnimatePresence mode="wait">
              {paginatedTopics.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState 
                    theme={theme} 
                    hasFilters={hasActiveFilters || searchQuery} 
                    searchQuery={searchQuery}
                  />
                </motion.div>
              ) : viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {paginatedTopics.map((topic, index) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      theme={theme}
                      onClick={handleTopicClick}
                      isBookmarked={bookmarkedTopicIds.has(topic.id)}
                      onToggleBookmark={handleBookmarkToggle}
                      index={index}
                      viewMode="grid"
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {paginatedTopics.map((topic, index) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      theme={theme}
                      onClick={handleTopicClick}
                      isBookmarked={bookmarkedTopicIds.has(topic.id)}
                      onToggleBookmark={handleBookmarkToggle}
                      index={index}
                      viewMode="compact"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              theme={theme}
            />
          </main>
        </div>
      </section>
    </div>
  );
}