/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit3,
  Trash2,
  Loader2,
  Plus,
  X,
  AlertTriangle,
  BookOpenCheck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import client from "../../features/auth/api";

export default function AdminCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ title: "", description: "" });
  const [analytics, setAnalytics] = useState({ newCourses: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const res = await client.get("/api/courses/");
      setCourses(res.data);
      setFilteredCourses(res.data);
      computeAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }

  function computeAnalytics(data) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newCourses = data.filter(
      (c) => new Date(c.created_at) >= weekAgo
    ).length;
    setAnalytics({ newCourses });
  }

  function handleSearch(e) {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredCourses(
      courses.filter(
        (c) =>
          c.title.toLowerCase().includes(value) ||
          c.description.toLowerCase().includes(value)
      )
    );
  }

  function confirmDelete(course) {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    if (!courseToDelete) return;
    try {
      await client.delete(`/api/courses/${courseToDelete.id}/`);
      setCourses((prev) =>
        prev.filter((c) => c.id !== courseToDelete.id)
      );
      setFilteredCourses((prev) =>
        prev.filter((c) => c.id !== courseToDelete.id)
      );
      toast.success("Course deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err.response || err);
      toast.error(
        err.response?.status === 403
          ? "You are not authorized to delete courses."
          : "Failed to delete course."
      );
    } finally {
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  }

  function handleOpenModal(course = null) {
    if (course) {
      setEditingCourse(course);
      setForm({ title: course.title, description: course.description });
    } else {
      setEditingCourse(null);
      setForm({ title: "", description: "" });
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingCourse) {
        await client.put(`/api/courses/${editingCourse.id}/`, form);
        toast.success("Course updated successfully.");
      } else {
        await client.post("/api/courses/", form);
        toast.success("Course added successfully.");
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error("Submit error:", err.response || err);
      toast.error(
        err.response?.status === 403
          ? "Only admins can create or edit courses."
          : "Failed to save course."
      );
    }
  }

  if (!user || !(user.is_admin || user.role === "admin")) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 p-10">
        You must be an admin to access this page.
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/50 shadow-md backdrop-blur-xl border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* === Header Section === */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Manage Courses
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md text-sm transition-all"
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* === Search + Analytics === */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search courses..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Analytics Card */}
        <motion.div
          className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 dark:from-indigo-500/20 dark:to-indigo-600/20 border border-indigo-500/30 rounded-xl w-full md:w-auto shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <BookOpenCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-indigo-500 font-medium">This Week</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.newCourses}
            </p>
          </div>
        </motion.div>
      </div>

      {/* === Courses Table === */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <Loader2 className="animate-spin inline-block mr-2" /> Loading courses...
        </p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No courses found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="py-3 px-2">Title</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Created By</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, i) => (
                <motion.tr
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors"
                >
                  <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">
                    {course.title}
                  </td>
                  <td className="max-w-xs truncate text-gray-700 dark:text-gray-300">
                    {course.description}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-gray-600 dark:text-gray-400">
                    {course.created_by || "—"}
                  </td>
                  <td className="text-right space-x-3">
                    <button
                      onClick={() => handleOpenModal(course)}
                      className="text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(course)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Add/Edit Modal === */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all"
                  >
                    {editingCourse ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === Delete Confirmation Modal === */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500 w-6 h-6" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {courseToDelete?.title}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
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
