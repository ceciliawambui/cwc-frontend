import React, { useEffect, useMemo, useState } from "react";
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
  Folder,
  Tag,
  CheckCircle2,
  XCircle,
  Palette,
  Hash,
  ArrowUpDown,
  BookOpen,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  Grid3x3,
  List as ListIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import client from "../../features/auth/api";

const PAGE_SIZE = 9;

const ICON_PRESETS = [
  { label: "Code", value: "💻" },
  { label: "Server", value: "🖥️" },
  { label: "Cloud", value: "☁️" },
  { label: "Mobile", value: "📱" },
  { label: "Database", value: "🗄️" },
  { label: "AI", value: "🤖" },
  { label: "Security", value: "🔒" },
  { label: "Tools", value: "🛠️" },
];

const COLOR_PRESETS = [
  { label: "Blue", value: "blue-500", bg: "bg-blue-500" },
  { label: "Purple", value: "purple-500", bg: "bg-purple-500" },
  { label: "Green", value: "green-500", bg: "bg-green-500" },
  { label: "Red", value: "red-500", bg: "bg-red-500" },
  { label: "Orange", value: "orange-500", bg: "bg-orange-500" },
  { label: "Pink", value: "pink-500", bg: "bg-pink-500" },
  { label: "Indigo", value: "indigo-500", bg: "bg-indigo-500" },
  { label: "Teal", value: "teal-500", bg: "bg-teal-500" },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // View & Pagination
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  // Analytics
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "",
    color: "",
    order: 0,
    is_published: true,
  });

  /* FETCH DATA */
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await client.get("/categories/");
      let data = res.data;

      if (Array.isArray(data)) {
        // OK
      } else if (Array.isArray(data?.results)) {
        data = data.results;
      } else {
        console.error("Unexpected categories response:", res.data);
        toast.error("Invalid response format from server.");
        setCategories([]);
        setFiltered([]);
        return;
      }

      setCategories(data);
      setFiltered(data);
      computeAnalytics(data);
      setPage(1);
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  function computeAnalytics(data) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setNewThisWeek(data.filter((c) => new Date(c.created_at) >= weekAgo).length);
    setPublishedCount(data.filter((c) => c.is_published).length);
    setTotalCourses(data.reduce((sum, c) => sum + (c.courses_total || 0), 0));
  }

  /* FILTERING */
  useEffect(() => {
    let out = [...categories];
    const q = search.trim().toLowerCase();

    if (q) {
      out = out.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter === "published") {
      out = out.filter((c) => c.is_published);
    } else if (statusFilter === "draft") {
      out = out.filter((c) => !c.is_published);
    }

    setFiltered(out);
    setPage(1);
  }, [search, statusFilter, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* MODAL HELPERS */
  function openAddModal() {
    setEditingCategory(null);
    setForm({
      title: "",
      description: "",
      icon: "📁",
      color: "blue-500",
      order: categories.length,
      is_published: true,
    });
    setShowModal(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setForm({
      title: category.title || "",
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "",
      order: category.order || 0,
      is_published: category.is_published !== undefined ? category.is_published : true,
    });
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((s) => ({ ...s, [name]: checked }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  /* SAVE */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon.trim(),
      color: form.color.trim(),
      order: parseInt(form.order) || 0,
      is_published: form.is_published,
    };

    try {
      if (editingCategory) {
        await client.put(`/categories/${editingCategory.slug}/`, payload);
        toast.success("Category updated successfully!");
      } else {
        await client.post("/categories/", payload);
        toast.success("Category created successfully!");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Save error:", err.response || err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.title?.[0] ||
        "Failed to save category.";
      toast.error(msg);
    }
  }

  /* DELETE */
  function confirmDelete(category) {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirmed() {
    if (!categoryToDelete) return;
    try {
      await client.delete(`/categories/${categoryToDelete.slug}/`);
      toast.success("Category deleted successfully!");
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.message || 
                       "Failed to delete category.";
      toast.error(errorMsg);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Category Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Organize your knowledge domains and learning paths
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              <span className="font-semibold">Create Category</span>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {categories.length}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                  <Layers className="text-purple-600 dark:text-purple-400" size={24} />
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
                  <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-1">
                    {newThisWeek}
                  </p>
                </div>
                <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-xl">
                  <TrendingUp className="text-pink-600 dark:text-pink-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {totalCourses}
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
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Search categories..."
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600"
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
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
            Showing {paginated.length} of {filtered.length} categories
          </p>
        </div>

        {/* CATEGORIES GRID/LIST */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700"
          >
            <Folder className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {search ? "Try adjusting your search" : "Get started by creating your first category"}
            </p>
            {!search && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Create First Category
              </button>
            )}
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginated.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                {/* Header with Icon */}
                <div className={`h-32 bg-gradient-to-br from-${category.color || 'purple-500'} to-${category.color?.replace('500', '600') || 'pink-600'} relative flex items-center justify-center`}>
                  <div className="text-6xl filter drop-shadow-lg">
                    {category.icon || "📁"}
                  </div>
                  <div className="absolute top-3 right-3">
                    {category.is_published ? (
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Eye size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <EyeOff size={12} />
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                        {category.title}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <ArrowUpDown size={12} />
                        Order: {category.order}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {category.description || "No description provided"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <BookOpen size={14} />
                      <span>{category.courses_total || 0} courses</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <FileText size={14} />
                      <span>{category.articles_total || 0} articles</span>
                    </div>
                  </div>

                  {/* Color Badge */}
                  {category.color && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}`}></div>
                      <span className="text-xs text-gray-500">{category.color}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => openEditModal(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
                    >
                      <Edit3 size={16} />
                      <span className="font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(category)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 mt-3">
                    Created: {new Date(category.created_at).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
          >
            {paginated.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                <div className="text-4xl">
                  {category.icon || "📁"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {category.courses_total || 0} courses • {category.articles_total || 0} articles
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Order: {category.order}
                  </span>
                  
                  {category.is_published ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-gray-400" size={20} />
                  )}

                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                  >
                    <Edit3 size={18} className="text-purple-600" />
                  </button>
                  
                  <button
                    onClick={() => confirmDelete(category)}
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
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === p
                    ? "bg-purple-600 text-white"
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
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <form onSubmit={handleSubmit}>
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Folder className="text-purple-600 dark:text-purple-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {editingCategory ? "Edit Category" : "Create New Category"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Knowledge domain (Frontend, Backend, AI, etc.)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Category Title *
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., Frontend Development"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        rows={4}
                        placeholder="Brief overview of what this category covers..."
                      />
                    </div>

                    {/* Icon Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Hash size={16} />
                        Icon (emoji or text)
                      </label>
                      <div className="grid grid-cols-8 gap-2 mb-3">
                        {ICON_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setForm(s => ({ ...s, icon: preset.value }))}
                            className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                              form.icon === preset.value
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                                : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                            }`}
                            title={preset.label}
                          >
                            {preset.value}
                          </button>
                        ))}
                      </div>
                      <input
                        name="icon"
                        value={form.icon}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                        placeholder="Or enter custom icon/emoji"
                      />
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Palette size={16} />
                        Color (Tailwind class)
                      </label>
                      <div className="grid grid-cols-8 gap-2 mb-3">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setForm(s => ({ ...s, color: preset.value }))}
                            className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                              form.color === preset.value
                                ? "border-purple-500 ring-2 ring-purple-200"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                            title={preset.label}
                          >
                            <div className={`w-full h-6 rounded ${preset.bg}`}></div>
                          </button>
                        ))}
                      </div>
                      <input
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., blue-500, indigo-600"
                      />
                    </div>

                    {/* Order */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <ArrowUpDown size={16} />
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={form.order}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Lower numbers appear first
                      </p>
                    </div>

                    {/* Published Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Publish Category</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Make this category visible to users
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
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      {editingCategory ? "Update Category" : "Create Category"}
                    </button>
                  </div>
                </form>
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
                      Delete Category
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {categoryToDelete?.title}
                  </strong>
                  ? This will also delete all courses and topics in this category.
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
                    Delete Category
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