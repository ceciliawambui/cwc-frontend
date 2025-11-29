/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus, Edit3, Trash2, X, Loader2, Search, ChevronLeft, ChevronRight,
  Code as CodeIcon, Bold, Italic, List as ListIcon, ListOrdered as ListOrderedIcon,
  Youtube as YoutubeIcon, Image as ImageIcon, Table as TableIcon, Link as LinkIcon,
  RotateCcw, AlignLeft, AlignCenter, AlignRight, Eye, Play, Database
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../features/auth/api"; 

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExt from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import Code from "@tiptap/extension-code";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import History from "@tiptap/extension-history";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import CharacterCount from "@tiptap/extension-character-count";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";

import { lowlight } from "lowlight/lib/common.js";
import jsLang from "highlight.js/lib/languages/javascript";
import xmlLang from "highlight.js/lib/languages/xml";
import cssLang from "highlight.js/lib/languages/css";
import pythonLang from "highlight.js/lib/languages/python";
import bashLang from "highlight.js/lib/languages/bash";
import jsonLang from "highlight.js/lib/languages/json";
import javaLang from "highlight.js/lib/languages/java";
import "highlight.js/styles/github.css"; // you can swap style

// register languages for lowlight (used by CodeBlockLowlight)
lowlight.registerLanguage("javascript", jsLang);
lowlight.registerLanguage("js", jsLang);
lowlight.registerLanguage("html", xmlLang);
lowlight.registerLanguage("xml", xmlLang);
lowlight.registerLanguage("css", cssLang);
lowlight.registerLanguage("python", pythonLang);
lowlight.registerLanguage("bash", bashLang);
lowlight.registerLanguage("json", jsonLang);
lowlight.registerLanguage("java", javaLang);

const PAGE_SIZE = 8;

// Helpers
function extractTextFromTiptapJSON(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractTextFromTiptapJSON).join(" ");
  if (node.type === "text") return node.text || "";
  return node.content ? node.content.map(extractTextFromTiptapJSON).join(" ") : "";
}

