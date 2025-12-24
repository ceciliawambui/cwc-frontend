// /* eslint-disable no-unused-vars */
// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { motion } from "framer-motion";
// import {
//   Plus, Edit3, Trash2, X, Loader2, Search, ChevronLeft, ChevronRight,
//   Code as CodeIcon, Bold, Italic, List as ListIcon, ListOrdered as ListOrderedIcon,
//   Youtube as YoutubeIcon, Image as ImageIcon, Table as TableIcon, Link as LinkIcon,
//   RotateCcw, AlignLeft, AlignCenter, AlignRight, Eye, Play, Database
// } from "lucide-react";
// import toast from "react-hot-toast";
// import client from "../../features/auth/api"; 

// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import Placeholder from "@tiptap/extension-placeholder";
// import ImageExt from "@tiptap/extension-image";
// import Youtube from "@tiptap/extension-youtube";
// import TextAlign from "@tiptap/extension-text-align";
// import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableCell } from "@tiptap/extension-table-cell";
// import { TableHeader } from "@tiptap/extension-table-header";
// import Link from "@tiptap/extension-link";
// import Code from "@tiptap/extension-code";
// import { TextStyle } from "@tiptap/extension-text-style";
// import Color from "@tiptap/extension-color";
// import Dropcursor from "@tiptap/extension-dropcursor";
// import Gapcursor from "@tiptap/extension-gapcursor";
// import History from "@tiptap/extension-history";
// import ListItem from "@tiptap/extension-list-item";
// import BulletList from "@tiptap/extension-bullet-list";
// import OrderedList from "@tiptap/extension-ordered-list";
// import CharacterCount from "@tiptap/extension-character-count";
// import Heading from "@tiptap/extension-heading";
// import Highlight from "@tiptap/extension-highlight";

// import { lowlight } from "lowlight/lib/common.js";
// import jsLang from "highlight.js/lib/languages/javascript";
// import xmlLang from "highlight.js/lib/languages/xml";
// import cssLang from "highlight.js/lib/languages/css";
// import pythonLang from "highlight.js/lib/languages/python";
// import bashLang from "highlight.js/lib/languages/bash";
// import jsonLang from "highlight.js/lib/languages/json";
// import javaLang from "highlight.js/lib/languages/java";
// import "highlight.js/styles/github.css"; // you can swap style

// // register languages for lowlight (used by CodeBlockLowlight)
// lowlight.registerLanguage("javascript", jsLang);
// lowlight.registerLanguage("js", jsLang);
// lowlight.registerLanguage("html", xmlLang);
// lowlight.registerLanguage("xml", xmlLang);
// lowlight.registerLanguage("css", cssLang);
// lowlight.registerLanguage("python", pythonLang);
// lowlight.registerLanguage("bash", bashLang);
// lowlight.registerLanguage("json", jsonLang);
// lowlight.registerLanguage("java", javaLang);

// const PAGE_SIZE = 8;

// // Helpers
// function extractTextFromTiptapJSON(node) {
//   if (!node) return "";
//   if (typeof node === "string") return node;
//   if (Array.isArray(node)) return node.map(extractTextFromTiptapJSON).join(" ");
//   if (node.type === "text") return node.text || "";
//   return node.content ? node.content.map(extractTextFromTiptapJSON).join(" ") : "";
// }

// function sanitizeHTML(html) {
//   if (!html) return "";
//   // basic sanitization: strip script tags. For production, use DOMPurify.
//   return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
// }

// /* ---------- CodeRunnerModal ---------- */
// function CodeRunnerModal({ open, onClose, language = "javascript", code = "" }) {
//   const iframeRef = useRef(null);
//   const [running, setRunning] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     if (iframeRef.current) iframeRef.current.srcdoc = "<!doctype html><html><body></body></html>";
//   }, [open]);

//   const run = () => {
//     setRunning(true);
//     // sandboxed iframe (no external network by default in most hosts)
//     const safeHTML = `
//       <!doctype html><html><head><meta charset="utf-8"/>
//       <style>html,body{height:100%;margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fff;color:#111;padding:12px}</style>
//       </head><body>
//       <div id="app"></div>
//       <script>
//       try{${code}}catch(e){const pre=document.createElement('pre');pre.style.color='red';pre.textContent='Error: '+e;document.body.appendChild(pre);}
//       </script>
//       </body></html>
//     `;
//     if (iframeRef.current) iframeRef.current.srcdoc = safeHTML;
//     setTimeout(() => setRunning(false), 150);
//   };

//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-4xl bg-white rounded shadow-lg border">
//         <div className="flex items-center justify-between p-3 border-b">
//           <div className="flex items-center gap-3"><Play size={16} /> <strong>Run {language.toUpperCase()}</strong></div>
//           <div className="flex items-center gap-2">
//             <button onClick={run} className="px-3 py-1 bg-indigo-600 text-white rounded">{running ? "Running..." : "Run"}</button>
//             <button onClick={onClose} className="px-3 py-1 border rounded bg-white">Close</button>
//           </div>
//         </div>
//         <div className="grid md:grid-cols-2 gap-2 p-3">
//           <textarea value={code} readOnly className="w-full min-h-[240px] p-3 font-mono bg-gray-50 border rounded" />
//           <div className="border rounded overflow-hidden">
//             <iframe ref={iframeRef} title="runner" className="w-full h-full min-h-[240px] bg-white" />
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// /* ---------- Snippet Insert Modal ---------- */
// function SnippetModal({ open, onClose, onInsert }) {
//   const [snippets, setSnippets] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setLoading(true);
//     (async () => {
//       try {
//         const res = await client.get("/api/snippets/"); // adjust endpoint if different
//         setSnippets(res.data || []);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load snippets.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [open]);

//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded shadow-lg p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h4 className="text-lg font-semibold">Insert Snippet</h4>
//           <button onClick={onClose} className="p-1 border rounded bg-white"><X size={16} /></button>
//         </div>
//         <div className="max-h-[60vh] overflow-y-auto">
//           {loading ? <div className="p-4 text-center">Loading...</div> : (
//             <div className="grid gap-2">
//               {snippets.length ? snippets.map(s => (
//                 <div key={s.id} className="p-3 border rounded hover:shadow-sm flex justify-between items-start">
//                   <div>
//                     <div className="font-medium">{s.title || `${s.language.toUpperCase()} snippet`}</div>
//                     <div className="text-sm text-gray-600">{s.explanation?.slice(0, 140)}</div>
//                     <pre className="mt-2 p-2 bg-gray-50 rounded text-sm overflow-auto"><code>{s.code}</code></pre>
//                   </div>
//                   <div className="flex flex-col gap-2 ml-3">
//                     <button onClick={() => { onInsert(s); onClose(); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Insert</button>
//                   </div>
//                 </div>
//               )) : <div className="p-4 text-center text-gray-500">No snippets found.</div>}
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// /* ---------- PreviewPane ---------- */
// function PreviewPane({ editorInstance }) {
//   if (!editorInstance) return null;
//   const html = editorInstance.getHTML();
//   return <div className="prose max-w-none p-3 border rounded bg-white" dangerouslySetInnerHTML={{ __html: html }} />;
// }

// /* ---------- AdminTopics Component ---------- */
// export default function AdminTopics() {
//   // state
//   const [topics, setTopics] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [courseFilter, setCourseFilter] = useState("");
//   const [page, setPage] = useState(1);

//   const [showModal, setShowModal] = useState(false);
//   const [editingTopic, setEditingTopic] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [toDelete, setToDelete] = useState(null);

//   const [meta, setMeta] = useState({
//     title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] },
//   });

//   const [codeLang, setCodeLang] = useState("javascript");
//   const [codeRunnable, setCodeRunnable] = useState(false);
//   const [showPreview, setShowPreview] = useState(true);
//   const [runnerOpen, setRunnerOpen] = useState(false);
//   const [runnerCode, setRunnerCode] = useState("");
//   const [runnerLang, setRunnerLang] = useState("javascript");

//   const [snippetModalOpen, setSnippetModalOpen] = useState(false);

//   const CODE_LANGS = ["javascript", "html", "css", "python", "jsx", "tsx", "typescript", "bash", "json", "plaintext"];

//   // Editor setup
//   const editor = useEditor({
//     editable: true,
//     extensions: [
//       StarterKit.configure({
//         history: { depth: 200 },
//         // keep starter defaults
//       }),

//       Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),

//       Dropcursor,
//       Gapcursor,
//       Underline,
//       TextStyle,
//       Color,
//       Highlight,

//       Placeholder.configure({
//         placeholder: "Start writing — paste formatted text, add code, tables, media…",
//       }),

//       ImageExt,
//       Youtube.configure({ width: 640, height: 360 }),

//       Link.configure({
//         openOnClick: false,
//         autolink: true,
//         linkOnPaste: true,
//       }),

//       TextAlign.configure({
//         types: ["heading", "paragraph"],
//       }),

//       Code,
//       CodeBlockLowlight.configure({ lowlight }),

//       Table.configure({ resizable: true }),
//       TableRow,
//       TableHeader,
//       TableCell,

//       BulletList,
//       OrderedList,
//       ListItem,

//       CharacterCount.configure({ limit: 50000 }),
//     ],
//     content: meta.content,
//     editorProps: {
//       attributes: {
//         class:
//           "prose max-w-none text-gray-900 bg-white min-h-[220px] p-4 sm:p-6 rounded outline-none",
//       },
//       handlePaste(view, event, slice) {
//         // Let our custom handler (below) handle paste by returning true if we process it
//         return false;
//       },
//     },
//     onUpdate: ({ editor }) => {
//       setMeta((m) => ({ ...m, content: editor.getJSON() }));
//     },
//   });

