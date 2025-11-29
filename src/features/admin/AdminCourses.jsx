/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit3,
  Trash2,
  Loader2,
  Plus,
  X,
  AlertTriangle,
  ImageIcon,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import client from "../../features/auth/api"; // axios instance with auth headers

const PAGE_SIZE = 8;

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [page, setPage] = useState(1);
  const [newThisWeek, setNewThisWeek] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await client.get("/api/courses/");
      const data = res.data || [];
      setCourses(data);
      setFiltered(data);
      computeAnalytics(data);
      setPage(1);
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }

  function computeAnalytics(data) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const count = data.filter(
      (c) => new Date(c.created_at) >= weekAgo
    ).length;
    setNewThisWeek(count);
  }

  const categories = useMemo(() => {
    const setCat = new Set();
    courses.forEach((c) => {
      if (c.category) setCat.add(c.category);
    });
    return ["all", ...Array.from(setCat).sort()];
  }, [courses]);

  useEffect(() => {
    let out = [...courses];
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.category || "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      out = out.filter((c) => c.category === categoryFilter);
    }
    setFiltered(out);
    setPage(1);
  }, [search, categoryFilter, courses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function openAddModal() {
    setEditingCourse(null);
    setForm({
      title: "",
      description: "",
      category: "",
      thumbnail: "",
    });
    setShowModal(true);
  }

  function openEditModal(course) {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      thumbnail: course.thumbnail || "",
    });
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    if (form.category.trim()) formData.append("category", form.category.trim());
    if (form.thumbnail instanceof File) {
      formData.append("thumbnail", form.thumbnail);
    }
  
    try {
      if (editingCourse) {
        await client.put(`/api/courses/${editingCourse.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Course updated successfully.");
      } else {
        await client.post("/api/courses/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Course created successfully.");
      }
  
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Save error:", err.response || err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.title?.[0] ||
        "Failed to save course.";
      toast.error(msg);
    }
  }
  

  function confirmDelete(course) {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirmed() {
    if (!courseToDelete) return;
    try {
      await client.delete(`/api/courses/${courseToDelete.id}/`);
      toast.success("Course deleted.");
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete course.");
    }
  }

  function renderEmpty() {
    return (
      <div className="py-20 text-center text-gray-500 dark:text-gray-400">
        <ImageIcon className="mx-auto mb-4 text-gray-300" size={36} />
        <p className="mb-2">No courses yet.</p>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white"
        >
          <Plus size={14} /> Add first course
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/50 shadow-md backdrop-blur-xl border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Manage Courses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add, edit and organize the course listings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-white/60 dark:bg-gray-900/60 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-sm text-indigo-600 font-medium">This week</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {newThisWeek}
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg hover:scale-[1.01] transition-transform"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, descriptions, categories..."
            className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/50 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/50 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-500">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* COURSES GRID */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <Loader2 className="animate-spin inline-block mr-2" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border">
                      {course.thumbnail ? (
                        <img
                          className="w-full h-full object-cover"
                          src={course.thumbnail}
                          alt={course.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
                        {course.description || "No description"}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          {course.category || "Uncategorized"}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(course)}
                            className="text-indigo-600 hover:text-indigo-800"
                            aria-label="Edit course"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => confirmDelete(course)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete course"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-400 mt-2">
                        Created:{" "}
                        {new Date(course.created_at).toLocaleDateString()} •{" "}
                        {course.created_by || "—"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-700/20">
                    <Tag className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {editingCourse ? "Edit Course" : "Create Course"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Add title, category, thumbnail URL and description
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCourse(null);
                  }}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-300"
                >
                  <X />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 max-h-[75vh] overflow-auto"
              >
                {/* LEFT */}
                <div className="space-y-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. HTML & CSS basics"
                  />

                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. Web Development"
                  />

                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Thumbnail
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="thumbnail"
                    onChange={(e) => setForm((s) => ({ ...s, thumbnail: e.target.files[0] }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-2">
                      Thumbnail preview
                    </div>
                    <div className="w-full h-40 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      {form.thumbnail ? (
                        <img
                          src={
                            form.thumbnail instanceof File
                              ? URL.createObjectURL(form.thumbnail)
                              : form.thumbnail
                          }
                          alt="thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center gap-2">
                          <ImageIcon />
                          <div className="text-xs">No thumbnail</div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-4 flex flex-col">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={10}
                    value={form.description}
                    onChange={handleChange}
                    className="w-full h-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Explain the course, what's included, prerequisites..."
                  />

                  <div className="mt-auto flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingCourse(null);
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold text-sm"
                    >
                      {editingCourse ? "Update Course" : "Create Course"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Confirm deletion
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete{" "}
                    <span className="font-medium">
                      {courseToDelete?.title}
                    </span>
                    ?
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