function sanitizeHTML(html) {
  if (!html) return "";
  // basic sanitization: strip script tags. For production, use DOMPurify.
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

/* ---------- CodeRunnerModal ---------- */
function CodeRunnerModal({ open, onClose, language = "javascript", code = "" }) {
  const iframeRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (iframeRef.current) iframeRef.current.srcdoc = "<!doctype html><html><body></body></html>";
  }, [open]);

  const run = () => {
    setRunning(true);
    // sandboxed iframe (no external network by default in most hosts)
    const safeHTML = `
      <!doctype html><html><head><meta charset="utf-8"/>
      <style>html,body{height:100%;margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fff;color:#111;padding:12px}</style>
      </head><body>
      <div id="app"></div>
      <script>
      try{${code}}catch(e){const pre=document.createElement('pre');pre.style.color='red';pre.textContent='Error: '+e;document.body.appendChild(pre);}
      </script>
      </body></html>
    `;
    if (iframeRef.current) iframeRef.current.srcdoc = safeHTML;
    setTimeout(() => setRunning(false), 150);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-4xl bg-white rounded shadow-lg border">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3"><Play size={16} /> <strong>Run {language.toUpperCase()}</strong></div>
          <div className="flex items-center gap-2">
            <button onClick={run} className="px-3 py-1 bg-indigo-600 text-white rounded">{running ? "Running..." : "Run"}</button>
            <button onClick={onClose} className="px-3 py-1 border rounded bg-white">Close</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-2 p-3">
          <textarea value={code} readOnly className="w-full min-h-[240px] p-3 font-mono bg-gray-50 border rounded" />
          <div className="border rounded overflow-hidden">
            <iframe ref={iframeRef} title="runner" className="w-full h-full min-h-[240px] bg-white" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Snippet Insert Modal ---------- */
function SnippetModal({ open, onClose, onInsert }) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const res = await client.get("/api/snippets/"); // adjust endpoint if different
        setSnippets(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load snippets.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Insert Snippet</h4>
          <button onClick={onClose} className="p-1 border rounded bg-white"><X size={16} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? <div className="p-4 text-center">Loading...</div> : (
            <div className="grid gap-2">
              {snippets.length ? snippets.map(s => (
                <div key={s.id} className="p-3 border rounded hover:shadow-sm flex justify-between items-start">
                  <div>
                    <div className="font-medium">{s.title || `${s.language.toUpperCase()} snippet`}</div>
                    <div className="text-sm text-gray-600">{s.explanation?.slice(0, 140)}</div>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-sm overflow-auto"><code>{s.code}</code></pre>
                  </div>
                  <div className="flex flex-col gap-2 ml-3">
                    <button onClick={() => { onInsert(s); onClose(); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Insert</button>
                  </div>
                </div>
              )) : <div className="p-4 text-center text-gray-500">No snippets found.</div>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- PreviewPane ---------- */
function PreviewPane({ editorInstance }) {
  if (!editorInstance) return null;
  const html = editorInstance.getHTML();
  return <div className="prose max-w-none p-3 border rounded bg-white" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------- AdminTopics Component ---------- */
export default function AdminTopics() {
  // state
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
    title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] },
  });

  const [codeLang, setCodeLang] = useState("javascript");
  const [codeRunnable, setCodeRunnable] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [runnerCode, setRunnerCode] = useState("");
  const [runnerLang, setRunnerLang] = useState("javascript");

  const [snippetModalOpen, setSnippetModalOpen] = useState(false);

  const CODE_LANGS = ["javascript", "html", "css", "python", "jsx", "tsx", "typescript", "bash", "json", "plaintext"];

  // Editor setup
  const editor = useEditor({
    editable: true,
    extensions: [
      StarterKit.configure({
        history: { depth: 200 },
        // keep starter defaults
      }),

      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),

      Dropcursor,
      Gapcursor,
      Underline,
      TextStyle,
      Color,
      Highlight,

      Placeholder.configure({
        placeholder: "Start writing — paste formatted text, add code, tables, media…",
      }),

      ImageExt,
      Youtube.configure({ width: 640, height: 360 }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Code,
      CodeBlockLowlight.configure({ lowlight }),

      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,

      BulletList,
      OrderedList,
      ListItem,

      CharacterCount.configure({ limit: 50000 }),
    ],
    content: meta.content,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none text-gray-900 bg-white min-h-[220px] p-4 sm:p-6 rounded outline-none",
      },
      handlePaste(view, event, slice) {
        // Let our custom handler (below) handle paste by returning true if we process it
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setMeta((m) => ({ ...m, content: editor.getJSON() }));
    },
  });

  // ensure editor content sync when editingTopic/meta.content changes
  useEffect(() => {
    if (!editor) return;
    try {
      editor.commands.setContent(meta.content || { type: "doc", content: [] });
    } catch (err) {
      // fallback to empty doc
      console.warn("Failed to set content:", err);
      editor.commands.clearContent();
    }
  }, [editor, meta.content]);

  // initial fetches
  useEffect(() => {
    (async () => {
      await Promise.all([fetchTopics(), fetchCourses()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTopics() {
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
  }

  async function fetchCourses() {
    try {
      const res = await client.get("/api/courses/");
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses.");
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let out = [...topics];
    if (q) out = out.filter((t) => {
      const title = (t.title || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const courseTitle = (t.course?.title || "").toLowerCase();
      const contentText = extractTextFromTiptapJSON(t.content);
      return title.includes(q) || desc.includes(q) || courseTitle.includes(q) || contentText.includes(q);
    });
    if (courseFilter) out = out.filter((t) => String(t.course?.id) === String(courseFilter));
    return out;
  }, [topics, searchQuery, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [searchQuery, courseFilter]);

  /* ---------- Editor utilities ---------- */
  const insertCodeBlockWithOptions = ({ language = "javascript", runnable = false, text = "" }) => {
    if (!editor) return;
    const sample = text || (language === "html" ? "<!-- html here -->\n" : "// example\n");
    editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language, runnable }, content: [{ type: "text", text: sample }] }).run();
    setTimeout(() => editor.chain().focus().run(), 20);
  };

  const convertSelectionToCodeBlock = () => {
    if (!editor) return;
    const { state } = editor;
    const { from, to } = state.selection;
    if (from === to) return;
    const selectedText = state.doc.textBetween(from, to, "\n");
    editor.chain().focus().deleteRange({ from, to }).insertContent({ type: "codeBlock", attrs: { language: codeLang, runnable: codeRunnable }, content: [{ type: "text", text: selectedText }] }).run();
  };

  const insertTable = (rows = 2, cols = 3, withHeader = true) => {
    try {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run();
    } catch (err) {
      console.warn("table insert failed, fallback:", err);
      toast("Table insertion failed. Try again.");
    }
  };

  const addImageByUrl = async () => {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const handleImageFiles = async (files) => {
    if (!files || !files.length) return;
    for (let f of files) {
      const url = await uploadImageFile(f);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImageFile = async (file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await client.post("/api/uploads/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data?.url || res.data?.file || null;
    } catch (err) {
      // fallback to dataURL for preview-only
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  };

  const addYoutubeByUrl = async () => {
    const url = window.prompt("YouTube or Vimeo URL");
    if (!url) return;
    // some youtube extension accept src only, chain should work
    try {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    } catch (err) {
      // fallback: insert as link
      editor.chain().focus().insertContent(`<p><a href="${url}" target="_blank" rel="noreferrer">${url}</a></p>`).run();
    }
  };

  // Paste handler (attached to our toolbar paste button or used manually)
  const handlePaste = (event) => {
    if (!editor) return;
    const html = event.clipboardData?.getData("text/html");
    const plain = event.clipboardData?.getData("text/plain");
    // If there's plain text multi-line without html, insert as code block
    if (plain && plain.split("\n").length > 1 && !html) {
      event.preventDefault();
      editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language: "plaintext", runnable: false }, content: [{ type: "text", text: plain }] }).run();
      return;
    }
    // If HTML exists, sanitize and insert
    if (html) {
      event.preventDefault();
      const cleaned = sanitizeHTML(html);
      editor.chain().focus().insertContent(cleaned).run();
    }
  };

  /* ---------- CRUD & modal flows ---------- */
  const openAddModal = () => {
    setEditingTopic(null);
    const blank = { title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] } };
    setMeta(blank);
    setCodeLang("javascript");
    setCodeRunnable(false);
    setTimeout(() => { if (editor) editor.commands.setContent(blank.content); }, 150);
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
    setTimeout(() => { if (editor && topic.content) editor.commands.setContent(topic.content); }, 180);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    try { editor?.commands.clearContent(); } catch (e) { /* ignore */ }
    setMeta({ title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] } });
  };

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((m) => ({ ...m, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!meta.title?.trim() || !meta.course) {
      return toast.error("Title and Course are required.");
    }
    setSaving(true);

    // Get JSON + HTML
    const contentJson = editor?.getJSON() || meta.content || { type: "doc", content: [] };
    const contentHtml = sanitizeHTML(editor?.getHTML() || "");

    const payload = {
      title: meta.title.trim(),
      description: meta.description || "",
      video_url: meta.video_url || null,
      course: parseInt(meta.course, 10),
      content: contentJson,
      content_html: contentHtml,
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
      console.error(err.response?.data || err);
      toast.error("Failed to save. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (t) => { setToDelete(t); setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await client.delete(`/api/topics/${toDelete.id}/`);
      toast.success("Topic deleted.");
      await fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete.");
    } finally {
      setShowDeleteConfirm(false);
      setToDelete(null);
    }
  };

  const previewFromContent = (c) => {
    const txt = extractTextFromTiptapJSON(c);
    return txt.length > 120 ? txt.slice(0, 120) + "…" : txt;
  };

  // Insert snippet handler (from CodeSnippet model)
  const insertSnippet = (snippet) => {
    if (!editor || !snippet) return;
    const lang = snippet.language || "plaintext";
    insertCodeBlockWithOptions({ language: lang, runnable: snippet.can_run_in_sandbox, text: snippet.code });
  };

  // Runner controls
  const runSelectedCode = () => {
    if (!editor) return;
    const { state } = editor;
    const { from, to } = state.selection;
    if (from === to) {
      toast.error("Select code to run first.");
      return;
    }
    const selectedText = state.doc.textBetween(from, to, "\n");
    setRunnerLang(codeLang || "javascript");
    setRunnerCode(selectedText);
    setRunnerOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Topics</h2>
        <div className="flex gap-2">
          <button onClick={openAddModal} className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded shadow">
            <Plus size={16} /> Add Topic
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <input type="text" placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-2 border rounded flex-1" />
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Topics table */}
      <div className="overflow-x-auto bg-white border rounded">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-left">Preview</th>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : paginated.length ? paginated.map(topic => (
              <tr key={topic.id} className="border-b hover:bg-gray-50">
                <td className="p-2 align-top">{topic.title}</td>
                <td className="p-2 align-top">{topic.course?.title || "-"}</td>
                <td className="p-2 align-top">{previewFromContent(topic.content)}</td>
                <td className="p-2 align-top">{topic.order ?? "-"}</td>
                <td className="p-2 align-top flex gap-2">
                  <button onClick={() => openEditModal(topic)} className="p-1 bg-yellow-200 rounded hover:bg-yellow-300"><Edit3 size={16} /></button>
                  <button onClick={() => promptDelete(topic)} className="p-1 bg-red-200 rounded hover:bg-red-300"><Trash2 size={16} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No topics found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-3">
        <div>Page {page} / {totalPages}</div>
        <div className="flex gap-1">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1 border rounded"><ChevronLeft size={16} /></button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-1 border rounded"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-5xl p-6 rounded shadow-lg overflow-y-auto max-h-[88vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingTopic ? "Edit Topic" : "Add Topic"}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setSnippetModalOpen(true)} className="px-3 py-1 border rounded bg-white flex items-center gap-2"><Database size={16}/> Insert Snippet</button>
                <button onClick={closeModal} className="p-1 border rounded bg-white"><X size={16} /></button>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input type="text" name="title" placeholder="Title" value={meta.title} onChange={handleMetaChange} className="px-3 py-2 border rounded" required />
                <select name="course" value={meta.course} onChange={handleMetaChange} className="px-3 py-2 border rounded" required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <input type="text" name="description" placeholder="Short description" value={meta.description} onChange={handleMetaChange} className="px-3 py-2 border rounded md:col-span-2" />
                <input type="text" name="video_url" placeholder="Video URL (YouTube/Vimeo)" value={meta.video_url} onChange={handleMetaChange} className="px-3 py-2 border rounded md:col-span-2" />
              </div>

              {/* Sticky Editor Toolbar */}
              <div className="sticky top-0 z-50 bg-white border-b py-2 flex flex-wrap gap-2 items-center">
                <div className="flex gap-1 items-center">
                  <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="p-2 rounded hover:bg-gray-100"><Bold size={16} /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="p-2 rounded hover:bg-gray-100"><Italic size={16} /></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="p-2 rounded hover:bg-gray-100"><u>U</u></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className="p-2 rounded hover:bg-gray-100">S</button>
                </div>

                <div className="flex gap-1 items-center">
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-1 border rounded">H1</button>
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded">H2</button>
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2 py-1 border rounded">H3</button>
                </div>

                <div className="flex gap-1 items-center">
                  <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 rounded hover:bg-gray-100"><ListIcon size={16}/></button>
                  <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-2 rounded hover:bg-gray-100"><ListOrderedIcon size={16}/></button>
                  <button type="button" onClick={() => insertTable(3,3)} className="p-2 rounded hover:bg-gray-100"><TableIcon size={16}/></button>
                  <button type="button" onClick={addImageByUrl} className="p-2 rounded hover:bg-gray-100"><ImageIcon size={16}/></button>
                  <button type="button" onClick={addYoutubeByUrl} className="p-2 rounded hover:bg-gray-100"><YoutubeIcon size={16}/></button>
                </div>

                <div className="flex gap-1 items-center ml-auto">
                  <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="p-1 border rounded">
                    {CODE_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <label className="flex items-center gap-2 px-2 py-1 border rounded cursor-pointer">
                    <input type="checkbox" checked={codeRunnable} onChange={e => setCodeRunnable(e.target.checked)} /> Runnable
                  </label>
                  <button type="button" onClick={convertSelectionToCodeBlock} className="p-2 rounded hover:bg-gray-100" title="Convert selection to code block"><CodeIcon size={16} /></button>
                  <button type="button" onClick={() => insertCodeBlockWithOptions({ language: codeLang, runnable: codeRunnable })} className="px-2 py-1 border rounded">Insert code block</button>
                  <button type="button" onClick={() => runSelectedCode()} className="px-2 py-1 border rounded bg-white flex items-center gap-2"><Play size={14}/> Run</button>
                  <button type="button" onClick={() => setShowPreview(p => !p)} className="p-2 rounded hover:bg-gray-100"><Eye size={16} /></button>
                </div>
              </div>

              {/* Editor */}
              <div className="border rounded overflow-hidden">
                <EditorContent editor={editor} onPaste={handlePaste} className="min-h-[320px] p-4" />
              </div>

              {/* Preview */}
              {showPreview && <PreviewPane editorInstance={editor} />}

              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={closeModal} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-1 bg-indigo-600 text-white rounded">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)}></div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-sm p-6 rounded shadow-lg text-center">
            <p>Are you sure you want to delete <strong>{toDelete?.title}</strong>?</p>
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Snippet Insert Modal */}
      <SnippetModal open={snippetModalOpen} onClose={() => setSnippetModalOpen(false)} onInsert={insertSnippet} />

      {/* Code Runner Modal */}
      <CodeRunnerModal open={runnerOpen} onClose={() => setRunnerOpen(false)} code={runnerCode} language={runnerLang} />
    </div>
  );
}