//   // ensure editor content sync when editingTopic/meta.content changes
//   useEffect(() => {
//     if (!editor) return;
//     try {
//       editor.commands.setContent(meta.content || { type: "doc", content: [] });
//     } catch (err) {
//       // fallback to empty doc
//       console.warn("Failed to set content:", err);
//       editor.commands.clearContent();
//     }
//   }, [editor, meta.content]);

//   // initial fetches
//   useEffect(() => {
//     (async () => {
//       await Promise.all([fetchTopics(), fetchCourses()]);
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function fetchTopics() {
//     setLoading(true);
//     try {
//       const res = await client.get("/api/topics/");
//       setTopics(res.data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load topics.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchCourses() {
//     try {
//       const res = await client.get("/api/courses/");
//       setCourses(res.data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load courses.");
//     }
//   }

//   const filtered = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     let out = [...topics];
//     if (q) out = out.filter((t) => {
//       const title = (t.title || "").toLowerCase();
//       const desc = (t.description || "").toLowerCase();
//       const courseTitle = (t.course?.title || "").toLowerCase();
//       const contentText = extractTextFromTiptapJSON(t.content);
//       return title.includes(q) || desc.includes(q) || courseTitle.includes(q) || contentText.includes(q);
//     });
//     if (courseFilter) out = out.filter((t) => String(t.course?.id) === String(courseFilter));
//     return out;
//   }, [topics, searchQuery, courseFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const paginated = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filtered.slice(start, start + PAGE_SIZE);
//   }, [filtered, page]);

//   useEffect(() => setPage(1), [searchQuery, courseFilter]);

//   /* ---------- Editor utilities ---------- */
//   const insertCodeBlockWithOptions = ({ language = "javascript", runnable = false, text = "" }) => {
//     if (!editor) return;
//     const sample = text || (language === "html" ? "<!-- html here -->\n" : "// example\n");
//     editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language, runnable }, content: [{ type: "text", text: sample }] }).run();
//     setTimeout(() => editor.chain().focus().run(), 20);
//   };

//   const convertSelectionToCodeBlock = () => {
//     if (!editor) return;
//     const { state } = editor;
//     const { from, to } = state.selection;
//     if (from === to) return;
//     const selectedText = state.doc.textBetween(from, to, "\n");
//     editor.chain().focus().deleteRange({ from, to }).insertContent({ type: "codeBlock", attrs: { language: codeLang, runnable: codeRunnable }, content: [{ type: "text", text: selectedText }] }).run();
//   };

//   const insertTable = (rows = 2, cols = 3, withHeader = true) => {
//     try {
//       editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run();
//     } catch (err) {
//       console.warn("table insert failed, fallback:", err);
//       toast("Table insertion failed. Try again.");
//     }
//   };

//   const addImageByUrl = async () => {
//     const url = window.prompt("Image URL");
//     if (!url) return;
//     editor.chain().focus().setImage({ src: url }).run();
//   };

//   const handleImageFiles = async (files) => {
//     if (!files || !files.length) return;
//     for (let f of files) {
//       const url = await uploadImageFile(f);
//       if (url) editor.chain().focus().setImage({ src: url }).run();
//     }
//   };

//   const uploadImageFile = async (file) => {
//     try {
//       const fd = new FormData();
//       fd.append("file", file);
//       const res = await client.post("/api/uploads/", fd, { headers: { "Content-Type": "multipart/form-data" } });
//       return res.data?.url || res.data?.file || null;
//     } catch (err) {
//       // fallback to dataURL for preview-only
//       return await new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onload = () => resolve(reader.result);
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const addYoutubeByUrl = async () => {
//     const url = window.prompt("YouTube or Vimeo URL");
//     if (!url) return;
//     // some youtube extension accept src only, chain should work
//     try {
//       editor.chain().focus().setYoutubeVideo({ src: url }).run();
//     } catch (err) {
//       // fallback: insert as link
//       editor.chain().focus().insertContent(`<p><a href="${url}" target="_blank" rel="noreferrer">${url}</a></p>`).run();
//     }
//   };

//   // Paste handler (attached to our toolbar paste button or used manually)
//   const handlePaste = (event) => {
//     if (!editor) return;
//     const html = event.clipboardData?.getData("text/html");
//     const plain = event.clipboardData?.getData("text/plain");
//     // If there's plain text multi-line without html, insert as code block
//     if (plain && plain.split("\n").length > 1 && !html) {
//       event.preventDefault();
//       editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language: "plaintext", runnable: false }, content: [{ type: "text", text: plain }] }).run();
//       return;
//     }
//     // If HTML exists, sanitize and insert
//     if (html) {
//       event.preventDefault();
//       const cleaned = sanitizeHTML(html);
//       editor.chain().focus().insertContent(cleaned).run();
//     }
//   };

//   /* ---------- CRUD & modal flows ---------- */
//   const openAddModal = () => {
//     setEditingTopic(null);
//     const blank = { title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] } };
//     setMeta(blank);
//     setCodeLang("javascript");
//     setCodeRunnable(false);
//     setTimeout(() => { if (editor) editor.commands.setContent(blank.content); }, 150);
//     setShowModal(true);
//   };

//   const openEditModal = (topic) => {
//     setEditingTopic(topic);
//     setMeta({
//       title: topic.title || "",
//       description: topic.description || "",
//       video_url: topic.video_url || "",
//       course: topic.course?.id ? String(topic.course.id) : "",
//       content: topic.content || { type: "doc", content: [] },
//     });
//     setTimeout(() => { if (editor && topic.content) editor.commands.setContent(topic.content); }, 180);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditingTopic(null);
//     try { editor?.commands.clearContent(); } catch (e) { /* ignore */ }
//     setMeta({ title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] } });
//   };

//   const handleMetaChange = (e) => {
//     const { name, value } = e.target;
//     setMeta((m) => ({ ...m, [name]: value }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!meta.title?.trim() || !meta.course) {
//       return toast.error("Title and Course are required.");
//     }
//     setSaving(true);

//     // Get JSON + HTML
//     const contentJson = editor?.getJSON() || meta.content || { type: "doc", content: [] };
//     const contentHtml = sanitizeHTML(editor?.getHTML() || "");

//     const payload = {
//       title: meta.title.trim(),
//       description: meta.description || "",
//       video_url: meta.video_url || null,
//       course: parseInt(meta.course, 10),
//       content: contentJson,
//       content_html: contentHtml,
//     };

//     try {
//       if (editingTopic) {
//         await client.put(`/api/topics/${editingTopic.id}/`, payload);
//         toast.success("Topic updated.");
//       } else {
//         await client.post(`/api/topics/`, payload);
//         toast.success("Topic created.");
//       }
//       closeModal();
//       await fetchTopics();
//     } catch (err) {
//       console.error(err.response?.data || err);
//       toast.error("Failed to save. Check console for details.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const promptDelete = (t) => { setToDelete(t); setShowDeleteConfirm(true); };
//   const confirmDelete = async () => {
//     if (!toDelete) return;
//     try {
//       await client.delete(`/api/topics/${toDelete.id}/`);
//       toast.success("Topic deleted.");
//       await fetchTopics();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete.");
//     } finally {
//       setShowDeleteConfirm(false);
//       setToDelete(null);
//     }
//   };

//   const previewFromContent = (c) => {
//     const txt = extractTextFromTiptapJSON(c);
//     return txt.length > 120 ? txt.slice(0, 120) + "…" : txt;
//   };

//   // Insert snippet handler (from CodeSnippet model)
//   const insertSnippet = (snippet) => {
//     if (!editor || !snippet) return;
//     const lang = snippet.language || "plaintext";
//     insertCodeBlockWithOptions({ language: lang, runnable: snippet.can_run_in_sandbox, text: snippet.code });
//   };

//   // Runner controls
//   const runSelectedCode = () => {
//     if (!editor) return;
//     const { state } = editor;
//     const { from, to } = state.selection;
//     if (from === to) {
//       toast.error("Select code to run first.");
//       return;
//     }
//     const selectedText = state.doc.textBetween(from, to, "\n");
//     setRunnerLang(codeLang || "javascript");
//     setRunnerCode(selectedText);
//     setRunnerOpen(true);
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold">Topics</h2>
//         <div className="flex gap-2">
//           <button onClick={openAddModal} className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded shadow">
//             <Plus size={16} /> Add Topic
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-2 mb-4">
//         <input type="text" placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-2 border rounded flex-1" />
//         <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="px-3 py-2 border rounded">
//           <option value="">All Courses</option>
//           {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
//         </select>
//       </div>

//       {/* Topics table */}
//       <div className="overflow-x-auto bg-white border rounded">
//         <table className="w-full">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 text-left">Title</th>
//               <th className="p-2 text-left">Course</th>
//               <th className="p-2 text-left">Preview</th>
//               <th className="p-2 text-left">Order</th>
//               <th className="p-2 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
//             ) : paginated.length ? paginated.map(topic => (
//               <tr key={topic.id} className="border-b hover:bg-gray-50">
//                 <td className="p-2 align-top">{topic.title}</td>
//                 <td className="p-2 align-top">{topic.course?.title || "-"}</td>
//                 <td className="p-2 align-top">{previewFromContent(topic.content)}</td>
//                 <td className="p-2 align-top">{topic.order ?? "-"}</td>
//                 <td className="p-2 align-top flex gap-2">
//                   <button onClick={() => openEditModal(topic)} className="p-1 bg-yellow-200 rounded hover:bg-yellow-300"><Edit3 size={16} /></button>
//                   <button onClick={() => promptDelete(topic)} className="p-1 bg-red-200 rounded hover:bg-red-300"><Trash2 size={16} /></button>
//                 </td>
//               </tr>
//             )) : (
//               <tr><td colSpan={5} className="p-4 text-center text-gray-500">No topics found.</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between items-center mt-3">
//         <div>Page {page} / {totalPages}</div>
//         <div className="flex gap-1">
//           <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1 border rounded"><ChevronLeft size={16} /></button>
//           <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-1 border rounded"><ChevronRight size={16} /></button>
//         </div>
//       </div>

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10">
//           <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
//           <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-5xl p-6 rounded shadow-lg overflow-y-auto max-h-[88vh]">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold">{editingTopic ? "Edit Topic" : "Add Topic"}</h3>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => setSnippetModalOpen(true)} className="px-3 py-1 border rounded bg-white flex items-center gap-2"><Database size={16}/> Insert Snippet</button>
//                 <button onClick={closeModal} className="p-1 border rounded bg-white"><X size={16} /></button>
//               </div>
//             </div>

//             <form onSubmit={handleSave} className="flex flex-col gap-3">
//               <div className="grid md:grid-cols-2 gap-3">
//                 <input type="text" name="title" placeholder="Title" value={meta.title} onChange={handleMetaChange} className="px-3 py-2 border rounded" required />
//                 <select name="course" value={meta.course} onChange={handleMetaChange} className="px-3 py-2 border rounded" required>
//                   <option value="">Select Course</option>
//                   {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
//                 </select>
//                 <input type="text" name="description" placeholder="Short description" value={meta.description} onChange={handleMetaChange} className="px-3 py-2 border rounded md:col-span-2" />
//                 <input type="text" name="video_url" placeholder="Video URL (YouTube/Vimeo)" value={meta.video_url} onChange={handleMetaChange} className="px-3 py-2 border rounded md:col-span-2" />
//               </div>

//               {/* Sticky Editor Toolbar */}
//               <div className="sticky top-0 z-50 bg-white border-b py-2 flex flex-wrap gap-2 items-center">
//                 <div className="flex gap-1 items-center">
//                   <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="p-2 rounded hover:bg-gray-100"><Bold size={16} /></button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="p-2 rounded hover:bg-gray-100"><Italic size={16} /></button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="p-2 rounded hover:bg-gray-100"><u>U</u></button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className="p-2 rounded hover:bg-gray-100">S</button>
//                 </div>

//                 <div className="flex gap-1 items-center">
//                   <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-1 border rounded">H1</button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded">H2</button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2 py-1 border rounded">H3</button>
//                 </div>

//                 <div className="flex gap-1 items-center">
//                   <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 rounded hover:bg-gray-100"><ListIcon size={16}/></button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-2 rounded hover:bg-gray-100"><ListOrderedIcon size={16}/></button>
//                   <button type="button" onClick={() => insertTable(3,3)} className="p-2 rounded hover:bg-gray-100"><TableIcon size={16}/></button>
//                   <button type="button" onClick={addImageByUrl} className="p-2 rounded hover:bg-gray-100"><ImageIcon size={16}/></button>
//                   <button type="button" onClick={addYoutubeByUrl} className="p-2 rounded hover:bg-gray-100"><YoutubeIcon size={16}/></button>
//                 </div>

//                 <div className="flex gap-1 items-center ml-auto">
//                   <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="p-1 border rounded">
//                     {CODE_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
//                   </select>
//                   <label className="flex items-center gap-2 px-2 py-1 border rounded cursor-pointer">
//                     <input type="checkbox" checked={codeRunnable} onChange={e => setCodeRunnable(e.target.checked)} /> Runnable
//                   </label>
//                   <button type="button" onClick={convertSelectionToCodeBlock} className="p-2 rounded hover:bg-gray-100" title="Convert selection to code block"><CodeIcon size={16} /></button>
//                   <button type="button" onClick={() => insertCodeBlockWithOptions({ language: codeLang, runnable: codeRunnable })} className="px-2 py-1 border rounded">Insert code block</button>
//                   <button type="button" onClick={() => runSelectedCode()} className="px-2 py-1 border rounded bg-white flex items-center gap-2"><Play size={14}/> Run</button>
//                   <button type="button" onClick={() => setShowPreview(p => !p)} className="p-2 rounded hover:bg-gray-100"><Eye size={16} /></button>
//                 </div>
//               </div>

//               {/* Editor */}
//               <div className="border rounded overflow-hidden">
//                 <EditorContent editor={editor} onPaste={handlePaste} className="min-h-[320px] p-4" />
//               </div>

//               {/* Preview */}
//               {showPreview && <PreviewPane editorInstance={editor} />}

//               <div className="flex justify-end gap-2 mt-3">
//                 <button type="button" onClick={closeModal} className="px-3 py-1 border rounded">Cancel</button>
//                 <button type="submit" disabled={saving} className="px-3 py-1 bg-indigo-600 text-white rounded">{saving ? "Saving..." : "Save"}</button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}

//       {/* Delete Confirm */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)}></div>
//           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-sm p-6 rounded shadow-lg text-center">
//             <p>Are you sure you want to delete <strong>{toDelete?.title}</strong>?</p>
//             <div className="flex justify-center gap-2 mt-4">
//               <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 border rounded">Cancel</button>
//               <button onClick={confirmDelete} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Snippet Insert Modal */}
//       <SnippetModal open={snippetModalOpen} onClose={() => setSnippetModalOpen(false)} onInsert={insertSnippet} />

//       {/* Code Runner Modal */}
//       <CodeRunnerModal open={runnerOpen} onClose={() => setRunnerOpen(false)} code={runnerCode} language={runnerLang} />
//     </div>
//   );
// }


/* eslint-disable no-unused-vars */
import toast from "react-hot-toast";
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import client from "../../features/auth/api"; // Ensure this path is correct

// // icons
// import {
//   Plus, Edit3, Trash2, X, Loader2, Search, ChevronLeft, ChevronRight,
//   Code as CodeIcon, Bold, Italic, List as ListIcon, ListOrdered as ListOrderedIcon,
//   Youtube as YoutubeIcon, Image as ImageIcon, Table as TableIcon, Link as LinkIcon,
//   RotateCcw, AlignLeft, AlignCenter, AlignRight, Eye, Play, Database, MoveVertical,
//   DownloadCloud, Upload
// } from "lucide-react";

// // tiptap
// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import Placeholder from "@tiptap/extension-placeholder";
// import ImageExt from "@tiptap/extension-image";
// import Youtube from "@tiptap/extension-youtube";
// import TextAlign from "@tiptap/extension-text-align";
// import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableCell } from "@tiptap/extension-table-cell";
// import { TableHeader } from "@tiptap/extension-table-header";
// import Link from "@tiptap/extension-link";
// import Code from "@tiptap/extension-code";
// import { TextStyle } from "@tiptap/extension-text-style";
// import Color from "@tiptap/extension-color";
// import Dropcursor from "@tiptap/extension-dropcursor";
// import Gapcursor from "@tiptap/extension-gapcursor";
// import History from "@tiptap/extension-history";
// import ListItem from "@tiptap/extension-list-item";
// import BulletList from "@tiptap/extension-bullet-list";
// import OrderedList from "@tiptap/extension-ordered-list";
// import CharacterCount from "@tiptap/extension-character-count";
// import Heading from "@tiptap/extension-heading";
// import Highlight from "@tiptap/extension-highlight";
// import Blockquote from "@tiptap/extension-blockquote";
// import TaskList from "@tiptap/extension-task-list";
// import TaskItem from "@tiptap/extension-task-item";
// import DropcursorExtension from "@tiptap/extension-dropcursor";
// import GapcursorExtension from "@tiptap/extension-gapcursor";
// import CodeBlock from "@tiptap/extension-code-block";

// // lowlight/highlight.js languages (for syntax highlighting)
// import { lowlight } from "lowlight/lib/core";
// import jsLang from "highlight.js/lib/languages/javascript";
// import xmlLang from "highlight.js/lib/languages/xml";
// import cssLang from "highlight.js/lib/languages/css";
// import pythonLang from "highlight.js/lib/languages/python";
// import bashLang from "highlight.js/lib/languages/bash";
// import jsonLang from "highlight.js/lib/languages/json";
// import javaLang from "highlight.js/lib/languages/java";
// import "highlight.js/styles/github.css"; // swap to your preferred style

// lowlight.registerLanguage("javascript", jsLang);
// lowlight.registerLanguage("js", jsLang);
// lowlight.registerLanguage("html", xmlLang);
// lowlight.registerLanguage("xml", xmlLang);
// lowlight.registerLanguage("css", cssLang);
// lowlight.registerLanguage("python", pythonLang);
// lowlight.registerLanguage("bash", bashLang);
// lowlight.registerLanguage("json", jsonLang);
// lowlight.registerLanguage("java", javaLang);

// // Constants
// const PAGE_SIZE = 8;
// const CODE_LANGS = ["javascript", "html", "css", "python", "jsx", "tsx", "typescript", "bash", "json", "plaintext"];

// // Upload toggles (adapt to your infra)
// const UPLOAD_WITH_API = true; // when true, POST to /api/uploads/ (example). Set false to fallback to dataURL.

// // Helpers
// function extractTextFromTiptapJSON(node) {
//   if (!node) return "";
//   if (typeof node === "string") return node;
//   if (Array.isArray(node)) return node.map(extractTextFromTiptapJSON).join(" ");
//   if (node.type === "text") return node.text || "";
//   return node.content ? node.content.map(extractTextFromTiptapJSON).join(" ") : "";
// }

// function sanitizeHTML(html) {
//   if (!html) return "";
//   // Basic sanitization: remove script/style tags and inline event handlers.
//   // For production replace with DOMPurify and a strict allowlist.
//   let out = html.replace(/<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, "");
//   // Remove on* attributes
//   out = out.replace(/\son\w+="[^"]*"/gi, "");
//   out = out.replace(/\son\w+='[^']*'/gi, "");
//   return out;
// }

// // Selection-safe setContent helper: only set when different (prevents caret jump)
// function jsonEqual(a, b) {
//   try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
// }

// /* ------------------ CodeRunnerModal ------------------ */
// function CodeRunnerModal({ open, code, language = "javascript", onClose }) {
//   const iframeRef = useRef(null);
//   const [running, setRunning] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     if (iframeRef.current) iframeRef.current.srcdoc = "<!doctype html><html><body></body></html>";
//   }, [open]);

//   const run = () => {
//     setRunning(true);
//     // Simple sandboxed run for JS. For other langs we just display code.
//     if (language === "javascript" || language === "js") {
//       const safeHTML = `
//         <!doctype html><html><head><meta charset="utf-8"/></head><body style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:12px">
//         <pre id="out" style="white-space:pre-wrap;"></pre>
//         <script>
//           try {
//             const result = (function() {
//               ${code}
//             })();
//             if (result !== undefined) document.getElementById('out').textContent = String(result);
//           } catch (e) {
//             document.getElementById('out').textContent = 'Error: '+e;
//           }
//         </script>
//         </body></html>
//       `;
//       iframeRef.current.srcdoc = safeHTML;
//     } else {
//       // just show code for non-js languages
//       const display = `<!doctype html><html><body style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:12px"><pre>${String(code).replace(/</g,'&lt;')}</pre></body></html>`;
//       iframeRef.current.srcdoc = display;
//     }
//     setTimeout(() => setRunning(false), 200);
//   };

//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-4xl bg-white rounded shadow-lg border">
//         <div className="flex items-center justify-between p-3 border-b">
//           <div className="flex items-center gap-3"><Play size={16} /> <strong>Run {language.toUpperCase()}</strong></div>
//           <div className="flex items-center gap-2">
//             <button onClick={run} className="px-3 py-1 bg-indigo-600 text-white rounded">{running ? "Running..." : "Run"}</button>
//             <button onClick={onClose} className="px-3 py-1 border rounded bg-white">Close</button>
//           </div>
//         </div>
//         <div className="grid md:grid-cols-2 gap-2 p-3">
//           <textarea value={code} readOnly className="w-full min-h-[240px] p-3 font-mono bg-gray-50 border rounded" />
//           <div className="border rounded overflow-hidden">
//             <iframe ref={iframeRef} title="runner" className="w-full h-full min-h-[240px] bg-white" />
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// /* ------------------ SnippetModal ------------------ */
// function SnippetModal({ open, onClose, onInsert }) {
//   const [snippets, setSnippets] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setLoading(true);
//     (async () => {
//       try {
//         const res = await client.get("/api/snippets/"); // change endpoint if different
//         setSnippets(res.data || []);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load snippets.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [open]);

//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded shadow-lg p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h4 className="text-lg font-semibold">Insert Snippet</h4>
//           <button onClick={onClose} className="p-1 border rounded bg-white"><X size={16} /></button>
//         </div>
//         <div className="max-h-[60vh] overflow-y-auto">
//           {loading ? <div className="p-4 text-center">Loading...</div> : (
//             <div className="grid gap-2">
//               {snippets.length ? snippets.map(s => (
//                 <div key={s.id} className="p-3 border rounded hover:shadow-sm flex justify-between items-start">
//                   <div>
//                     <div className="font-medium">{s.title || `${s.language?.toUpperCase() || 'SNIPPET'}`}</div>
//                     <div className="text-sm text-gray-600">{s.explanation?.slice(0, 140)}</div>
//                     <pre className="mt-2 p-2 bg-gray-50 rounded text-sm overflow-auto"><code>{s.code}</code></pre>
//                   </div>
//                   <div className="flex flex-col gap-2 ml-3">
//                     <button onClick={() => { onInsert(s); onClose(); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Insert</button>
//                   </div>
//                 </div>
//               )) : <div className="p-4 text-center text-gray-500">No snippets found.</div>}
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// /* ------------------ FloatingSelectionToolbar ------------------ */
// /* Small floating toolbar shown when user selects text */
// function FloatingSelectionToolbar({ editor }) {
//   const ref = useRef(null);
//   const [visible, setVisible] = useState(false);
//   const [coords, setCoords] = useState({ left: 0, top: 0 });

//   useEffect(() => {
//     if (!editor) return;
//     const update = () => {
//       const { state } = editor;
//       const { from, to } = state.selection;
//       if (from === to) {
//         setVisible(false);
//         return;
//       }
//       const selection = window.getSelection();
//       if (!selection || !selection.rangeCount) { setVisible(false); return; }
//       const rect = selection.getRangeAt(0).getBoundingClientRect();
//       // position relative to viewport; we will place absolute fixed in container
//       setCoords({ left: rect.left + rect.width / 2, top: rect.top - 10 });
//       setVisible(true);
//     };

//     editor.on("selectionUpdate", update);
//     editor.on("transaction", update);
//     window.addEventListener("scroll", update, true);
//     return () => {
//       editor.off("selectionUpdate", update);
//       editor.off("transaction", update);
//       window.removeEventListener("scroll", update, true);
//     };
//   }, [editor]);

//   if (!visible) return null;
//   return (
//     <div style={{ position: "fixed", left: coords.left, top: coords.top, transform: "translate(-50%, -100%)", zIndex: 70 }}>
//       <div className="bg-white border rounded shadow-lg px-2 py-1 flex gap-1">
//         <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-1 rounded hover:bg-gray-100" title="Bold"><Bold size={14} /></button>
//         <button onClick={() => editor.chain().focus().toggleItalic().run()} className="p-1 rounded hover:bg-gray-100" title="Italic"><Italic size={14} /></button>
//         <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-1 rounded hover:bg-gray-100" title="Bullet list"><ListIcon size={14} /></button>
//         <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-1 rounded hover:bg-gray-100" title="Numbered list"><ListOrderedIcon size={14} /></button>
//         <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="p-1 rounded hover:bg-gray-100" title="Code block"><CodeIcon size={14} /></button>
//       </div>
//     </div>
//   );
// }

// /* ------------------ Main AdminTopicsFull component ------------------ */
// export default function AdminTopics() {
//   // Data + UI state
//   const [topics, setTopics] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [courseFilter, setCourseFilter] = useState("");
//   const [page, setPage] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [editingTopic, setEditingTopic] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [toDelete, setToDelete] = useState(null);

//   const [meta, setMeta] = useState({
//     title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] },
//   });

//   const [codeLang, setCodeLang] = useState("javascript");
//   const [codeRunnable, setCodeRunnable] = useState(false);
//   const [showPreview, setShowPreview] = useState(true);
//   const [runnerOpen, setRunnerOpen] = useState(false);
//   const [runnerCode, setRunnerCode] = useState("");
//   const [runnerLang, setRunnerLang] = useState("javascript");
//   const [snippetModalOpen, setSnippetModalOpen] = useState(false);
//   const [uploaderBusy, setUploaderBusy] = useState(false);
//   const [autosaveEnabled, setAutosaveEnabled] = useState(true);

//   // Editor refs and selection history
//   const lastAppliedContentRef = useRef(JSON.stringify(meta.content || {}));
//   const selectionRestoreRef = useRef(null);
//   const autosaveTimerRef = useRef(null);

//   // // Tiptap editor setup
//   // const editor = useEditor({
//   //   editable: true,
//   //   extensions: [
//   //     StarterKit.configure({ history: { depth: 300 } }),
//   //     Heading.configure({ levels: [1, 2, 3, 4] }),
//   //     Dropcursor,
//   //     Gapcursor,
//   //     Underline,
//   //     TextStyle,
//   //     Color,
//   //     Highlight,
//   //     Blockquote,
//   //     TaskList,
//   //     TaskItem,
//   //     Placeholder.configure({ placeholder: "Start writing — paste formatted text, add code, tables, media… (try / for commands)" }),
//   //     ImageExt,
//   //     Youtube.configure({ width: 640, height: 360 }),
//   //     Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
//   //     TextAlign.configure({ types: ["heading", "paragraph"] }),
//   //     Code,
//   //     CodeBlockLowlight.configure({ lowlight }),
//   //     Table.configure({ resizable: true }),
//   //     TableRow,
//   //     TableHeader,
//   //     TableCell,
//   //     BulletList,
//   //     OrderedList,
//   //     ListItem,
//   //     CharacterCount.configure({ limit: 200000 }),
//   //     History,
//   //   ],
//   //   content: meta.content,
//   //   editorProps: {
//   //     attributes: {
//   //       class: "prose max-w-none text-gray-900 bg-white min-h-[220px] p-4 sm:p-6 rounded outline-none",
//   //       role: "textbox",
//   //       "aria-multiline": true,
//   //     },
//   //     handlePaste(view, event, slice) {
//   //       // we will intercept paste using onPaste prop on EditorContent
//   //       return false;
//   //     },
//   //   },
//   //   onUpdate: ({ editor }) => {
//   //     // keep meta.content in sync
//   //     setMeta((m) => ({ ...m, content: editor.getJSON() }));
//   //     // schedule autosave
//   //     if (autosaveEnabled) {
//   //       if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
//   //       autosaveTimerRef.current = setTimeout(() => {
//   //         handleAutoSave();
//   //       }, 1800);
//   //     }
//   //   },
//   //   onCreate: ({ editor }) => {
//   //     // allow drop / drag events
//   //   }
//   // });
//   const editor = useEditor({
//     editable: true,
//     extensions: [
//       StarterKit.configure({
//         history: { depth: 300 },
//         codeBlock: false,        // disable default
//         blockquote: true,
//       }),

//       Heading.configure({ levels: [1, 2, 3, 4] }),

//       Underline,
//       TextStyle,
//       Color,
//       Highlight,
//       Blockquote,

//       TaskList,
//       TaskItem.configure({ nested: true }),

//       Placeholder.configure({
//         placeholder:
//           "Start writing — paste formatted text, add code, tables, media… (try / for commands)",
//       }),

//       ImageExt,
//       Youtube.configure({ width: 640, height: 360 }),

//       Link.configure({
//         openOnClick: false,
//         autolink: true,
//         linkOnPaste: true,
//       }),

//       TextAlign.configure({ types: ["heading", "paragraph"] }),

//       Code, // inline code
//       CodeBlockLowlight.configure({ lowlight }), // block code

//       Table.configure({ resizable: true }),
//       TableRow,
//       TableHeader,
//       TableCell,

//       CharacterCount.configure({ limit: 200000 }),

//       Dropcursor,     // ✔️ keep ONLY this one
//       Gapcursor,      // ✔️ keep ONLY this one
//     ],

//     content: meta.content,
//   });


//   /* ------------------ EFFECT: sync editor when meta.content changes (avoid jump) ------------------ */
//   useEffect(() => {
//     if (!editor) return;
//     const incoming = meta.content || { type: "doc", content: [] };
//     const incomingJSON = JSON.stringify(incoming);
//     // only set when different
//     if (incomingJSON === lastAppliedContentRef.current) return;

//     // try to preserve selection (head pos)
//     let prevHead = null;
//     try { prevHead = editor.state.selection.head; } catch { prevHead = null; }

//     try {
//       editor.commands.setContent(incoming, false);
//       // restore selection near previous head
//       if (typeof prevHead === "number") {
//         const docSize = editor.state.doc.content.size;
//         const newHead = Math.min(prevHead, docSize);
//         editor.commands.setTextSelection(newHead);
//       }
//       lastAppliedContentRef.current = incomingJSON;
//     } catch (err) {
//       console.warn("setContent failed, clearing and applying minimal content", err);
//       try {
//         editor.commands.clearContent();
//         editor.commands.setContent(incoming, false);
//         lastAppliedContentRef.current = incomingJSON;
//       } catch (e) {
//         console.error("failed to set content robustly", e);
//       }
//     }
//   }, [editor, meta.content]);

//   /* ------------------ initial fetch ------------------ */
//   useEffect(() => {
//     (async () => {
//       await Promise.all([fetchTopics(), fetchCourses()]);
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function fetchTopics() {
//     setLoading(true);
//     try {
//       const res = await client.get("/api/topics/");
//       setTopics(res.data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load topics.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchCourses() {
//     try {
//       const res = await client.get("/api/courses/");
//       setCourses(res.data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load courses.");
//     }
//   }

//   /* ------------------ filtering + pagination ------------------ */
//   const filtered = useMemo(() => {
//     const q = (searchQuery || "").trim().toLowerCase();
//     let out = [...topics];
//     if (q) {
//       out = out.filter((t) => {
//         const title = (t.title || "").toLowerCase();
//         const desc = (t.description || "").toLowerCase();
//         const courseTitle = (t.course?.title || "").toLowerCase();
//         const contentText = extractTextFromTiptapJSON(t.content || t.content_html || "");
//         return title.includes(q) || desc.includes(q) || courseTitle.includes(q) || contentText.toLowerCase().includes(q);
//       });
//     }
//     if (courseFilter) out = out.filter((t) => String(t.course?.id) === String(courseFilter));
//     return out;
//   }, [topics, searchQuery, courseFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const paginated = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filtered.slice(start, start + PAGE_SIZE);
//   }, [filtered, page]);

//   useEffect(() => setPage(1), [searchQuery, courseFilter]);

//   /* ------------------ Editor utilities ------------------ */

//   const insertCodeBlockWithOptions = ({ language = "javascript", runnable = false, text = "" }) => {
//     if (!editor) return;
//     const sample = text || (language === "html" ? "<!-- html here -->\n" : "// example\n");
//     editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language, runnable }, content: [{ type: "text", text: sample }] }).run();
//     setTimeout(() => editor.chain().focus().run(), 20);
//   };

//   const convertSelectionToCodeBlock = () => {
//     if (!editor) return;
//     const { state } = editor;
//     const { from, to } = state.selection;
//     if (from === to) {
//       toast.error("Select some text to convert.");
//       return;
//     }
//     const selectedText = state.doc.textBetween(from, to, "\n");
//     editor.chain().focus().deleteRange({ from, to }).insertContent({ type: "codeBlock", attrs: { language: codeLang, runnable: codeRunnable }, content: [{ type: "text", text: selectedText }] }).run();
//   };

//   const insertTable = (rows = 2, cols = 3, withHeader = true) => {
//     try {
//       editor.chain().focus().insertTable({ rows, cols, withHeaderRow: withHeader }).run();
//     } catch (err) {
//       console.warn("table insert failed, fallback:", err);
//       toast("Table insertion failed. Try again.");
//     }
//   };

//   const addImageByUrl = async () => {
//     const url = window.prompt("Image URL");
//     if (!url) return;
//     editor.chain().focus().setImage({ src: url }).run();
//   };

//   const addYoutubeByUrl = async () => {
//     const url = window.prompt("YouTube or Vimeo URL");
//     if (!url) return;
//     try {
//       editor.chain().focus().setYoutubeVideo({ src: url }).run();
//     } catch (err) {
//       editor.chain().focus().insertContent(`<p><a href="${url}" target="_blank" rel="noreferrer">${url}</a></p>`).run();
//     }
//   };

//   /* ------------------ Upload helpers (drag-drop & file input) ------------------ */

//   const uploadImageFile = async (file) => {
//     if (!file) return null;
//     if (UPLOAD_WITH_API) {
//       try {
//         setUploaderBusy(true);
//         const fd = new FormData();
//         fd.append("file", file);
//         const res = await client.post("/api/uploads/", fd, { headers: { "Content-Type": "multipart/form-data" } });
//         setUploaderBusy(false);
//         return res.data?.url || res.data?.file || null;
//       } catch (err) {
//         console.error("Upload failed, fallback to dataURL", err);
//         setUploaderBusy(false);
//         // fallback to dataURL
//       }
//     }
//     // fallback to dataURL for preview
//     return await new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result);
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleImageFiles = async (files) => {
//     if (!files || !files.length) return;
//     for (let f of files) {
//       const url = await uploadImageFile(f);
//       if (url) {
//         editor.chain().focus().setImage({ src: url }).run();
//       }
//     }
//   };

//   /* ------------------ Paste handler (attached to EditorContent) ------------------ */
//   const handlePaste = async (event) => {
//     if (!editor) return;
//     const html = event.clipboardData?.getData("text/html");
//     const plain = event.clipboardData?.getData("text/plain");
//     const files = Array.from(event.clipboardData?.files || []);

//     // handle image files from clipboard
//     const imageFiles = files.filter(f => f.type.startsWith("image/"));
//     if (imageFiles.length) {
//       event.preventDefault();
//       await handleImageFiles(imageFiles);
//       return;
//     }

//     // If plain multi-line text and no HTML, insert as code block
//     if (plain && plain.split("\n").length > 1 && !html) {
//       event.preventDefault();
//       editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language: "plaintext", runnable: false }, content: [{ type: "text", text: plain }] }).run();
//       return;
//     }

//     // If HTML exists, sanitize and insert
//     if (html) {
//       event.preventDefault();
//       const cleaned = sanitizeHTML(html);
//       editor.chain().focus().insertContent(cleaned).run();
//     }
//   };

//   /* ------------------ Modal flows & CRUD ------------------ */

//   const openAddModal = () => {
//     setEditingTopic(null);
//     const blank = { title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] } };
//     setMeta(blank);
//     setCodeLang("javascript");
//     setCodeRunnable(false);
//     setTimeout(() => { if (editor) editor.commands.setContent(blank.content, false); }, 120);
//     setShowModal(true);
//   };

//   const openEditModal = (topic) => {
//     setEditingTopic(topic);
//     setMeta({
//       title: topic.title || "",
//       description: topic.description || "",
//       video_url: topic.video_url || "",
//       course: topic.course?.id ? String(topic.course.id) : "",
//       content: topic.content || { type: "doc", content: [] },
//     });
//     setTimeout(() => { if (editor && topic.content) editor.commands.setContent(topic.content, false); }, 160);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditingTopic(null);
//     try { editor?.commands.clearContent(); } catch (e) { /* ignore */ }
//     setMeta({ title: "", description: "", video_url: "", course: "", content: { type: "doc", content: [] } });
//   };

//   const handleMetaChange = (e) => {
//     const { name, value } = e.target;
//     setMeta((m) => ({ ...m, [name]: value }));
//   };

//   const handleSave = async (e) => {
//     e?.preventDefault?.();
//     if (!meta.title?.trim() || !meta.course) {
//       return toast.error("Title and Course are required.");
//     }
//     setSaving(true);

//     // Get JSON + HTML
//     const contentJson = editor?.getJSON() || meta.content || { type: "doc", content: [] };
//     const contentHtml = sanitizeHTML(editor?.getHTML() || "");

//     const payload = {
//       title: meta.title.trim(),
//       description: meta.description || "",
//       video_url: meta.video_url || null,
//       course: parseInt(meta.course, 10),
//       content: contentJson,
//       content_html: contentHtml,
//     };

//     try {
//       if (editingTopic) {
//         await client.put(`/api/topics/${editingTopic.id}/`, payload);
//         toast.success("Topic updated.");
//       } else {
//         await client.post(`/api/topics/`, payload);
//         toast.success("Topic created.");
//       }
//       closeModal();
//       await fetchTopics();
//     } catch (err) {
//       console.error(err.response?.data || err);
//       toast.error("Failed to save. Check console for details.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const promptDelete = (t) => { setToDelete(t); setShowDeleteConfirm(true); };
//   const confirmDelete = async () => {
//     if (!toDelete) return;
//     try {
//       await client.delete(`/api/topics/${toDelete.id}/`);
//       toast.success("Topic deleted.");
//       await fetchTopics();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete.");
//     } finally {
//       setShowDeleteConfirm(false);
//       setToDelete(null);
//     }
//   };

//   const previewFromContent = (c) => {
//     const txt = extractTextFromTiptapJSON(c);
//     return txt.length > 140 ? txt.slice(0, 140) + "…" : txt;
//   };

//   const insertSnippet = (snippet) => {
//     if (!editor || !snippet) return;
//     const lang = snippet.language || "plaintext";
//     insertCodeBlockWithOptions({ language: lang, runnable: snippet.can_run_in_sandbox, text: snippet.code });
//   };

//   // Runner controls
//   const runSelectedCode = () => {
//     if (!editor) return;
//     const { state } = editor;
//     const { from, to } = state.selection;
//     if (from === to) {
//       toast.error("Select code to run first.");
//       return;
//     }
//     const selectedText = state.doc.textBetween(from, to, "\n");
//     setRunnerLang(codeLang || "javascript");
//     setRunnerCode(selectedText);
//     setRunnerOpen(true);
//   };

//   /* ------------------ Autosave (basic) ------------------ */
//   const handleAutoSave = useCallback(async () => {
//     if (!editor) return;
//     // Only attempt autosave when modal is open (editing)
//     if (!showModal) return;
//     const contentJson = editor.getJSON();
//     // avoid autosaving empty
//     try {
//       // This autosave demonstrates a simple debounce saving approach.
//       // Production: add versioning, conflict resolution, and rate limiting.
//       const payload = {
//         title: meta.title || "(draft)",
//         description: meta.description || "",
//         course: meta.course ? parseInt(meta.course, 10) : null,
//         content: contentJson,
//         content_html: sanitizeHTML(editor.getHTML() || ""),
//         autosave: true
//       };
//       // You could post to /api/topics/autosave/ - for demo we'll just console.log
//       // await client.post("/api/topics/autosave/", payload);
//       // console.log("autosave:", payload);
//     } catch (err) {
//       console.warn("autosave failed", err);
//     }
//   }, [editor, meta, showModal]);

//   /* ------------------ Reorder (up/down) ------------------ */
//   const moveTopic = async (topicId, direction = "up") => {
//     setTopics(prev => {
//       const idx = prev.findIndex(t => t.id === topicId);
//       if (idx === -1) return prev;
//       const newIdx = direction === "up" ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1);
//       if (newIdx === idx) return prev;
//       const copy = [...prev];
//       const [item] = copy.splice(idx, 1);
//       copy.splice(newIdx, 0, item);
//       return copy;
//     });
//     // Optionally call API to persist ordering if API supports it
//   };

//   /* ------------------ File picker handlers (drag & drop) ------------------ */
//   const onDrop = async (e) => {
//     e.preventDefault();
//     const dt = e.dataTransfer;
//     const files = Array.from(dt.files || []);
//     await handleImageFiles(files);
//   };
//   const onDragOver = (e) => { e.preventDefault(); };

//   /* ------------------ Utilities for toolbar state ------------------ */
//   const isActive = (format) => editor?.isActive(format);

//   /* ------------------ Component render ------------------ */
//   return (
//     <div className="p-6 bg-gray-50 min-h-screen text-gray-900" onDrop={onDrop} onDragOver={onDragOver}>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold">Topics</h2>
//         <div className="flex gap-2">
//           <button onClick={openAddModal} className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded shadow">
//             <Plus size={16} /> Add Topic
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-2 mb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-3 text-gray-400" size={16} />
//           <input type="text" placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-3 py-2 border rounded w-full" />
//         </div>
//         <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="px-3 py-2 border rounded">
//           <option value="">All Courses</option>
//           {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
//         </select>
//       </div>

//       {/* Topics area (card list) */}
//       <div className="grid gap-3">
//         <div className="hidden md:grid grid-cols-12 gap-2 items-center bg-white p-3 border rounded text-sm font-medium">
//           <div className="col-span-5">Title</div>
//           <div className="col-span-3">Course</div>
//           <div className="col-span-3">Preview</div>
//           <div className="col-span-1 text-right">Actions</div>
//         </div>

//         {loading ? (
//           <div className="p-6 bg-white border rounded text-center">Loading...</div>
//         ) : paginated.length ? paginated.map(topic => (
//           <div key={topic.id} className="bg-white border rounded p-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-start hover:shadow-sm">
//             <div className="md:col-span-5 flex flex-col gap-1">
//               <div className="flex items-start gap-2">
//                 <div className="flex items-center justify-center w-9 h-9 rounded bg-indigo-50 text-indigo-700 font-semibold">
//                   {String(topic.title || "-").slice(0,1).toUpperCase()}
//                 </div>
//                 <div>
//                   <div className="font-semibold">{topic.title}</div>
//                   <div className="text-sm text-gray-500">{topic.description}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="md:col-span-3 text-sm text-gray-600">
//               <div className="font-medium">{topic.course?.title || "-"}</div>
//               <div className="text-xs text-gray-400 mt-1">ID: {topic.id}</div>
//             </div>

//             <div className="md:col-span-3 text-sm text-gray-700">
//               <div className="prose max-w-none line-clamp-4">{previewFromContent(topic.content)}</div>
//             </div>

//             <div className="md:col-span-1 flex items-start justify-end gap-2">
//               <button onClick={() => moveTopic(topic.id, "up")} className="p-1 rounded hover:bg-gray-100" title="Move up"><ChevronLeft size={16} /></button>
//               <button onClick={() => moveTopic(topic.id, "down")} className="p-1 rounded hover:bg-gray-100" title="Move down"><ChevronRight size={16} /></button>

//               <div className="flex flex-col gap-1">
//                 <button onClick={() => openEditModal(topic)} className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"><Edit3 size={16} /></button>
//                 <button onClick={() => promptDelete(topic)} className="p-2 bg-red-100 rounded hover:bg-red-200"><Trash2 size={16} /></button>
//               </div>
//             </div>
//           </div>
//         )) : (
//           <div className="p-6 bg-white border rounded text-center text-gray-500">No topics found.</div>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between items-center mt-4">
//         <div className="text-sm text-gray-600">Page {page} / {totalPages} • {filtered.length} topics</div>
//         <div className="flex gap-1">
//           <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-1 border rounded"><ChevronLeft size={16} /></button>
//           <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-1 border rounded"><ChevronRight size={16} /></button>
//         </div>
//       </div>

//       {/* ---------------- Add/Edit Modal ---------------- */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10">
//           <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
//           <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-6xl p-6 rounded shadow-lg overflow-y-auto max-h-[88vh]">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold">{editingTopic ? "Edit Topic" : "Add Topic"}</h3>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => setSnippetModalOpen(true)} className="px-3 py-1 border rounded bg-white flex items-center gap-2"><Database size={16}/> Insert Snippet</button>
//                 <button onClick={closeModal} className="p-1 border rounded bg-white"><X size={16} /></button>
//               </div>
//             </div>

//             <form onSubmit={handleSave} className="flex flex-col gap-3">
//               <div className="grid md:grid-cols-2 gap-3">
//                 <input type="text" name="title" placeholder="Title" value={meta.title} onChange={handleMetaChange} className="px-3 py-2 border rounded" required />
//                 <select name="course" value={meta.course} onChange={handleMetaChange} className="px-3 py-2 border rounded" required>
//                   <option value="">Select Course</option>
//                   {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
//                 </select>
//                 <input type="text" name="description" placeholder="Short description" value={meta.description} onChange={handleMetaChange} className="px-3 py-2 border rounded md:col-span-2" />
//                 <input type="text" name="video_url" placeholder="Video URL (YouTube/Vimeo)" value={meta.video_url} onChange={handleMetaChange} className="px-3 py-2 border rounded md:col-span-2" />
//               </div>

//               {/* Sticky Editor Toolbar */}
//               <div className="sticky top-0 z-50 bg-white border-b py-2 flex flex-wrap gap-2 items-center">
//                 <div className="flex gap-1 items-center">
//                   <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${isActive('bold') ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`} aria-label="Bold"><Bold size={16} /></button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${isActive('italic') ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`} aria-label="Italic"><Italic size={16} /></button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="p-2 rounded hover:bg-gray-100" aria-label="Underline">U</button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className="p-2 rounded hover:bg-gray-100" aria-label="Strikethrough">S</button>
//                 </div>

//                 <div className="flex gap-1 items-center">
//                   <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-1 border rounded">H1</button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded">H2</button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2 py-1 border rounded">H3</button>
//                 </div>

//                 <div className="flex gap-1 items-center">
//                   <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="p-2 rounded hover:bg-gray-100" title="Bulleted list"><ListIcon size={16}/></button>
//                   <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="p-2 rounded hover:bg-gray-100" title="Numbered list"><ListOrderedIcon size={16}/></button>
//                   <button type="button" onClick={() => insertTable(3,3)} className="p-2 rounded hover:bg-gray-100" title="Insert table"><TableIcon size={16}/></button>
//                   <button type="button" onClick={addImageByUrl} className="p-2 rounded hover:bg-gray-100" title="Insert image by URL"><ImageIcon size={16}/></button>
//                   <label className="p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center gap-2" title="Upload image">
//                     <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageFiles(Array.from(e.target.files || []))} />
//                     <Upload size={16} /> Upload
//                   </label>
//                   <button type="button" onClick={addYoutubeByUrl} className="p-2 rounded hover:bg-gray-100" title="Insert video"><YoutubeIcon size={16}/></button>
//                 </div>

//                 <div className="flex gap-1 items-center ml-auto">
//                   <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="p-1 border rounded">
//                     {CODE_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
//                   </select>
//                   <label className="flex items-center gap-2 px-2 py-1 border rounded cursor-pointer">
//                     <input type="checkbox" checked={codeRunnable} onChange={e => setCodeRunnable(e.target.checked)} /> Runnable
//                   </label>
//                   <button type="button" onClick={convertSelectionToCodeBlock} className="p-2 rounded hover:bg-gray-100" title="Convert selection to code block"><CodeIcon size={16} /></button>
//                   <button type="button" onClick={() => insertCodeBlockWithOptions({ language: codeLang, runnable: codeRunnable })} className="px-2 py-1 border rounded">Insert code block</button>
//                   <button type="button" onClick={() => runSelectedCode()} className="px-2 py-1 border rounded bg-white flex items-center gap-2"><Play size={14}/> Run</button>
//                   <button type="button" onClick={() => setShowPreview(p => !p)} className="p-2 rounded hover:bg-gray-100"><Eye size={16} /></button>
//                 </div>
//               </div>

//               {/* Editor area */}
//               <div className="border rounded overflow-hidden">
//                 <div className="relative">
//                   {/* floating selection toolbar */}
//                   <FloatingSelectionToolbar editor={editor} />
//                   <EditorContent editor={editor} onPaste={handlePaste} className="min-h-[320px] p-4" />
//                 </div>
//               </div>

//               {/* Preview */}
//               {showPreview && <div className="p-3 border rounded bg-white"><div className="font-medium mb-2">Preview</div><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(editor?.getHTML() || "") }} /></div>}

//               <div className="flex justify-between items-center gap-2 mt-3">
//                 <div className="flex gap-2 items-center">
//                   <label className="flex items-center gap-2">
//                     <input type="checkbox" checked={autosaveEnabled} onChange={e => setAutosaveEnabled(e.target.checked)} /> Autosave
//                   </label>
//                 </div>
//                 <div className="flex justify-end gap-2">
//                   <button type="button" onClick={closeModal} className="px-3 py-1 border rounded">Cancel</button>
//                   <button type="submit" disabled={saving} className="px-3 py-1 bg-indigo-600 text-white rounded">{saving ? "Saving..." : "Save"}</button>
//                 </div>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}

//       {/* Delete Confirm */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteConfirm(false)}></div>
//           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-sm p-6 rounded shadow-lg text-center">
//             <p>Are you sure you want to delete <strong>{toDelete?.title}</strong>?</p>
//             <div className="flex justify-center gap-2 mt-4">
//               <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 border rounded">Cancel</button>
//               <button onClick={confirmDelete} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       {/* Snippet Insert Modal */}
//       <SnippetModal open={snippetModalOpen} onClose={() => setSnippetModalOpen(false)} onInsert={insertSnippet} />

//       {/* Code Runner Modal */}
//       <CodeRunnerModal open={runnerOpen} onClose={() => setRunnerOpen(false)} code={runnerCode} language={runnerLang} />
//     </div>
//   );
// }
/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   FiEdit,
//   FiTrash2,
//   FiPlus,
//   FiSave,
//   FiCode,
//   FiBold,
//   FiItalic,
//   FiX,
// } from "react-icons/fi";
// // import toast from "react-hot-toast";
// // import client from "../../features/auth/api"; // <-- your configured axios instance

// /* ==========================================================================
//    Helpers: safe DOM update to avoid blocking main thread
//    ========================================================================== */
// function safeSetInnerHTML(element, html) {
//   if (!element) return;
//   const update = () => {
//     if (element.innerHTML !== html) {
//       element.innerHTML = html || "";
//     }
//   };
//   if (typeof window !== "undefined" && "requestIdleCallback" in window) {
//     window.requestIdleCallback(() => requestAnimationFrame(update), { timeout: 200 });
//   } else {
//     setTimeout(() => requestAnimationFrame(update), 30);
//   }
// }

// /* ==========================================================================
//    SimpleEditor - contentEditable, supports paste (HTML + plain text),
//    commands, code block insertion, and non-blocking setInnerHTML
//    ========================================================================== */
// const SimpleEditor = React.memo(({ content, onChange }) => {
//   const editorRef = useRef(null);

//   // Keep DOM in sync safely (non-blocking)
//   useEffect(() => {
//     if (!editorRef.current) return;
//     // Only update if different to avoid moving cursor unnecessarily
//     if (content !== editorRef.current.innerHTML) {
//       safeSetInnerHTML(editorRef.current, content || "");
//     }
//   }, [content]);

//   // On input -> bubble up HTML
//   const handleInput = useCallback(() => {
//     if (!editorRef.current) return;
//     // Batch update to next frame
//     requestAnimationFrame(() => onChange(editorRef.current.innerHTML));
//   }, [onChange]);

//   // Exec command (bold, italic, heading, lists)
//   const execCmd = useCallback((command, value = null) => {
//     document.execCommand(command, false, value);
//     editorRef.current?.focus();
//   }, []);

//   // Insert a styled code block preserving selected text
//   const insertCode = useCallback(() => {
//     const selection = window.getSelection();
//     const selectedText = selection?.toString() || "code here";
//     const pre = document.createElement("pre");
//     pre.style.cssText =
//       "background:#1e1e1e;color:#fff;padding:1rem;border-radius:8px;margin:1rem 0;overflow-x:auto;font-family:monospace;";
//     pre.textContent = selectedText;

//     if (selection && selection.rangeCount > 0) {
//       const range = selection.getRangeAt(0);
//       range.deleteContents();
//       range.insertNode(pre);
//       // Move caret after inserted node
//       const newRange = document.createRange();
//       newRange.setStartAfter(pre);
//       newRange.collapse(true);
//       selection.removeAllRanges();
//       selection.addRange(newRange);
//       editorRef.current?.focus();
//       // propagate change
//       requestAnimationFrame(() => onChange(editorRef.current.innerHTML));
//     } else {
//       editorRef.current?.appendChild(pre);
//       requestAnimationFrame(() => onChange(editorRef.current.innerHTML));
//     }
//   }, [onChange]);

//   // Handle paste events: support HTML and plain text with newline -> <p>/<br>
//   const handlePaste = useCallback((e) => {
//     e.preventDefault();
//     const clipboard = e.clipboardData || window.clipboardData;
//     if (!clipboard) return;

//     const html = clipboard.getData("text/html");
//     const text = clipboard.getData("text/plain");

//     if (html) {
//       // insert HTML preserving markup
//       document.execCommand("insertHTML", false, html);
//     } else if (text) {
//       // sanitize plain text: convert newlines to <br> (or wrap in <p>)
//       const escaped = text
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;");
//       const withBreaks = escaped.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br />");
//       const wrapped = `<p>${withBreaks}</p>`;
//       document.execCommand("insertHTML", false, wrapped);
//     }

//     // After paste, propagate content
//     requestAnimationFrame(() => onChange(editorRef.current.innerHTML));
//   }, [onChange]);

//   return (
//     <div className="flex flex-col h-full">
//       {/* Toolbar */}
//       <div className="bg-gray-50 dark:bg-gray-900 border-b p-2 flex flex-wrap gap-2">
//         <button
//           onClick={() => execCmd("bold")}
//           className="p-2 bg-white border rounded hover:bg-gray-100"
//           type="button"
//           title="Bold"
//         >
//           <FiBold size={16} />
//         </button>
//         <button
//           onClick={() => execCmd("italic")}
//           className="p-2 bg-white border rounded hover:bg-gray-100"
//           type="button"
//           title="Italic"
//         >
//           <FiItalic size={16} />
//         </button>
//         <div className="w-px h-6 bg-gray-300" />
//         <button
//           onClick={() => execCmd("formatBlock", "h2")}
//           className="px-3 py-1 bg-white border rounded hover:bg-gray-100 font-bold text-sm"
//           type="button"
//           title="Heading 2"
//         >
//           H2
//         </button>
//         <button
//           onClick={() => execCmd("formatBlock", "h3")}
//           className="px-3 py-1 bg-white border rounded hover:bg-gray-100 font-bold text-sm"
//           type="button"
//           title="Heading 3"
//         >
//           H3
//         </button>
//         <button
//           onClick={() => execCmd("insertUnorderedList")}
//           className="px-3 py-1 bg-white border rounded hover:bg-gray-100 text-sm"
//           type="button"
//           title="Bullet List"
//         >
//           • List
//         </button>
//         <button
//           onClick={insertCode}
//           className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//           type="button"
//           title="Code Block"
//         >
//           <FiCode size={16} />
//         </button>
//       </div>

//       {/* Editor */}
//       <div
//         ref={editorRef}
//         contentEditable
//         onInput={handleInput}
//         onPaste={handlePaste}
//         className="flex-1 p-4 overflow-y-auto focus:outline-none bg-white dark:bg-gray-900 prose dark:prose-invert"
//         style={{ minHeight: "300px" }}
//         suppressContentEditableWarning
//       />
//     </div>
//   );
// });

// SimpleEditor.displayName = "SimpleEditor";

// /* ==========================================================================
//    Topic Card (keeps your styles)
//    ========================================================================== */
// const TopicCard = React.memo(({ topic, onEdit, onDelete }) => (
//   <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 hover:shadow-lg transition group relative">
//     <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
//       <button
//         onClick={() => onEdit(topic)}
//         className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
//         type="button"
//       >
//         <FiEdit size={14} />
//       </button>
//       <button
//         onClick={() => onDelete(topic)}
//         className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
//         type="button"
//       >
//         <FiTrash2 size={14} />
//       </button>
//     </div>
//     <div className="text-xs font-bold text-indigo-600 uppercase mb-2">
//       {topic.course_detail?.title || "Course"}
//     </div>
//     <h3 className="text-lg font-bold mb-2 line-clamp-2">{topic.title}</h3>
//     <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
//       {topic.description || "No description"}
//     </p>
//   </div>
// ));
// TopicCard.displayName = "TopicCard";

// /* ==========================================================================
//    Main AdminTopics component (refactored)
//    ========================================================================== */
// export default function AdminTopics() {
//   const [topics, setTopics] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [saving, setSaving] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null);

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [videoUrl, setVideoUrl] = useState("");
//   const [courseId, setCourseId] = useState("");
//   const [editorContent, setEditorContent] = useState("");

//   // Hold an AbortController for fetches so we can cancel if unmounted
//   const fetchControllerRef = useRef(null);

//   /* -----------------------
//      Fetch topics & courses (defer slightly for Render cold starts)
//      ----------------------- */
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     if (fetchControllerRef.current) {
//       try {
//         fetchControllerRef.current.abort();
//       } catch(err) {
//         console.log(err)
//       }
//     }
//     const controller = new AbortController();
//     fetchControllerRef.current = controller;

//     try {
//       const [tRes, cRes] = await Promise.all([
//         client.get("/api/topics/", { signal: controller.signal }),
//         client.get("/api/courses/", { signal: controller.signal }),
//       ]);

//       const topicsData = Array.isArray(tRes.data) ? tRes.data : tRes.data.results || [];
//       const coursesData = Array.isArray(cRes.data) ? cRes.data : cRes.data.results || [];

//       setTopics(topicsData);
//       setCourses(coursesData);
//     } catch (e) {
//       if (e.name !== "CanceledError" && e.name !== "AbortError") {
//         console.error(e);
//         toast.error("Failed to load data");
//       }
//     } finally {
//       setLoading(false);
//       fetchControllerRef.current = null;
//     }
//   }, []);

//   useEffect(() => {
//     // small delay to reduce cold-start blocking
//     const id = setTimeout(() => fetchData(), 120);
//     return () => clearTimeout(id);
//   }, [fetchData]);

//   /* -----------------------
//      Open modal: set fields quickly, then lazily fetch full content_html
//      ----------------------- */
//   const handleOpen = useCallback(
//     async (topic = null) => {
//       setEditing(topic);
//       if (topic) {
//         setTitle(topic.title || "");
//         setDescription(topic.description || "");
//         setVideoUrl(topic.video_url || "");
//         setCourseId(topic.course?.id || topic.course || "");
//         setEditorContent(""); // blank immediately so modal opens fast
//       } else {
//         setTitle("");
//         setDescription("");
//         setVideoUrl("");
//         setCourseId("");
//         setEditorContent("");
//       }

//       setModalOpen(true);

//       // If editing, fetch the heavy content AFTER modal opens (avoid blocking)
//       if (topic) {
//         // allow modal to render first
//         setTimeout(async () => {
//           try {
//             const full = await client.get(`/api/topics/${topic.id}/`);
//             // set content safely
//             setEditorContent(full.data.content_html || "");
//             // (no toast here; user sees content appear)
//           } catch (e) {
//             console.error(e);
//             setEditorContent("");
//           }
//         }, 60);
//       }
//     },
//     []
//   );

//   /* -----------------------
//      Save topic (create or update) with optimistic state update
//      ----------------------- */
//   const handleSubmit = useCallback(async () => {
//     if (!title.trim()) return toast.error("Title required");
//     if (!courseId) return toast.error("Course required");

//     setSaving(true);

//     const payload = {
//       title: title.trim(),
//       description: description.trim(),
//       video_url: videoUrl.trim(),
//       course: courseId,
//       content_html: editorContent,
//     };

//     try {
//       if (editing) {
//         const res = await client.put(`/api/topics/${editing.id}/`, payload);
//         // optimistic update: update only the changed item in list
//         setTopics((prev) => prev.map((t) => (t.id === editing.id ? res.data : t)));
//         toast.success("Topic updated!");
//       } else {
//         const res = await client.post("/api/topics/", payload);
//         // optimistic insert: add new topic to top
//         setTopics((prev) => [res.data, ...prev]);
//         toast.success("Topic created!");
//       }

//       setModalOpen(false);
//       setEditing(null);
//       // reset editor content (optional)
//       setEditorContent("");
//     } catch (e) {
//       console.error(e);
//       toast.error("Save failed");
//     } finally {
//       setSaving(false);
//     }
//   }, [title, description, videoUrl, courseId, editorContent, editing]);

//   /* -----------------------
//      Delete topic (optimistic)
//      ----------------------- */
//   const handleDelete = useCallback(
//     async (topic) => {
//       if (!window.confirm("Delete this topic?")) return;
//       try {
//         await client.delete(`/api/topics/${topic.id}/`);
//         setTopics((prev) => prev.filter((t) => t.id !== topic.id));
//         toast.success("Topic deleted");
//       } catch (e) {
//         console.error(e);
//         toast.error("Delete failed");
//       }
//     },
//     []
//   );

//   /* -----------------------
//      Close modal
//      ----------------------- */
//   const handleCloseModal = useCallback(() => {
//     setModalOpen(false);
//     setEditing(null);
//     setEditorContent("");
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
//       <div className="max-w-6xl mx-auto space-y-4">
//         {/* Header */}
//         <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Topics Manager</h1>
//             <p className="text-sm text-gray-500">Create and manage course topics</p>
//           </div>
//           <button
//             onClick={() => handleOpen()}
//             className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
//             type="button"
//           >
//             <FiPlus /> Add Topic
//           </button>
//         </div>

//         {/* Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {loading ? (
//             <div className="col-span-full text-center py-20">
//               <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
//             </div>
//           ) : topics.length === 0 ? (
//             <div className="col-span-full text-center py-20 text-gray-500">
//               <p>No topics yet. Click "Add Topic" to create one.</p>
//             </div>
//           ) : (
//             topics.map((t) => (
//               <TopicCard key={t.id} topic={t} onEdit={handleOpen} onDelete={handleDelete} />
//             ))
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {modalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
//           <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden shadow-2xl">
//             {/* Header */}
//             <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                 {editing ? "Edit" : "Create"} Topic
//               </h2>
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleCloseModal}
//                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
//                   type="button"
//                   disabled={saving}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed ${
//                     saving ? "pointer-events-none" : ""
//                   }`}
//                   type="button"
//                   disabled={saving}
//                 >
//                   {saving ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <FiSave /> Save
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Body */}
//             <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
//               {/* Editor */}
//               <div className="flex-1 flex flex-col overflow-hidden border-r dark:border-gray-800">
//                 <SimpleEditor content={editorContent} onChange={setEditorContent} />
//               </div>

//               {/* Sidebar */}
//               <div className="w-full lg:w-72 bg-gray-50 dark:bg-gray-800 overflow-y-auto p-4 space-y-4">
//                 <div>
//                   <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">
//                     Title *
//                   </label>
//                   <input
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
//                     placeholder="Topic title"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">
//                     Course *
//                   </label>
//                   <select
//                     value={courseId}
//                     onChange={(e) => setCourseId(e.target.value)}
//                     className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
//                   >
//                     <option value="">Select course</option>
//                     {courses.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.title}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">
//                     Description
//                   </label>
//                   <textarea
//                     rows={3}
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white resize-none"
//                     placeholder="Brief description"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">
//                     Video URL
//                   </label>
//                   <input
//                     type="url"
//                     value={videoUrl}
//                     onChange={(e) => setVideoUrl(e.target.value)}
//                     className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
//                     placeholder="https://youtube.com/..."
//                   />
//                 </div>

//                 <div className="pt-4 border-t dark:border-gray-700">
//                   <p className="text-xs text-gray-500">
//                     Select text and use toolbar to format. Code blocks will be styled automatically.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiVideo, FiLayers } from "react-icons/fi";
// import toast from "react-hot-toast";
// import client from "../../auth/api";
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
        client.get("/api/topics/", { signal: controller.signal }),
        client.get("/api/courses/", { signal: controller.signal }),
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
        const full = await client.get(`/api/topics/${topic.id}/`);
        // Crucial: Set the JSON for BlockNote to initialize
        setEditorJson(full.data.content && full.data.content.length > 0 ? full.data.content : undefined);
        setEditorHtml(full.data.content_html || "");
      } catch (e) {
        toast.error("Failed to load topic content");
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
        const res = await client.put(`/api/topics/${editing.id}/`, payload);
        setTopics((prev) => prev.map((t) => (t.id === editing.id ? res.data : t)));
        toast.success("Topic updated!");
      } else {
        const res = await client.post("/api/topics/", payload);
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
      await client.delete(`/api/topics/${topic.id}/`);
      setTopics((prev) => prev.filter((t) => t.id !== topic.id));
      toast.success("Topic deleted");
    } catch (e) {
      toast.error("Delete failed");
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