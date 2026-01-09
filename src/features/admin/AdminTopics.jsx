import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiVideo, FiLayers } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../auth/api";
import BlockNoteEditor from "../../components/BlockNoteEditor";
const TopicCard = React.memo(({ topic, onEdit, onDelete }) => (
  <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 group relative flex flex-col h-full">
    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(topic)}
        className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
      >
        <FiEdit size={14} />
      </button>
      <button
        onClick={() => onDelete(topic)}
        className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
      >
        <FiTrash2 size={14} />
      </button>
    </div>
    <div className="flex items-center gap-2 mb-3">
      <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded uppercase">
        {topic.course_detail?.title || "General"}
      </span>
    </div>
    <h3 className="text-lg font-bold mb-2 dark:text-gray-100 leading-tight">{topic.title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
      {topic.description || "No description provided."}
    </p>
    <div className="pt-4 border-t dark:border-gray-800 text-xs text-gray-500 flex justify-between items-center">
        <span>{new Date(topic.created_at).toLocaleDateString()}</span>
    </div>
  </div>
));
TopicCard.displayName = "TopicCard";

/* ==========================================================================
   Main AdminTopics Component
   ========================================================================== */
export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [courseId, setCourseId] = useState("");
  
  // Editor State
  const [editorJson, setEditorJson] = useState(undefined); // For BlockNote restoration
  const [editorHtml, setEditorHtml] = useState("");        // For API save (content_html)

  const fetchControllerRef = useRef(null);

  /* --- Fetch Data --- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    try {
      const [tRes, cRes] = await Promise.all([
        client.get("/topics/", { signal: controller.signal }),
        client.get("/courses/", { signal: controller.signal }),
      ]);
      setTopics(Array.isArray(tRes.data) ? tRes.data : tRes.data.results || []);
      setCourses(Array.isArray(cRes.data) ? cRes.data : cRes.data.results || []);
    } catch (e) {
      if (e.name !== "CanceledError") toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => fetchControllerRef.current?.abort();
  }, [fetchData]);

  /* --- Handle Modal Open --- */
  const handleOpen = useCallback(async (topic = null) => {
    if (topic) {
      setEditing(topic);
      setTitle(topic.title || "");
      setDescription(topic.description || "");
      setVideoUrl(topic.video_url || "");
      setCourseId(topic.course?.id || topic.course || "");
      
      // Fetch full content (JSON + HTML)
      try {
        const full = await client.get(`/topics/${topic.id}/`);
        // Crucial: Set the JSON for BlockNote to initialize
        setEditorJson(full.data.content && full.data.content.length > 0 ? full.data.content : undefined);
        setEditorHtml(full.data.content_html || "");
      } catch (e) {
        toast.error("Failed to load topic content", e);
        setEditorJson(undefined);
      }
    } else {
      // Create Mode
      setEditing(null);
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setCourseId("");
      setEditorJson(undefined); // Start fresh
      setEditorHtml("");
    }
    setModalOpen(true);
  }, []);

  /* --- Editor Update Handler --- */
  // BlockNoteEditor calls this whenever typing happens
  const handleEditorChange = useCallback(({ json, html }) => {
    setEditorJson(json);
    setEditorHtml(html);
  }, []);

  /* --- Save Data --- */
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return toast.error("Title required");
    if (!courseId) return toast.error("Course required");

    setSaving(true);
    
    const payload = {
      title: title.trim(),
      description: description.trim(),
      video_url: videoUrl.trim(),
      course: courseId,
      content: editorJson,     // Save structured JSON
      content_html: editorHtml, // Save rendered HTML for frontend
    };

    try {
      if (editing) {
        const res = await client.put(`/topics/${editing.id}/`, payload);
        setTopics((prev) => prev.map((t) => (t.id === editing.id ? res.data : t)));
        toast.success("Topic updated!");
      } else {
        const res = await client.post("/topics/", payload);
        setTopics((prev) => [res.data, ...prev]);
        toast.success("Topic created!");
      }
      handleCloseModal();
    } catch (e) {
      console.error(e);
      toast.error("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  }, [title, description, videoUrl, courseId, editorJson, editorHtml, editing]);

  /* --- Delete Data --- */
  const handleDelete = useCallback(async (topic) => {
    if (!window.confirm("Delete this topic?")) return;
    try {
      await client.delete(`/topics/${topic.id}/`);
      setTopics((prev) => prev.filter((t) => t.id !== topic.id));
      toast.success("Topic deleted");
    } catch (e) {
      toast.error("Delete failed", e);
    }
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
    setEditorJson(undefined); // Reset editor state
    setEditorHtml("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-8 rounded-2xl border dark:border-gray-800 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Topics Manager</h1>
            <p className="text-sm text-gray-500 mt-2">Organize your curriculum content, videos, and resources.</p>
          </div>
          <button
            onClick={() => handleOpen()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none transform active:scale-95"
          >
            <FiPlus size={20} /> Create Topic
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : topics.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 border-dashed">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                 <FiLayers size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium text-lg">No topics found</p>
              <p className="text-gray-500 text-sm mt-1">Get started by creating your first topic.</p>
            </div>
          ) : (
            topics.map((t) => (
              <TopicCard key={t.id} topic={t} onEdit={handleOpen} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      {/* Full Screen Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[95vw] h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden ring-1 ring-gray-900/5">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-5 border-b dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editing ? "Edit Topic" : "New Topic"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                   {editing ? "Update your content below" : "Fill in the details to create a new learning resource"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-md"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <FiSave size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Body: Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-50 dark:bg-gray-950/50">
              
              {/* LEFT: Editor (Main Focus) */}
              <div className="flex-1 flex flex-col min-h-[50%] lg:h-auto border-r dark:border-gray-800 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
                 
                 {/* This wrapper forces the editor to reconstruct when opening a new modal */}
                 <div className="flex-1 p-6 lg:p-10 overflow-hidden flex flex-col">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                       Content Editor <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Type '/' for commands</span>
                    </label>
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                      {/* KEY: Using key={editing?.id} forces react to remount component when switching topics */}
                      <BlockNoteEditor 
                        key={editing ? editing.id : 'new'} 
                        initialContent={editorJson} 
                        onChange={handleEditorChange} 
                      />
                    </div>
                 </div>
              </div>

              {/* RIGHT: Metadata Sidebar */}
              <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-l dark:border-gray-800 p-8 overflow-y-auto space-y-6 shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.1)]">
                
                <h3 className="font-bold text-gray-900 dark:text-white pb-2 border-b dark:border-gray-800">Topic Settings</h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Course
                    </label>
                    <div className="relative">
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-medium text-sm"
                      >
                        <option value="">Select a Course...</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                      placeholder="e.g. React Hooks Deep Dive"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Summary
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm leading-relaxed"
                      placeholder="A short description displayed on the topic card..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                       Video URL (Optional)
                    </label>
                    <div className="relative">
                      <FiVideo className="absolute left-4 top-3.5 text-gray-400" />
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t dark:border-gray-800">
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                      <h4 className="text-blue-700 dark:text-blue-300 font-bold text-xs uppercase mb-1">Pro Tip</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        Drag and drop images directly into the editor on the left. Type <code>/code</code> to add a code block.
                      </p>
                   </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}