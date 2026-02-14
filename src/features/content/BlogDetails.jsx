import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  ArrowLeft,
  User, 
  Share2, 
  Bookmark,
  Tag,
  ArrowUp,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../features/auth/api";
import { useTheme } from "../../context/ThemeContext";

/* ================================
   Reading Progress Bar
================================ */
const ReadingProgress = ({ theme }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 origin-left z-[100]
        ${theme === "dark" ? "bg-blue-500" : "bg-blue-600"}`}
      style={{ scaleX }}
    />
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
        Loading article...
      </p>
    </div>
  );
};

/* ================================
   Main Blog Details Component
================================ */
export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  useEffect(() => {
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function fetchBlog() {
    try {
      setLoading(true);
      const res = await client.get(`/blogs/${slug}/`);
      setBlog(res.data);
    } catch (error) {
      console.error("Failed to fetch blog", error);
      toast.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleBookmark = () => {
    // Implement bookmark functionality
    toast.success("Article bookmarked!");
  };

  if (loading) {
    return <LoadingState theme={theme} />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Article not found</h2>
        <button 
          onClick={() => navigate("/blogs")} 
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
            ${theme === "dark"
              ? "bg-white text-slate-900 hover:bg-slate-100"
              : "bg-slate-900 text-white hover:bg-slate-800"
            }
            shadow-lg hover:shadow-xl hover:scale-105`}
        >
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress theme={theme} />

      {/* Back Button - Fixed */}
      <div className="fixed top-24 left-6 z-40">
        <button
          onClick={() => navigate("/blogs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md border shadow-lg transition-all hover:scale-105
            ${theme === "dark" 
              ? "bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-900" 
              : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white"}`}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-b 
          ${theme === "dark" 
            ? "from-slate-900/40 via-slate-900/70 to-slate-950" 
            : "from-slate-900/20 via-slate-900/40 to-slate-50"}`} 
        />
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {blog.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-white"
                    >
                      <Tag size={12} className="inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                {blog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">DevNook Team</p>
                    <p className="text-xs text-white/70">Editor</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(blog.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {blog.read_time || 5} min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <main className="lg:col-span-8">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`prose prose-lg max-w-none
                ${theme === "dark" 
                  ? "prose-invert prose-headings:text-white prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-pink-400" 
                  : "prose-slate prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600"
                }`}
            >
              {/* Description */}
              {blog.description && (
                <p className="text-xl font-medium leading-relaxed mb-8 opacity-80">
                  {blog.description}
                </p>
              )}

              {/* Content - Split by paragraphs */}
              {blog.content.split("\n").map((paragraph, i) => (
                paragraph.trim() && (
                  <p key={i} className="mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                )
              ))}
            </motion.article>

            {/* Footer Actions */}
            <div className={`flex items-center justify-between mt-16 pt-8 border-t
              ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}
            >
              <div className="flex gap-3">
                <button 
                  onClick={handleShare}
                  className={`p-3 rounded-xl transition-all hover:scale-110
                    ${theme === "dark" 
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                  title="Share article"
                >
                  <Share2 size={20} />
                </button>
                <button 
                  onClick={handleBookmark}
                  className={`p-3 rounded-xl transition-all hover:scale-110
                    ${theme === "dark" 
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                  title="Bookmark article"
                >
                  <Bookmark size={20} />
                </button>
              </div>
              <Link 
                to="/blogs" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
              >
                More articles
                <ExternalLink size={16} />
              </Link>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              
              {/* Reading Info Card */}
              <div className={`rounded-xl border p-6
                ${theme === "dark"
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-slate-200"}`}
              >
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
                  <BookOpen size={18} />
                  Reading Info
                </h3>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between text-sm ${textSecondary}`}>
                    <span>Published</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {new Date(blog.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${textSecondary}`}>
                    <span>Reading time</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {blog.read_time || 5} minutes
                    </span>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className={`flex items-start justify-between text-sm ${textSecondary}`}>
                      <span>Topics</span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {blog.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded text-xs font-medium
                              ${theme === "dark"
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                              }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Card */}
              <div className={`rounded-xl border p-6
                ${theme === "dark"
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-white border-slate-200"}`}
              >
                <h3 className={`text-sm font-bold mb-4 ${textPrimary}`}>
                  Share this article
                </h3>
                <div className="flex gap-3">
                  <button 
                    onClick={handleShare}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all
                      ${theme === "dark"
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button 
                    onClick={handleBookmark}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all
                      ${theme === "dark"
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                  >
                    <Bookmark size={16} />
                    Save
                  </button>
                </div>
              </div>

              {/* Call to Action */}
              <div className={`rounded-xl border p-6
                ${theme === "dark"
                  ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800/30"
                  : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"}`}
              >
                <h3 className={`text-base font-bold mb-2 ${textPrimary}`}>
                  Explore More
                </h3>
                <p className={`text-sm mb-4 ${textSecondary}`}>
                  Discover more insights and articles on technology and development.
                </p>
                <Link
                  to="/blogs"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
                    ${theme === "dark"
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                    }
                    shadow-lg hover:shadow-xl hover:scale-105`}
                >
                  View All Articles
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed right-6 bottom-6 z-50 p-3.5 rounded-xl shadow-lg transition-all hover:scale-110
              ${theme === 'dark' 
                ? 'bg-slate-900 text-white border border-slate-800' 
                : 'bg-white text-slate-900 border border-slate-200'}`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}