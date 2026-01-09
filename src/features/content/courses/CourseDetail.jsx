import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { BookOpen, Search, Layers, Clock, Flame, Star, ChevronRight, AlertCircle } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Memoized Recent Topic Item
const RecentTopicItem = React.memo(({ topic, theme }) => {
  const hoverClass = theme === "dark" ? "hover:bg-gray-800 border-gray-800" : "hover:bg-indigo-50 border-gray-200";
  const textClass = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <motion.li 
      whileHover={{ scale: 1.02, x: 4 }} 
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Link
        to={`/topics/${topic.slug}`}
        className={`block p-3 rounded-lg transition-all group border ${hoverClass}`}
      >
        <p className={`font-semibold group-hover:text-indigo-500 transition line-clamp-1
          ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
        >
          {topic.title}
        </p>
        <p className={`text-sm line-clamp-2 mt-1 ${textClass}`}>
          {topic.description || "No description"}
        </p>
      </Link>
    </motion.li>
  );
});

RecentTopicItem.displayName = 'RecentTopicItem';

// Memoized Topic Card
const TopicCard = React.memo(({ topic, theme, onClick }) => {
  const bgClass = theme === "dark" 
    ? "bg-gray-900/70 border-gray-800 hover:border-pink-500" 
    : "bg-white border-gray-200 hover:border-pink-400";
  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const descClass = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 200 }}
      onClick={() => onClick(topic.slug)}
      className={`group cursor-pointer p-6 rounded-2xl border shadow-sm hover:shadow-xl transition-all ${bgClass}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className={`font-semibold text-lg line-clamp-2 flex-1 ${textClass}`}>
          {topic.title}
        </h4>
        <ChevronRight 
          className={`ml-2 shrink-0 transition-transform group-hover:translate-x-1
            ${theme === "dark" ? "text-gray-500 group-hover:text-pink-400" : "text-gray-400 group-hover:text-pink-500"}`} 
          size={20} 
        />
      </div>
      <p className={`text-sm line-clamp-3 ${descClass}`}>
        {topic.description || "No description available for this topic yet."}
      </p>
      
      {topic.video_url && (
        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-500">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span>Includes video</span>
        </div>
      )}
    </motion.div>
  );
});

TopicCard.displayName = 'TopicCard';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      // Validate slug exists
      if (!slug) {
        console.error('⚠️ No slug provided in URL!');
        setError('No course identifier provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = `${BASE_URL}/api/courses/${slug}/`;
        console.log('Fetching course with slug:', slug);
        console.log('Full API URL:', apiUrl);

        const res = await axios.get(apiUrl);
        
        console.log('Course data received:', res.data);
        
        if (!res.data) {
          throw new Error('No data returned from API');
        }

        const courseData = res.data;
        setCourse(courseData);

        // Extract topics - handle different possible structures
        const allTopics = courseData.topics || [];
        setTopics(allTopics);
        
        console.log(`${allTopics.length} topics loaded`);
      } catch (err) {
        console.error("Failed to load course:", err);
        console.error("Error response:", err.response?.data);
        
        if (err.response?.status === 404) {
          setError("Course not found");
        } else if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Failed to load course. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [slug]);

  // Memoized recent topics
  const recentTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    return [...topics]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);
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
      console.log('Navigating to topic:', topicSlug);
      navigate(`/topics/by-slug/${topicSlug}`);
    },
    [navigate]
  );

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500
        ${theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}
      >
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          Loading course...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 transition-colors duration-500
        ${theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}
      >
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {error || "Course not found"}
        </h2>
        <p className={`mb-6 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/courses"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Browse All Courses
        </Link>
      </div>
    );
  }

  const bgColor = theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const sidebarBg = theme === "dark" ? "bg-gray-900/70 border-gray-800" : "bg-white/70 border-gray-200";
  const textIndigo = theme === "dark" ? "text-indigo-300" : "text-indigo-700";

  return (
    <div className={`relative flex flex-col lg:flex-row w-full min-h-screen transition-colors duration-500 ${bgColor}`}>
      {/* Sidebar - Only show if there are recent topics */}
      {recentTopics.length > 0 && (
        <aside className={`lg:w-80 w-full lg:fixed lg:right-6 lg:top-24 backdrop-blur-md shadow-xl rounded-2xl p-6 h-fit z-20 border mb-6 lg:mb-0 ${sidebarBg}`}>
          <h3 className={`font-bold text-xl mb-4 ${textIndigo}`}>
            Recently Added Topics
          </h3>
          <ul className="space-y-3">
            {recentTopics.map((t) => (
              <RecentTopicItem key={t.id} topic={t} theme={theme} />
            ))}
          </ul>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 px-6 py-10 ${recentTopics.length > 0 ? "lg:mr-96" : ""}`}>
        {/* Course Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="mb-10"
        >
          <div className="mb-4">
            <Link 
              to="/courses"
              className={`text-sm hover:underline ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              ← Back to Courses
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent pt-4 mb-4">
            {course.title}
          </h1>

          {course.category && (
            <span className={`inline-block px-4 py-1 text-sm font-semibold rounded-full mb-4
              ${theme === "dark" ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}
            >
              {course.category}
            </span>
          )}

          <p className={`mt-4 max-w-3xl leading-relaxed text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {course.description || "Dive into an immersive learning experience filled with practical lessons, deep insights, and technical guides that grow with you."}
          </p>

          {/* Course Stats */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Layers className="text-pink-500" size={18} />
              <span>{topics.length} {topics.length === 1 ? 'Topic' : 'Topics'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-indigo-500" size={18} />
              <span>Updated Regularly</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={18} />
              <span>Community Picks</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400" size={18} />
              <span>Top Rated</span>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        {topics.length > 0 && (
          <div className="relative max-w-lg mx-auto mb-10">
            <div className={`flex items-center rounded-full px-5 py-3 shadow-md border transition 
              ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <Search size={20} className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              <input
                type="text"
                placeholder="Search topics in this course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm placeholder:text-sm
                  ${theme === "dark" ? "text-gray-200 placeholder:text-gray-500" : "text-gray-800 placeholder:text-gray-400"}`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={`ml-2 text-xs hover:underline ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Topics Section */}
        <section className={`mt-8 border-t pt-10 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
          <h2 className={`font-bold text-2xl mb-6 flex items-center gap-2 ${textIndigo}`}>
            <BookOpen size={22} /> Topics in this Course
          </h2>

          {topics.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className={`text-lg ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                No topics available yet for this course.
              </p>
              <p className={`text-sm mt-2 ${theme === "dark" ? "text-gray-600" : "text-gray-500"}`}>
                Check back soon for new content!
              </p>
            </div>
          ) : filteredTopics.length > 0 ? (
            <motion.div 
              className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {filteredTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <TopicCard topic={topic} theme={theme} onClick={handleTopicClick} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className={`text-lg ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                No topics found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Clear Search
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}