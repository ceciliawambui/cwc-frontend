import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  ArrowRight,
  X,
  BookOpen,
  Calendar,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../auth/api";
import { useTheme } from "../../context/ThemeContext";

/* ================================
   Bookmark Card Component
================================ */
const BookmarkCard = ({ bookmark, theme, onRemove, index }) => {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  const handleRemove = async (e) => {
    e.stopPropagation();

    if (isRemoving) return;
    setIsRemoving(true);

    try {
      await client.post(`/topics/${bookmark.topic.id}/bookmark/`);

      onRemove(bookmark.id);

      toast.success("Removed from Library");

    } catch (error) {
      console.error("Bookmark removal error:", error.response?.data || error.message);
      toast.error("Could not remove bookmark");
      setIsRemoving(false);
    }
  };


  const handleClick = () => {
    navigate(`/topics/${bookmark.topic.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      layout
    >
      <div
        onClick={handleClick}
        className={`group cursor-pointer rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden
          ${theme === "dark"
            ? "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl"
          }
          ${isRemoving ? "opacity-50 pointer-events-none" : ""}`}
      >
        {/* Hover gradient overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          ${theme === "dark"
            ? "bg-gradient-to-br from-slate-800/30 to-slate-900/30"
            : "bg-gradient-to-br from-slate-50 to-white"
          }`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className={`text-lg font-bold line-clamp-2 group-hover:text-blue-500 transition-colors ${textPrimary}`}>
                {bookmark.topic.title}
              </h3>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className={`p-2 rounded-lg transition-all hover:scale-110 shrink-0
                ${theme === "dark"
                  ? "hover:bg-red-900/30 text-slate-500 hover:text-red-400"
                  : "hover:bg-red-50 text-slate-400 hover:text-red-600"
                }`}
              title="Remove bookmark"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-red-500" />
              ) : (
                <X size={18} />
              )}
            </button>
          </div>

          {/* Description */}
          {bookmark.topic.description && (
            <p className={`text-sm line-clamp-2 mb-4 ${textSecondary}`}>
              {bookmark.topic.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
              <Calendar size={12} />
              <span>
                Saved {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <ArrowRight
              size={16}
              className={`transition-all group-hover:translate-x-1
                ${theme === "dark" ? "text-slate-600" : "text-slate-400"}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ================================
   Search Bar Component
================================ */
const SearchBar = ({ theme, search, setSearch }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="relative max-w-md">
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`}
        size={18}
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search bookmarks..."
        className={`w-full pl-12 pr-10 py-3 rounded-xl border text-sm
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
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors
            ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
        >
          <X size={14} className={textSecondary} />
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className={`w-16 h-16 rounded-2xl border-4 border-t-transparent animate-spin mb-6
        ${theme === "dark" ? "border-slate-700" : "border-slate-300"}`}
      />
      <p className={`text-base ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
        Loading your bookmarks...
      </p>
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
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
        ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
      >
        {hasSearch ? (
          <Search size={32} className={textSecondary} />
        ) : (
          <Bookmark size={32} className={textSecondary} />
        )}
      </div>
      <h3 className={`text-2xl font-bold mb-3 ${textPrimary}`}>
        {hasSearch ? "No bookmarks found" : "No bookmarks yet"}
      </h3>
      <p className={`text-sm max-w-md mx-auto ${textSecondary}`}>
        {hasSearch
          ? `No bookmarks match "${searchQuery}"`
          : "Save topics while learning and they'll appear here for easy access later."
        }
      </p>
    </div>
  );
};

/* ================================
   Main Bookmarks Page
================================ */
export default function Bookmarks() {
  const { theme } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await client.get("/bookmarks/");
      setBookmarks(res.data.results || res.data || []);
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = (bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      bookmark.topic.title.toLowerCase().includes(query) ||
      (bookmark.topic.description && bookmark.topic.description.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return <LoadingState theme={theme} />;
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
                <Sparkles size={14} />
                Saved for Later
              </span>
            </div>

            {/* Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
              Your{" "}
              <span className="text-[#4b9966]">
                Bookmarks
              </span>
            </h1>

            {/* Description */}
            <p className={`text-base md:text-lg leading-relaxed ${textSecondary}`}>
              Quickly jump back into the topics you've saved for later.
              All your bookmarked content in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 pb-24">
        {/* Search & Stats Bar */}
        {bookmarks.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-12">
            <SearchBar theme={theme} search={search} setSearch={setSearch} />

            <div className={`text-sm ${textSecondary}`}>
              {search ? (
                <span>
                  {filteredBookmarks.length} of {bookmarks.length} bookmarks
                </span>
              ) : (
                <span>
                  {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bookmarks Grid or Empty State */}
        <AnimatePresence mode="wait">
          {bookmarks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState theme={theme} hasSearch={false} />
            </motion.div>
          ) : filteredBookmarks.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredBookmarks.map((bookmark, index) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    theme={theme}
                    onRemove={handleRemoveBookmark}
                    index={index}
                  />
                ))}
              </AnimatePresence>
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
      </section>

      {/* Bottom CTA */}
      {bookmarks.length > 0 && (
        <section className="container mx-auto px-6 pb-20">
          <div
            className={`rounded-2xl border p-12 text-center transition-all duration-300
              ${theme === "dark"
                ? "bg-slate-900/50 border-slate-800"
                : "bg-white border-slate-200"
              }`}
          >
            <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${textPrimary}`}>
              Continue Learning
            </h2>
            <p className={`text-sm mb-6 max-w-xl mx-auto ${textSecondary}`}>
              Explore more topics and courses to expand your knowledge
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/courses")}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
                  ${theme === "dark"
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                  }
                  shadow-lg hover:shadow-xl hover:scale-105`}
              >
                Browse Courses
              </button>
              <button
                onClick={() => navigate("/topics")}
                className={`px-6 py-3 rounded-xl border font-semibold text-sm transition-all
                  ${theme === "dark"
                    ? "border-slate-700 text-white hover:bg-slate-800"
                    : "border-slate-300 text-slate-900 hover:bg-slate-50"
                  }
                  hover:scale-105`}
              >
                Explore Topics
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}