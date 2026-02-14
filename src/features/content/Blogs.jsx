import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Tag,
  TrendingUp,
  X,
  BookOpen,
} from "lucide-react";
import client from "../../features/auth/api";
import { useTheme } from "../../context/ThemeContext";

/* ================================
   Modern Card Component
================================ */
const ModernCard = ({ theme, className = "", children, hoverable = true }) => (
  <div
    className={`rounded-2xl border transition-all duration-300 overflow-hidden
      ${theme === "dark"
        ? "bg-slate-900/50 border-slate-800 backdrop-blur-sm"
        : "bg-white border-slate-200"
      }
      ${hoverable ? "hover:shadow-xl hover:-translate-y-1" : ""}
      ${className}`}
  >
    {children}
  </div>
);

/* ================================
   Search Bar Component
================================ */
const SearchBar = ({ theme, search, setSearch }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="relative max-w-2xl mx-auto">
      <Search 
        className={`absolute left-5 top-1/2 -translate-y-1/2 ${textSecondary}`}
        size={20}
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search articles, tutorials, guides..."
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
   Featured Blog Card
================================ */
const FeaturedBlog = ({ blog, theme }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <Link to={`/blogs/${blog.slug}`} className="block group">
        <div className={`relative rounded-2xl overflow-hidden border transition-all duration-500
          ${theme === "dark" 
            ? "border-slate-800 bg-slate-900/50 hover:border-slate-700" 
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xl"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-80 lg:h-auto overflow-hidden">
              <img
                src={blog.cover_image}
                alt={blog.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden`} />
              
              {/* Featured Badge */}
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-lg">
                  <Sparkles size={14} />
                  Featured
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${theme === "dark"
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 leading-tight group-hover:text-blue-500 transition-colors ${textPrimary}`}>
                {blog.title}
              </h2>
              
              {/* Description */}
              <p className={`text-base mb-6 line-clamp-3 leading-relaxed ${textSecondary}`}>
                {blog.description}
              </p>
              
              {/* Meta */}
              <div className={`flex flex-wrap items-center gap-6 text-sm ${textSecondary}`}>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {blog.read_time || 5} min read
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(blog.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              {/* Read More */}
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 text-blue-500 font-semibold group-hover:gap-3 transition-all">
                  Read Article
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ================================
   Blog Card Component
================================ */
const BlogCard = ({ blog, theme, index }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/blogs/${blog.slug}`} className="block h-full group">
        <ModernCard theme={theme} className="h-full flex flex-col">
          {/* Image */}
          <div className={`relative h-56 overflow-hidden border-b
            ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}
          >
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Tag Overlay */}
            {blog.tags && blog.tags[0] && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                  <Tag size={12} className="inline mr-1" />
                  {blog.tags[0]}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className={`text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-500 transition-colors ${textPrimary}`}>
              {blog.title}
            </h3>

            <p className={`text-sm mb-4 line-clamp-2 flex-1 leading-relaxed ${textSecondary}`}>
              {blog.description}
            </p>

            {/* Footer */}
            <div className={`flex items-center justify-between pt-4 border-t mt-auto
              ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}
            >
              <div className={`flex items-center gap-4 text-xs ${textSecondary}`}>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {blog.read_time || 5} min
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <ArrowUpRight 
                size={16} 
                className={`transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                  ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
              />
            </div>
          </div>
        </ModernCard>
      </Link>
    </motion.div>
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
        Loading articles...
      </p>
    </div>
  );
};

/* ================================
   Empty State
================================ */
const EmptyState = ({ theme, searchQuery }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="text-center py-20">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
        ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
      >
        <Search size={28} className={textSecondary} />
      </div>
      <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>
        No articles found
      </h3>
      <p className={`text-sm ${textSecondary}`}>
        {searchQuery 
          ? `No articles match "${searchQuery}"`
          : "Articles will appear here as they're published"
        }
      </p>
    </div>
  );
};

/* ================================
   Main Blogs Page
================================ */
export default function Blogs() {
  const { theme } = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      const res = await client.get("/blogs/");
      setBlogs(res.data?.results || res.data || []);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return blogs;
    const query = search.toLowerCase();
    return blogs.filter(b =>
      b.title.toLowerCase().includes(query) ||
      b.description.toLowerCase().includes(query) ||
      (b.tags && b.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [blogs, search]);

  const featured = !search && filtered.length > 0 ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

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
            className="max-w-3xl mx-auto text-center"
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
                Engineering & Insights
              </span>
            </div>
            
            {/* Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
              Latest from{" "}
              <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>
                DevNook
              </span>
            </h1>
            
            {/* Description */}
            <p className={`text-base md:text-lg leading-relaxed mb-10 ${textSecondary}`}>
              Explore the latest industry news, technologies, and resources. 
              Curated insights for developers, by developers.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SearchBar theme={theme} search={search} setSearch={setSearch} />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 pb-24">
        {/* Featured Post */}
        {featured && <FeaturedBlog blog={featured} theme={theme} />}

        {/* Stats Bar */}
        {rest.length > 0 && (
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
              {search ? "Search Results" : "Recent Articles"}
            </h2>
            <span className={`text-sm ${textSecondary}`}>
              {rest.length} {rest.length === 1 ? 'article' : 'articles'}
              {search && ` matching "${search}"`}
            </span>
          </div>
        )}

        {/* Articles Grid or Empty State */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState theme={theme} searchQuery={search} />
            </motion.div>
          ) : rest.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {rest.map((blog, index) => (
                <BlogCard key={blog.slug} blog={blog} theme={theme} index={index} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </div>
  );
}