/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Code,
  Bold,
  Italic,
  QuoteIcon,
  Underline,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Youtube as YoutubeIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../features/auth/api"; // axios with token
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import UnderlineExt from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight/lib/common.js";
import js from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import cssLang from "highlight.js/lib/languages/css";
import "highlight.js/styles/github.css";

lowlight.registerLanguage("javascript", js);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("html", xml);
lowlight.registerLanguage("xml", xml);
lowlight.registerLanguage("css", cssLang);

const PAGE_SIZE = 8;

function extractTextFromTiptapJSON(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractTextFromTiptapJSON).join(" ");
  if (node.type === "text") return node.text || "";
  return node.content ? node.content.map(extractTextFromTiptapJSON).join(" ") : "";
}

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [meta, setMeta] = useState({
    title: "",
    description: "",
    video_url: "",
    course: "",
    content: { type: "doc", content: [] },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      UnderlineExt,
      Link.configure({ openOnClick: true }),
      BulletList,
      OrderedList,
      Blockquote,
      Image,
      Youtube.configure({ width: 640, height: 360 }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Write content here — headings, paragraphs, code..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: meta.content,
    editorProps: {
      attributes: {
        class: "prose max-w-none text-gray-800 bg-white min-h-[220px] p-4 rounded border border-gray-200",
      },
    },
    onUpdate: ({ editor }) => setMeta((m) => ({ ...m, content: editor.getJSON() })),
  });

  // Fetch topics
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await client.get("/api/topics/");
      setTopics(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await client.get("/api/courses/");
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses.");
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchCourses();
  }, []);

  const filtered = useMemo(() => {
    let out = [...topics];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      out = out.filter((t) => {
        const title = (t.title || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const courseTitle = (t.course?.title || "").toLowerCase();
        const contentText = t.content ? extractTextFromTiptapJSON(t.content) : "";
        return title.includes(q) || desc.includes(q) || courseTitle.includes(q) || contentText.toLowerCase().includes(q);
      });
    }
    if (courseFilter) {
      out = out.filter((t) => String(t.course?.id) === String(courseFilter));
    }
    return out;
  }, [topics, searchQuery, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [searchQuery, courseFilter]);

  const openAddModal = () => {
    setEditingTopic(null);
    setMeta({ title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] } });
    editor?.commands.clearContent();
    setShowModal(true);
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setMeta({
      title: topic.title || "",
      description: topic.description || "",
      video_url: topic.video_url || "",
      course: topic.course?.id ? String(topic.course.id) : "",
      content: topic.content || { type: "doc", content: [] },
    });
    setTimeout(() => topic.content && editor?.commands.setContent(topic.content), 50);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    editor?.commands.clearContent();
    setMeta((m) => ({ ...m, content: { type: "doc", content: [] } }));
  };

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((m) => ({ ...m, [name]: value }));
  };

  const insertCodeBlockWithLanguage = () => {
    const lang = window.prompt("Enter language (e.g., javascript, html, css)");
    editor?.chain().focus().insertContent({
      type: "codeBlock",
      attrs: lang ? { language: lang } : {},
      content: [{ type: "text", text: "// write code here" }],
    }).run();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!meta.title.trim() || !meta.course) {
      toast.error("Title and Course are required.");
      return;
    }
    setSaving(true);

    const payload = {
      title: meta.title,
      description: meta.description || "",
      video_url: meta.video_url || null,
      course: parseInt(meta.course, 10),
      content: meta.content,
    };

    try {
      if (editingTopic) {
        await client.put(`/api/topics/${editingTopic.id}/`, payload);
        toast.success("Topic updated.");
      } else {
        await client.post(`/api/topics/`, payload);
        toast.success("Topic created.");
      }
      closeModal();
      await fetchTopics();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Failed to save. Make sure you have admin permissions.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (t) => {
    setToDelete(t);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await client.delete(`/api/topics/${toDelete.id}/`);
      toast.success("Topic deleted.");
      setShowDeleteConfirm(false);
      setToDelete(null);
      await fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete. Check permissions.");
    }
  };

  const previewFromContent = (content) => {
    if (!content) return "";
    if (typeof content === "string") return content;
    const txt = extractTextFromTiptapJSON(content);
    return txt.length > 240 ? txt.slice(0, 240) + "…" : txt;
  };

  return (
    <div className="p-6 bg-white min-h-screen text-gray-800">
      {/* Header + Search + Filter + New */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Topics</h1>
          <p className="text-sm text-gray-600 mt-1">Add, edit and organize topics with headings, paragraphs, code, and videos.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2 gap-2 w-full md:w-[360px]">
            <Search className="text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700"
          >
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button onClick={openAddModal} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md">
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Course</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Preview</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Created</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500"><Loader2 className="animate-spin inline-block mr-2" /> Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No topics found.</td></tr>
            ) : paginated.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 align-top font-medium">{t.title}</td>
                <td className="px-4 py-3 align-top">{t.course?.title || "-"}</td>
                <td className="px-4 py-3 align-top hidden md:table-cell">{t.description || "—"}</td>
                <td className="px-4 py-3 align-top text-sm">{previewFromContent(t.content)}</td>
                <td className="px-4 py-3 align-top text-sm">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 align-top text-right">
                  <div className="inline-flex items-center gap-2">
                    <button onClick={() => openEditModal(t)} className="px-3 py-1 rounded-md bg-white border text-indigo-600 hover:bg-indigo-50" title="Edit"><Edit3 size={14} /></button>
                    <button onClick={() => promptDelete(t)} className="px-3 py-1 rounded-md bg-white border text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} topics
        </div>
        <div className="inline-flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded bg-white disabled:opacity-40"><ChevronLeft size={16} /></button>
          <div className="px-3 py-1 border rounded bg-white text-sm">{page} / {totalPages}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded bg-white disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} />
            <motion.div initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0, scale: 0.98 }} className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="text-lg font-semibold">{editingTopic ? "Edit Topic" : "Add Topic"}</h2>
                <button onClick={closeModal} className="text-gray-600 hover:text-gray-900 p-2"><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                {/* Title / Course */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Title *</label>
                    <input name="title" value={meta.title} onChange={handleMetaChange} className="w-full border px-3 py-2 rounded" placeholder="Topic title" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Course *</label>
                    <select name="course" value={meta.course} onChange={handleMetaChange} className="w-full border px-3 py-2 rounded" required>
                      <option value="">-- choose course --</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={meta.description} onChange={handleMetaChange} rows={2} className="w-full border px-3 py-2 rounded" placeholder="Optional description" />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">YouTube URL</label>
                  <input name="video_url" value={meta.video_url} onChange={handleMetaChange} className="w-full border px-3 py-2 rounded" placeholder="https://youtu.be/..." />
                </div>

                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center gap-2 bg-gray-50 border rounded px-2 py-2">
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-1 border rounded text-sm bg-white">H1</button>
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded text-sm bg-white">H2</button>
                  <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 border rounded text-sm bg-white"><Bold size={14} /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 border rounded text-sm bg-white"><Italic size={14} /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-2 py-1 border rounded text-sm bg-white"><Underline size={14} /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 border rounded text-sm bg-white"><ListIcon size={14} /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-2 py-1 border rounded text-sm bg-white"><ListOrderedIcon size={14} /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="px-2 py-1 border rounded text-sm bg-white"><QuoteIcon size={14} /></button>
                  <button type="button" onClick={insertCodeBlockWithLanguage} className="px-2 py-1 border rounded text-sm bg-white"><Code size={14} /></button>
                  <button type="button" onClick={() => { const url = window.prompt("YouTube URL"); if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run(); }} className="px-2 py-1 border rounded text-sm bg-white"><YoutubeIcon size={14} /></button>
                </div>

                <div className="border border-gray-200 rounded"><EditorContent editor={editor} /></div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border rounded bg-white text-gray-700">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-indigo-600 text-white">{saving ? "Saving..." : editingTopic ? "Update" : "Create"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)} />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="relative w-full max-w-md bg-white rounded shadow-lg border p-5">
              <h3 className="text-lg font-semibold">Confirm delete</h3>
              <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete <strong>{toDelete?.title}</strong>?</p>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button onClick={confirmDelete} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
