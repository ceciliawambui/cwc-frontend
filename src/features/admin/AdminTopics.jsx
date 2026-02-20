import React, { useState, useEffect, useCallback, useRef, memo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit3,
  Trash2,
  Loader2,
  Plus,
  X,
  AlertTriangle,
  FileText,
  Video,
  BookOpen,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List as ListIcon,
  Layers,
  Filter,
  Award,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import client from "../../features/auth/api";
import BlockEditor from "../../components/BlockEditor";

const PAGE_SIZE = 9;

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner", color: "green" },
  { value: "intermediate", label: "Intermediate", color: "yellow" },
  { value: "advanced", label: "Advanced", color: "red" },
];

/* Topic Card Component */
const TopicCard = memo(({ topic, onEdit, onDelete }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
  >
    {/* Header Badge */}
    <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
              {topic.course_info?.title || "Unassigned"}
            </span>
            {topic.is_published ? (
              <CheckCircle2 size={14} className="text-green-500" />
            ) : (
              <XCircle size={14} className="text-gray-400" />
            )}
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
            {topic.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 min-h-[3.75rem]">
        {topic.description || "No description provided."}
      </p>

      {/* Meta Info */}
      <div className="flex items-center gap-3 mb-4 text-xs">
        {topic.difficulty && (
          <span className={`px-2 py-1 rounded-full font-medium bg-${DIFFICULTY_OPTIONS.find(d => d.value === topic.difficulty)?.color}-100 text-${DIFFICULTY_OPTIONS.find(d => d.value === topic.difficulty)?.color}-700`}>
            {DIFFICULTY_OPTIONS.find(d => d.value === topic.difficulty)?.label}
          </span>
        )}
        {topic.reading_time && (
          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Clock size={12} />
            {topic.reading_time} min
          </span>
        )}
        {topic.video_url && (
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <Video size={12} />
            Video
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onEdit(topic)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
        >
          <Edit3 size={16} />
          <span className="font-medium">Edit</span>
        </button>
        <button
          onClick={() => onDelete(topic)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="text-xs text-gray-400 mt-3">
        Created: {new Date(topic.created_at).toLocaleDateString()}
      </div>
    </div>
  </motion.div>
));
TopicCard.displayName = "TopicCard";

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // View & Pagination
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  // Analytics
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);

  // Form
  const [form, setForm] = useState({
    title: "",
    description: "",
    video_url: "",
    course: "",
    difficulty: "beginner",
    reading_time: 5,
    is_published: true,
  });

  // Editor
  const [editorBlocks, setEditorBlocks] = useState([]);
  const abortRef = useRef(null);

  /* FETCH DATA */
  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, []);

  async function fetchData() {
    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const [catRes, courseRes, topicRes] = await Promise.all([
        client.get("/categories/", { signal: controller.signal }),
        client.get("/courses/", { signal: controller.signal }),
        client.get("/topics/", { signal: controller.signal }),
      ]);

      const categoryData = catRes.data.results || catRes.data || [];
      const courseData = courseRes.data.results || courseRes.data || [];
      const topicData = topicRes.data.results || topicRes.data || [];

      // Enrich topic data with course details if missing
      const enrichedTopics = topicData.map(topic => {
        if (!topic.course_info && topic.course) {
          const course = courseData.find(c => c.id === topic.course);
          if (course) {
            topic.course_info = {
              id: course.id,
              title: course.title,
              slug: course.slug,
              category_info: course.category_info
            };
          }
        }
        return topic;
      });

      setCategories(categoryData);
      setCourses(courseData);
      setTopics(enrichedTopics);
      setFiltered(enrichedTopics);
      computeAnalytics(enrichedTopics);
    } catch (e) {
      if (e.name !== "CanceledError") {
        console.error("Failed to load data:", e);
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }

  function computeAnalytics(data) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setNewThisWeek(data.filter((t) => new Date(t.created_at) >= weekAgo).length);
    setPublishedCount(data.filter((t) => t.is_published).length);
  }

  /* FILTERING */
  useEffect(() => {
    let out = [...topics];
    const q = search.trim().toLowerCase();

    if (q) {
      out = out.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    if (selectedCourse) {
      out = out.filter((t) => String(t.course) === String(selectedCourse));
    }

    if (difficultyFilter !== "all") {
      out = out.filter((t) => t.difficulty === difficultyFilter);
    }

    if (statusFilter === "published") {
      out = out.filter((t) => t.is_published);
    } else if (statusFilter === "draft") {
      out = out.filter((t) => !t.is_published);
    }

    setFiltered(out);
    setPage(1);
  }, [search, selectedCourse, difficultyFilter, statusFilter, topics]);

  const filteredCourses = selectedCategory
    ? courses.filter((c) => String(c.category) === String(selectedCategory))
    : courses;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* MODAL HANDLERS */
  const handleOpen = useCallback(async (topic = null) => {
    if (topic) {
      setEditing(topic);
      setForm({
        title: topic.title || "",
        description: topic.description || "",
        video_url: topic.video_url || "",
        course: topic.course || "",
        difficulty: topic.difficulty || "beginner",
        reading_time: topic.reading_time || 5,
        is_published: topic.is_published !== undefined ? topic.is_published : true,
      });

      try {
        const res = await client.get(`/topics/${topic.id}/`);
        const existingBlocks = res.data.content_version === "v2" && Array.isArray(res.data.content)
          ? res.data.content
          : [];
        setEditorBlocks(existingBlocks);
      } catch {
        toast.error("Failed to load topic content");
      }
    } else {
      setEditing(null);
      setForm({
        title: "",
        description: "",
        video_url: "",
        course: "",
        difficulty: "beginner",
        reading_time: 5,
        is_published: true,
      });

      setEditorBlocks([]);
    }

    setModalOpen(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((s) => ({ ...s, [name]: checked }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  /* SAVE */
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.course) {
      toast.error("Course is required");
      return;
    }

    setSaving(true);


    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      video_url: form.video_url.trim(),
      course: form.course,
      difficulty: form.difficulty,
      reading_time: parseInt(form.reading_time) || 5,
      is_published: form.is_published,
      content: editorBlocks,   // ← block array goes straight to API
    };


    try {
      let res;
      if (editing) {
        res = await client.patch(`/topics/${editing.id}/`, payload);
        setTopics((prev) => prev.map((t) => (t.id === editing.id ? res.data : t)));
        toast.success("Topic updated successfully!");
      } else {
        res = await client.post("/topics/", payload);
        setTopics((prev) => [res.data, ...prev]);
        toast.success("Topic created successfully!");
      }
      handleClose();
    } catch (e) {
      console.error("Save error:", e);
      const errorMsg = e.response?.data?.detail || e.response?.data?.message || "Failed to save topic";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  /* DELETE */
  const confirmDelete = (topic) => {
    setTopicToDelete(topic);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!topicToDelete) return;
    try {
      await client.delete(`/topics/${topicToDelete.id}/`);
      setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id));
      toast.success("Topic deleted successfully!");
      setShowDeleteModal(false);
      setTopicToDelete(null);
    } catch (e) {
      console.error("Delete error:", e);
      const errorMsg = e.response?.data?.detail || e.response?.data?.message || "Failed to delete topic";
      toast.error(errorMsg);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditing(null);
    setEditorBlocks([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Topics Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create and manage learning content articles
              </p>
            </div>
            <button
              onClick={() => handleOpen()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              <span className="font-semibold">Create Topic</span>
            </button>
          </div>

          {/* ANALYTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Topics</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {topics.length}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {publishedCount}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
                  <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                    {newThisWeek}
                  </p>
                </div>
                <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-xl">
                  <TrendingUp className="text-cyan-600 dark:text-cyan-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Courses</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {courses.length}
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <BookOpen className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* FILTERS & SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search topics..."
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedCourse("");
              }}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            >
              <option value="">All Courses</option>
              {filteredCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="all">All Levels</option>
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 min-w-[130px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${viewMode === "grid"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600"
                  }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${viewMode === "list"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600"
                  }`}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* RESULTS COUNT */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginated.length} of {filtered.length} topics
          </p>
        </div>

        {/* TOPICS GRID/LIST */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700"
          >
            <Layers className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No topics found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {search ? "Try adjusting your search" : "Get started by creating your first topic"}
            </p>
            {!search && (
              <button
                onClick={() => handleOpen()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Create First Topic
              </button>
            )}
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginated.map((topic, idx) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <TopicCard topic={topic} onEdit={handleOpen} onDelete={confirmDelete} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
          >
            {paginated.map((topic, idx) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="text-white" size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {topic.course_info?.title || "Unassigned"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {topic.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${DIFFICULTY_OPTIONS.find(d => d.value === topic.difficulty)?.color}-100 text-${DIFFICULTY_OPTIONS.find(d => d.value === topic.difficulty)?.color}-700`}>
                      {DIFFICULTY_OPTIONS.find(d => d.value === topic.difficulty)?.label}
                    </span>
                  )}

                  {topic.is_published ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-gray-400" size={20} />
                  )}

                  <button
                    onClick={() => handleOpen(topic)}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                  >
                    <Edit3 size={18} className="text-blue-600" />
                  </button>

                  <button
                    onClick={() => confirmDelete(topic)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${page === p
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* CREATE/EDIT MODAL */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={handleClose}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 w-full max-w-[95vw] h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editing ? "Edit Topic" : "Create New Topic"}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {editing ? "Update your content below" : "Fill in the details to create a new learning resource"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                    >
                      {saving ? "Saving..." : "Save Topic"}
                    </button>
                  </div>
                </div>

                {/* Modal Body: Split Layout */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50 dark:bg-gray-950/50">
                  {/* LEFT: Editor */}
                  <div className="flex-1 flex flex-col min-h-[50%] lg:h-auto border-r border-gray-200 dark:border-gray-800 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 opacity-20" />

                    <div className="flex-1 p-6 lg:p-10 overflow-hidden flex flex-col">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        Content Editor
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          Type '/' for commands
                        </span>
                      </label>
                      <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                        <BlockEditor
                          key={editing ? editing.id : "new"}
                          initialContent={editorBlocks}
                          onChange={({ blocks }) => setEditorBlocks(blocks)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Metadata Sidebar */}
                  <div className="w-full lg:w-96 bg-white dark:bg-gray-900 p-8 overflow-y-auto space-y-6">
                    <h3 className="font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-800">
                      Topic Settings
                    </h3>

                    <div className="space-y-5">
                      {/* Course */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Course *
                        </label>
                        <select
                          name="course"
                          value={form.course}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                          required
                        >
                          <option value="">Select a Course...</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                          placeholder="e.g. React Hooks Deep Dive"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Summary
                        </label>
                        <textarea
                          name="description"
                          rows={5}
                          value={form.description}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
                          placeholder="A short description displayed on the topic card..."
                        />
                      </div>

                      {/* Difficulty & Reading Time */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Difficulty
                          </label>
                          <select
                            name="difficulty"
                            value={form.difficulty}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          >
                            {DIFFICULTY_OPTIONS.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                            <Clock size={12} />
                            Read Time
                          </label>
                          <input
                            type="number"
                            name="reading_time"
                            value={form.reading_time}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="5"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Video URL */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <Video size={12} />
                          Video URL (Optional)
                        </label>
                        <input
                          type="url"
                          name="video_url"
                          value={form.video_url}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="https://youtube.com/..."
                        />
                      </div>

                      {/* Published Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Publish Topic</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Make this topic visible to learners
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_published"
                            checked={form.is_published}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Pro Tip */}

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                      <h4 className="text-blue-700 dark:text-blue-300 font-bold text-xs uppercase mb-1">
                        Pro Tip
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        Use <strong>Add Block</strong> at the bottom of the editor to insert text,
                        code (with Monaco), headings, or callout notes. Use the arrows to reorder blocks.
                        Code blocks support 20+ languages with full syntax highlighting.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Delete Topic
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {topicToDelete?.title}
                  </strong>
                  ? All content will be permanently removed.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirmed}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold"
                  >
                    Delete Topic
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}