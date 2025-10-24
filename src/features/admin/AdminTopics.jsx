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
  Link as LinkIcon,
  Code,
} from "lucide-react";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import client from "../../features/auth/api";

export default function AdminTopics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  const emptyForm = {
    title: "",
    description: "",
    course: "",
    video_url: "",
    content: [], // { type: "h2" | "p" | "code", text?, language?, code?, explanation?, sandbox? }
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCourses();
    fetchTopics();
  }, []);

  async function fetchCourses() {
    try {
      const res = await client.get("/api/courses/");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses.");
    }
  }

  async function fetchTopics() {
    try {
      setLoading(true);
      const res = await client.get("/api/topics/");
      setTopics(res.data);
      setFilteredTopics(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load topics.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredTopics(
      topics.filter(
        (t) =>
          t.title.toLowerCase().includes(value) ||
          t.description.toLowerCase().includes(value)
      )
    );
  }

  function handleOpenModal(topic = null) {
    if (topic) {
      setEditingTopic(topic);
      setForm({
        title: topic.title,
        description: topic.description,
        course: topic.course?.id || "",
        video_url: topic.video_url || "",
        content: topic.content || [],
      });
    } else {
      setEditingTopic(null);
      setForm(emptyForm);
    }
    setShowPreview(true);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.course) {
      toast.error("Please select a course.");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      course: parseInt(form.course),
      video_url: form.video_url || null,
      content: form.content.map((block) => ({
        type: block.type,
        text: block.text || "",
        code: block.code || "",
        language: block.language || "",
        explanation: block.explanation || "",
        sandbox: block.sandbox || false,
      })),
    };

    try {
      if (editingTopic) {
        await client.put(`/api/topics/${editingTopic.id}/`, payload);
        toast.success("Topic updated successfully.");
      } else {
        await client.post("/api/topics/", payload);
        toast.success("Topic created successfully.");
      }
      setShowModal(false);
      fetchTopics();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to save topic.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await client.delete(`/api/topics/${id}/`);
      toast.success("Topic deleted successfully.");
      fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete topic.");
    }
  }

  function addContentBlock(type) {
    setForm((prev) => ({
      ...prev,
      content: [...prev.content, { type, sandbox: type === "code" ? true : false }],
    }));
  }

  function updateContentBlock(index, field, value) {
    const newContent = [...form.content];
    newContent[index][field] = value;
    setForm((prev) => ({ ...prev, content: newContent }));
  }

  if (!user || !(user.is_admin || user.role === "admin")) {
    return (
      <div className="text-center text-gray-600 p-10">
        You must be an admin to access this page.
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/50 shadow-md backdrop-blur-xl border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Manage Topics
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md text-sm transition-all"
        >
          <Plus size={16} /> Add Topic
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search topics..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Topics Table */}
      {loading ? (
        <p className="text-center text-gray-500">
          <Loader2 className="animate-spin inline-block mr-2" /> Loading topics...
        </p>
      ) : filteredTopics.length === 0 ? (
        <p className="text-center text-gray-500">No topics found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="border-b border-gray-300 text-gray-700">
              <tr>
                <th className="py-3 px-2">Title</th>
                <th>Description</th>
                <th>Video</th>
                <th>Course</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic, i) => (
                <motion.tr
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors"
                >
                  <td className="py-3 px-2 font-medium text-gray-900">{topic.title}</td>
                  <td className="max-w-xs truncate text-gray-700">{topic.description}</td>
                  <td className="text-indigo-500 truncate max-w-[180px]">
                    {topic.video_url ? (
                      <a
                        href={topic.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        <LinkIcon size={14} /> YouTube
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-gray-600">{topic.course?.title || "—"}</td>
                  <td className="text-right space-x-3">
                    <button
                      onClick={() => handleOpenModal(topic)}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="text-red-500 hover:text-red-700"
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex justify-center items-start overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-7xl min-h-[90vh] bg-white rounded-2xl shadow-xl border border-gray-300 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-300">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTopic ? "Edit Topic / Detail View" : "Add New Topic"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1 overflow-hidden">
                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="flex-1 space-y-4 overflow-y-auto"
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">
                      Video URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={form.video_url}
                      onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">
                      Select Course
                    </label>
                    <select
                      required
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select course...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content Blocks Editor */}
                  <div className="mt-4 border-t border-gray-300 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-gray-900 font-medium mb-2">Content Blocks</h4>
                      <button
                        type="button"
                        className="text-sm text-indigo-500 hover:text-indigo-700"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </button>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => addContentBlock("h2")}
                      >
                        Add Heading
                      </button>
                      <button
                        type="button"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => addContentBlock("p")}
                      >
                        Add Paragraph
                      </button>
                      <button
                        type="button"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => addContentBlock("code")}
                      >
                        <Code size={14} /> Add Code
                      </button>
                    </div>

                    {form.content.map((block, idx) => (
                      <div key={idx} className="mb-3 border p-3 rounded bg-gray-100">
                        {block.type === "h2" && (
                          <>
                            <label className="block text-sm font-medium mb-1 text-gray-900">
                              Heading
                            </label>
                            <input
                              type="text"
                              value={block.text || ""}
                              onChange={(e) => updateContentBlock(idx, "text", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </>
                        )}
                        {block.type === "p" && (
                          <>
                            <label className="block text-sm font-medium mb-1 text-gray-900">
                              Paragraph
                            </label>
                            <textarea
                              rows="3"
                              value={block.text || ""}
                              onChange={(e) => updateContentBlock(idx, "text", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </>
                        )}
                        {block.type === "code" && (
                          <>
                            <label className="block text-sm font-medium mb-1 text-gray-900">
                              Code
                            </label>
                            <textarea
                              rows="4"
                              value={block.code || ""}
                              onChange={(e) => updateContentBlock(idx, "code", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <label className="block text-sm font-medium mt-1 mb-1 text-gray-900">
                              Language
                            </label>
                            <input
                              type="text"
                              value={block.language || "js"}
                              onChange={(e) => updateContentBlock(idx, "language", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <label className="block text-sm font-medium mt-1 mb-1 text-gray-900">
                              Explanation
                            </label>
                            <textarea
                              rows="2"
                              value={block.explanation || ""}
                              onChange={(e) => updateContentBlock(idx, "explanation", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium mt-4"
                  >
                    {editingTopic ? "Update Topic" : "Create Topic"}
                  </button>
                </form>

                {/* Live Preview */}
                {showPreview && (
                  <div className="flex-1 p-4 rounded-lg bg-gray-50 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
                    <div className="space-y-3">
                      {form.content.map((block, idx) => {
                        if (block.type === "h2")
                          return (
                            <h2 key={idx} className="text-xl font-bold text-gray-900">{block.text}</h2>
                          );
                        if (block.type === "p")
                          return <p key={idx} className="text-gray-900">{block.text}</p>;
                        if (block.type === "code")
                          return (
                            <div key={idx} className="bg-gray-200 p-2 rounded font-mono text-sm overflow-x-auto">
                              <pre>{block.code}</pre>
                              {block.explanation && <p className="text-gray-700 mt-1">{block.explanation}</p>}
                              {block.sandbox && block.language === "html" && (
                                <iframe
                                  srcDoc={block.code}
                                  className="w-full h-48 border mt-2 rounded"
                                  title="sandbox"
                                />
                              )}
                            </div>
                          );
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
