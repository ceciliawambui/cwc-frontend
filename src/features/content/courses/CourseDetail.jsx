import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { BookOpen, Search, Layers, Clock, Flame, Star, ChevronRight } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Memoized Recent Topic Item
const RecentTopicItem = React.memo(({ topic, theme }) => {
  const hoverClass = theme === "dark" ? "hover:bg-gray-800 border-gray-800" : "hover:bg-indigo-50 border-gray-200";
  const textClass = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <motion.li whileHover={{ scale: 1.03, x: 4 }} transition={{ type: "spring", stiffness: 200 }}>
      <Link
        to={`/topics/${topic.slug}`}
        className={`block p-3 rounded-lg transition-all group border ${hoverClass}`}
      >
        <p className="font-semibold group-hover:text-indigo-500 transition">{topic.title}</p>
        <p className={`text-sm line-clamp-2 ${textClass}`}>{topic.description}</p>
      </Link>
    </motion.li>
  );
});

// Memoized Topic Card
const TopicCard = React.memo(({ topic, theme, onClick }) => {
  const bgClass = theme === "dark" ? "bg-gray-900/70 border-gray-800" : "bg-white border-gray-200";
  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const descClass = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      onClick={() => onClick(topic.slug)}
      className={`group cursor-pointer p-5 rounded-2xl border shadow-sm hover:shadow-lg hover:border-pink-400 transition-all ${bgClass}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-semibold ${textClass}`}>{topic.title}</h4>
        <ChevronRight className="group-hover:text-pink-500 transition" size={18} />
      </div>
      <p className={`text-sm line-clamp-3 ${descClass}`}>{topic.description || "No description yet."}</p>
    </motion.div>
  );
});

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/courses/${id}/`);
        const courseData = res.data || {};
        setCourse(courseData);

        const allTopics = courseData.topics || [];
        setTopics(allTopics);
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Memoized recent topics
  const recentTopics = useMemo(() => {
    if (!topics) return [];
    return [...topics].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  }, [topics]);

  // Memoized filtered topics
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => topic.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [topics, searchTerm]);

  // Stable navigation callback
  const handleTopicClick = useCallback(
    (slug) => navigate(`/topics/${slug}`),
    [navigate]
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center animate-pulse text-gray-500 dark:text-gray-400">
        Loading course...
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Course not found.
      </div>
    );

  const bgColor = theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const sidebarBg = theme === "dark" ? "bg-gray-900/70 border-gray-800" : "bg-white/70 border-gray-200";
  const textIndigo = theme === "dark" ? "text-indigo-300" : "text-indigo-700";

  return (
    <div className={`relative flex flex-col lg:flex-row w-full min-h-screen transition-colors duration-500 ${bgColor}`}>
      {/* Sidebar */}
      <aside className={`lg:w-80 w-full lg:fixed lg:right-6 lg:top-24 backdrop-blur-md shadow-xl rounded-2xl p-6 h-fit z-20 border ${sidebarBg}`}>
        <h3 className={`font-bold text-xl mb-4 ${textIndigo}`}>Recently Added Topics</h3>
        {recentTopics.length ? (
          <ul className="space-y-3">
            {recentTopics.map((t) => (
              <RecentTopicItem key={t.id} topic={t} theme={theme} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No recent topics available for this course.</p>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-10 lg:mr-100 px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent pt-8">
            {course.title}
          </h1>
          <p className={`mt-4 max-w-3xl leading-relaxed text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {course.description || "Dive into an immersive DevNook filled with practical lessons, deep insights, and technical guides that grow with you."}
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2"><Layers className="text-pink-500" size={18} /><span>{topics.length} Topics</span></div>
            <div className="flex items-center gap-2"><Clock className="text-indigo-500" size={18} /><span>Updated Regularly</span></div>
            <div className="flex items-center gap-2"><Flame className="text-orange-500" size={18} /><span>Community Picks</span></div>
            <div className="flex items-center gap-2"><Star className="text-yellow-400" size={18} /><span>Top Rated</span></div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-10">
          <div className={`flex items-center rounded-full px-5 py-3 shadow-md border transition ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
            <Search size={20} className={`mr-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
            />
          </div>
        </div>

        {/* Topics Section */}
        <section className={`mt-8 border-t pt-10 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
          <h2 className={`font-bold text-2xl mb-6 flex items-center gap-2 ${textIndigo}`}>
            <BookOpen size={22} /> Topics in this Course
          </h2>
          {filteredTopics.length ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} theme={theme} onClick={handleTopicClick} />
              ))}
            </div>
          ) : (
            <p className={`text-center ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
              No topics found matching “{searchTerm}”.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
