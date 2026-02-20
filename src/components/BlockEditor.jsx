import React, { useState, useCallback, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Plus,
  Trash2,
  GripVertical,
  Code2,
  Type,
  Heading,
  AlertCircle,
  ChevronDown,
  Copy,
  Check,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import client from "../features/auth/api";

const LANGUAGES = [
  "javascript", "typescript", "jsx", "tsx",
  "python", "html", "css", "scss",
  "bash", "json", "sql", "yaml",
  "java", "csharp", "php", "go",
  "rust", "kotlin", "swift", "markdown", "plaintext",
];

const NOTE_VARIANTS = [
  { value: "info",    label: "ℹ Info",    bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-800"   },
  { value: "tip",     label: "💡 Tip",    bg: "bg-green-50",  border: "border-green-300",  text: "text-green-800"  },
  { value: "warning", label: "⚠ Warning", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-800" },
  { value: "danger",  label: "🚫 Danger", bg: "bg-red-50",    border: "border-red-300",    text: "text-red-800"    },
];

const HEADING_LEVELS = [2, 3, 4];

// ─── Block Factories ─────────────────────────────────────────────────────────

function makeTextBlock()    { return { id: uuidv4(), type: "text",    data: { html: "" } }; }
function makeCodeBlock()    { return { id: uuidv4(), type: "code",    data: { language: "javascript", code: "", filename: "" } }; }
function makeHeadingBlock() { return { id: uuidv4(), type: "heading", data: { level: 2, text: "" } }; }
function makeNoteBlock()    { return { id: uuidv4(), type: "note",    data: { variant: "info", html: "" } }; }
function makeImageBlock()   { return { id: uuidv4(), type: "image",   data: { url: "", caption: "", alt: "" } }; }

// ─── Image Upload Helper ─────────────────────────────────────────────────────

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await client.post("/topics/upload-image/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // Handle both {url: ...} and {secure_url: ...} response shapes
  return res.data.url || res.data.secure_url;
}

// ─── Add Block Menu ──────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { label: "Text",    icon: <Type      size={15} />, factory: makeTextBlock    },
    { label: "Code",    icon: <Code2     size={15} />, factory: makeCodeBlock    },
    { label: "Heading", icon: <Heading   size={15} />, factory: makeHeadingBlock },
    { label: "Note",    icon: <AlertCircle size={15}/>, factory: makeNoteBlock  },
    { label: "Image",   icon: <ImageIcon size={15} />, factory: makeImageBlock   },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
      >
        <Plus size={14} />
        Add Block
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
          {options.map(({ label, icon, factory }) => (
            <button
              key={label}
              onClick={() => { onAdd(factory()); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-500">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Text Block ──────────────────────────────────────────────────────────────

function TextBlock({ block, onChange }) {
  return (
    <div className="p-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
        Text / HTML
      </label>
      <textarea
        value={block.data.html}
        onChange={(e) => onChange({ ...block, data: { ...block.data, html: e.target.value } })}
        rows={6}
        placeholder="<p>Write your explanation here. You can use HTML tags like <strong>, <em>, <code>, <a href='...'>, <ul><li>...</li></ul></p>"
        className="w-full px-3 py-2.5 text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y leading-relaxed text-gray-800 placeholder-gray-400"
      />
      <p className="text-[10px] text-gray-400 mt-1">
        Supports HTML: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;code&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
      </p>
    </div>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────

function CodeBlock({ block, onChange }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.data.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateData = (key, val) =>
    onChange({ ...block, data: { ...block.data, [key]: val } });

  return (
    <div>
      <div className="flex items-center gap-3 px-3 py-2 bg-gray-900 rounded-t-lg border-b border-gray-700">
        <select
          value={block.data.language}
          onChange={(e) => updateData("language", e.target.value)}
          className="text-xs bg-gray-800 text-gray-200 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <input
          type="text"
          value={block.data.filename || ""}
          onChange={(e) => updateData("filename", e.target.value)}
          placeholder="filename (optional)"
          className="flex-1 text-xs bg-gray-800 text-gray-300 border border-gray-600 rounded px-2 py-1 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="rounded-b-lg overflow-hidden border border-t-0 border-gray-700">
        <Editor
          height="280px"
          language={
            block.data.language === "jsx" ? "javascript"
            : block.data.language === "tsx" ? "typescript"
            : block.data.language
          }
          value={block.data.code}
          onChange={(val) => updateData("code", val || "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            roundedSelection: false,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "gutter",
            tabSize: 2,
            wordWrap: "on",
            scrollbar: { vertical: "hidden", horizontal: "auto" },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            contextmenu: true,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

// ─── Heading Block ───────────────────────────────────────────────────────────

function HeadingBlock({ block, onChange }) {
  const level = block.data.level || 2;
  const textClass =
    level === 2 ? "text-2xl font-bold"
    : level === 3 ? "text-xl font-semibold"
    : "text-lg font-semibold";

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Heading
        </label>
        <div className="flex gap-1">
          {HEADING_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onChange({ ...block, data: { ...block.data, level: lvl } })}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                level === lvl
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              H{lvl}
            </button>
          ))}
        </div>
      </div>
      <input
        type="text"
        value={block.data.text}
        onChange={(e) => onChange({ ...block, data: { ...block.data, text: e.target.value } })}
        placeholder={`Heading ${level} text...`}
        className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 ${textClass}`}
      />
    </div>
  );
}

// ─── Note Block ──────────────────────────────────────────────────────────────

function NoteBlock({ block, onChange }) {
  const variant = NOTE_VARIANTS.find((v) => v.value === block.data.variant) || NOTE_VARIANTS[0];

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Callout / Note
        </label>
        <div className="flex gap-1 flex-wrap">
          {NOTE_VARIANTS.map((v) => (
            <button
              key={v.value}
              onClick={() => onChange({ ...block, data: { ...block.data, variant: v.value } })}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-all ${
                block.data.variant === v.value
                  ? `${v.bg} ${v.border} ${v.text}`
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className={`rounded-lg border-l-4 ${variant.bg} ${variant.border} p-3`}>
        <textarea
          value={block.data.html}
          onChange={(e) => onChange({ ...block, data: { ...block.data, html: e.target.value } })}
          rows={3}
          placeholder={`<p>${variant.label} content here...</p>`}
          className={`w-full text-sm font-mono bg-transparent outline-none resize-y ${variant.text} placeholder-opacity-50`}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Supports HTML inside the callout.</p>
    </div>
  );
}

// ─── Image Block (Editor) ─────────────────────────────────────────────────────
// This is the EDITOR version – handles upload, preview, caption/alt inputs.

function ImageBlock({ block, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef(null);

  const updateData = (key, val) =>
    onChange({ ...block, data: { ...block.data, [key]: val } });

  async function processFile(file) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (!url) throw new Error("No URL returned from server");
      onChange({
        ...block,
        data: {
          ...block.data,
          url,
          alt: block.data.alt || file.name.replace(/\.[^.]+$/, ""),
        },
      });
      toast.success("Image uploaded!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleRemove() {
    onChange({ ...block, data: { ...block.data, url: "", caption: "", alt: "" } });
  }

  return (
    <div className="p-3 space-y-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Image
      </label>

      {block.data.url ? (
        /* ── Preview ── */
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={block.data.url}
            alt={block.data.alt || "uploaded image"}
            className="w-full max-h-80 object-contain"
            style={{
              background:
                "repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 0 0 / 16px 16px",
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-semibold text-gray-700 shadow transition-all"
            >
              <Upload size={12} /> Replace
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 hover:bg-red-500 rounded-lg text-xs font-semibold text-white shadow transition-all"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 py-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-blue-500" />
              <p className="text-sm font-semibold text-blue-600">Uploading…</p>
            </>
          ) : (
            <>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors ${
                  dragOver ? "border-blue-300 bg-blue-100" : "border-gray-200 bg-white"
                }`}
              >
                <ImageIcon size={22} className={dragOver ? "text-blue-500" : "text-gray-400"} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">
                  {dragOver ? "Drop to upload" : "Click or drag & drop"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WebP, GIF · max 10 MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Caption & alt — always shown so you can pre-fill before uploading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Caption{" "}
            <span className="normal-case font-normal text-gray-400">(shown below image)</span>
          </label>
          <input
            type="text"
            value={block.data.caption || ""}
            onChange={(e) => updateData("caption", e.target.value)}
            placeholder="e.g. React component lifecycle diagram"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Alt text{" "}
            <span className="normal-case font-normal text-gray-400">(accessibility)</span>
          </label>
          <input
            type="text"
            value={block.data.alt || ""}
            onChange={(e) => updateData("alt", e.target.value)}
            placeholder="Describe the image for screen readers"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}

// ─── Single Block Wrapper ─────────────────────────────────────────────────────

function BlockWrapper({ block, index, total, onChange, onDelete, onMove }) {
  const LABELS = {
    text: "Text", code: "Code", heading: "Heading",
    note: "Note / Callout", image: "Image",
  };
  const COLORS = {
    text: "bg-indigo-500", code: "bg-emerald-500",
    heading: "bg-purple-500", note: "bg-amber-500", image: "bg-pink-500",
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-0.5 w-full ${COLORS[block.type] || "bg-gray-300"}`} />

      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-gray-300 cursor-grab" />
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${
              COLORS[block.type]
            }`}
          >
            {LABELS[block.type]}
          </span>
          <span className="text-[10px] text-gray-400">Block {index + 1}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-200 rounded transition-all"
            title="Move up"
          >
            <MoveUp size={13} />
          </button>
          <button
            onClick={() => onMove(index, "down")}
            disabled={index === total - 1}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-200 rounded transition-all"
            title="Move down"
          >
            <MoveDown size={13} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
            title="Delete block"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {block.type === "text"    && <TextBlock    block={block} onChange={onChange} />}
      {block.type === "code"    && <CodeBlock    block={block} onChange={onChange} />}
      {block.type === "heading" && <HeadingBlock block={block} onChange={onChange} />}
      {block.type === "note"    && <NoteBlock    block={block} onChange={onChange} />}
      {block.type === "image"   && <ImageBlock   block={block} onChange={onChange} />}
    </div>
  );
}

// ─── Main BlockEditor ─────────────────────────────────────────────────────────

export default function BlockEditor({ initialContent, onChange }) {
  const [blocks, setBlocks] = useState(() => {
    if (Array.isArray(initialContent) && initialContent.length > 0 && initialContent[0]?.type) {
      return initialContent;
    }
    return [];
  });

  useEffect(() => {
    onChange?.({ blocks });
  }, [blocks]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateBlock = useCallback((updated) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const deleteBlock = useCallback((id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addBlock = useCallback((block) => {
    setBlocks((prev) => [...prev, block]);
  }, []);

  const moveBlock = useCallback((index, direction) => {
    setBlocks((prev) => {
      const arr = [...prev];
      const swapIdx = direction === "up" ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
      return arr;
    });
  }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 p-4 space-y-3">
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Plus size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">No blocks yet</p>
            <p className="text-xs text-gray-400 max-w-[260px]">
              Click "Add Block" below to start building your topic. Mix text, code, images and more.
            </p>
          </div>
        )}

        {blocks.map((block, index) => (
          <BlockWrapper
            key={block.id}
            block={block}
            index={index}
            total={blocks.length}
            onChange={updateBlock}
            onDelete={deleteBlock}
            onMove={moveBlock}
          />
        ))}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <AddBlockMenu onAdd={addBlock} />
        <span className="text-[11px] text-gray-400">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}