import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  Copy, Check, Video, ArrowLeft, Share2, ArrowUp,
  Clock, BookOpen, AlertCircle, Lightbulb,
  AlertTriangle, XCircle, ChevronLeft, ChevronRight,
  BarChart2, List, Play, VideoOff, Layers,
  ZoomIn, X as XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../auth/api";
import { useTheme } from "../../../context/ThemeContext";

/* ─────────────────────────────────────────────────────────────
   READING PROGRESS BAR
───────────────────────────────────────────────────────────── */
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[100] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400"
      style={{ scaleX }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   TABLE OF CONTENTS
───────────────────────────────────────────────────────────── */
function TableOfContents({ toc, activeId, theme }) {
  const isDark = theme === "dark";
  if (!toc.length) return null;

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? "bg-slate-900/80 border-slate-800/80" : "bg-white/90 border-slate-200/80"} backdrop-blur-sm`}>
      <h4 className={`text-[10px] font-bold mb-4 uppercase tracking-[0.15em] flex items-center gap-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        <List size={11} /> On This Page
      </h4>
      <nav className="space-y-0.5">
        {toc.map(item => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`flex items-start gap-2.5 py-1.5 px-2.5 rounded-xl text-[13px] transition-all duration-200 leading-snug
                ${item.level === 3 ? "ml-3" : item.level === 4 ? "ml-6" : ""}
                ${isActive
                  ? isDark
                    ? "bg-violet-500/15 text-violet-400 font-medium"
                    : "bg-violet-50 text-violet-600 font-medium"
                  : isDark
                    ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              <span className={`mt-[6px] flex-shrink-0 rounded-full transition-all duration-200
                ${item.level === 2 ? "w-1.5 h-1.5" : "w-1 h-1"}
                ${isActive ? "bg-violet-500" : isDark ? "bg-slate-700" : "bg-slate-300"}`}
              />
              <span className="line-clamp-2">{item.text}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BLOCK RENDERERS
───────────────────────────────────────────────────────────── */
function TextBlock({ data, theme }) {
  const isDark = theme === "dark";
  return (
    <div
      className={`leading-[1.9] text-[1.0rem] mb-1
        [&_p]:mb-5 [&_p]:leading-[1.9]
        [&_strong]:font-semibold [&_em]:italic
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2
        [&_li]:leading-relaxed
        [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-violet-400 [&_a]:transition-colors
        [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono
        [&_blockquote]:border-l-[3px] [&_blockquote]:border-violet-500 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:my-6
        ${isDark
          ? "[&_p]:text-slate-300 [&_li]:text-slate-300 [&_strong]:text-white [&_a]:text-violet-400 hover:[&_a]:text-violet-300 [&_code]:bg-slate-800/80 [&_code]:text-pink-400 [&_blockquote]:text-slate-400"
          : "[&_p]:text-slate-600 [&_li]:text-slate-600 [&_strong]:text-slate-900 [&_a]:text-violet-600 hover:[&_a]:text-violet-800 [&_code]:bg-slate-100 [&_code]:text-pink-600 [&_blockquote]:text-slate-500"
        }`}
      dangerouslySetInnerHTML={{ __html: data.html }}
    />
  );
}

function CodeBlock({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(data.code || "");
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  }, [data.code]);

  const monacoLang =
    data.language === "jsx" ? "javascript"
    : data.language === "tsx" ? "typescript"
    : data.language || "plaintext";

  const lineCount = (data.code || "").split("\n").length;
  const editorHeight = Math.min(Math.max(lineCount * 21 + 40, 80), 560);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      viewport={{ once: true }}
      className="my-6 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-gray-800/80"
    >
      <div className="flex items-center justify-between px-5 py-3 bg-[#13151a] border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          {data.filename && (
            <span className="text-xs font-mono text-gray-400 bg-gray-800/80 border border-gray-700 px-2 py-0.5 rounded-md">
              {data.filename}
            </span>
          )}
          {data.language && data.language !== "plaintext" && (
            <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-gray-300">
              {data.language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all duration-200
            ${copied
              ? "bg-green-500/20 border-green-400 text-green-400"
              : "bg-transparent border-slate-400 text-white hover:border-white"
            }`}
        >
          {copied
            ? <><Check size={12} strokeWidth={2.5} /><span>Copied!</span></>
            : <><Copy size={12} strokeWidth={2} /><span>Copy</span></>
          }
        </button>
      </div>
      <div className="bg-[#0d1117]">
        <Editor
          height={`${editorHeight}px`}
          language={monacoLang}
          value={data.code || ""}
          theme="vs-dark"
          options={{
            readOnly: true,
            fontSize: 13.5,
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "none",
            tabSize: 2,
            wordWrap: "on",
            scrollbar: { vertical: "hidden", horizontal: "auto" },
            overviewRulerLanes: 0,
            contextmenu: false,
            automaticLayout: true,
            domReadOnly: true,
            renderValidationDecorations: "off",
            guides: { indentation: true },
          }}
        />
      </div>
    </motion.div>
  );
}

function HeadingBlock({ data, theme, id }) {
  const Tag = `h${data.level || 2}`;
  const isDark = theme === "dark";
  const styles = {
    2: `text-2xl md:text-[1.75rem] font-bold mt-14 mb-5 pb-4 border-b ${isDark ? "text-white border-slate-800/80" : "text-slate-900 border-slate-100"}`,
    3: `text-xl md:text-2xl font-semibold mt-10 mb-4 ${isDark ? "text-white" : "text-slate-900"}`,
    4: `text-lg md:text-xl font-semibold mt-8 mb-3 ${isDark ? "text-slate-100" : "text-slate-800"}`,
  };
  return (
    <Tag id={id} className={`scroll-mt-32 ${styles[data.level] || styles[2]}`}>
      {data.text}
    </Tag>
  );
}

function NoteBlock({ data, theme }) {
  const isDark = theme === "dark";
  const config = {
    info:    { icon: <AlertCircle   size={16} />, label: "Note",    light: "bg-blue-50/80  border-blue-300   text-blue-900",  dark: "bg-blue-950/30  border-blue-700/60  text-blue-200"  },
    tip:     { icon: <Lightbulb    size={16} />, label: "Tip",     light: "bg-emerald-50/80 border-emerald-300 text-emerald-900", dark: "bg-emerald-950/30 border-emerald-700/60 text-emerald-200" },
    warning: { icon: <AlertTriangle size={16} />, label: "Warning", light: "bg-amber-50/80  border-amber-300   text-amber-900", dark: "bg-amber-950/30  border-amber-700/60  text-amber-200" },
    danger:  { icon: <XCircle      size={16} />, label: "Danger",  light: "bg-red-50/80    border-red-300     text-red-900",   dark: "bg-red-950/30   border-red-700/60    text-red-200"   },
  };
  const c = config[data.variant] || config.info;
  const cls = isDark ? c.dark : c.light;
  return (
    <div className={`flex gap-3 my-6 p-4 rounded-2xl border ${cls}`}>
      <span className="mt-0.5 flex-shrink-0 opacity-70">{c.icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5 opacity-50">{c.label}</p>
        <div
          className="text-sm leading-relaxed [&_code]:font-mono [&_code]:text-xs [&_code]:bg-black/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE BLOCK RENDERER  ← THE MISSING PIECE (now added)
───────────────────────────────────────────────────────────── */
function ImageBlockRenderer({ data, theme }) {
  const isDark = theme === "dark";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError]         = useState(false);

  if (!data.url) return null;

  if (imgError) {
    return (
      <div className={`my-6 flex items-center justify-center gap-3 p-6 rounded-2xl border border-dashed text-sm
        ${isDark ? "border-slate-700 text-slate-500 bg-slate-900/40" : "border-slate-200 text-slate-400 bg-slate-50"}`}>
        <AlertTriangle size={16} className="opacity-60" />
        Image could not be loaded.
      </div>
    );
  }

  return (
    <>
      <motion.figure
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="my-8"
      >
        {/* Image container */}
        <div
          className={`group relative rounded-2xl overflow-hidden border cursor-zoom-in
            ${isDark
              ? "border-slate-800/80 bg-slate-900/40 shadow-xl shadow-black/30"
              : "border-slate-200/80 bg-slate-50 shadow-lg shadow-slate-200/60"
            }`}
          onClick={() => setLightboxOpen(true)}
        >
          <img
  src={data.url}
  alt={data.alt || data.caption || "Topic image"}
  onError={() => setImgError(true)}
  className="w-full max-h-[560px] h-auto object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
/>

          {/* Hover zoom hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg
              ${isDark ? "bg-black/60 text-white" : "bg-white/80 text-slate-700"}`}>
              <ZoomIn size={13} />
              Click to enlarge
            </div>
          </div>
        </div>

        {/* Caption */}
        {data.caption && (
          <figcaption className={`mt-3 text-center text-sm leading-relaxed px-4
            ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {data.caption}
          </figcaption>
        )}
      </motion.figure>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-w-[92vw] max-h-[90vh] flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all"
              >
                <XIcon size={16} />
              </button>

              <img
                src={data.url}
                alt={data.alt || data.caption || "Topic image"}
                className="rounded-2xl shadow-2xl object-contain max-w-full max-h-[82vh]"
                style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.7)" }}
              />

              {data.caption && (
                <p className="mt-4 text-center text-sm text-white/60 max-w-lg leading-relaxed">
                  {data.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   RENDER BLOCK SWITCH  — now includes "image"
───────────────────────────────────────────────────────────── */
function RenderBlock({ block, theme, headingId }) {
  if (!block?.type || !block?.data) return null;
  switch (block.type) {
    case "text":    return <TextBlock          data={block.data} theme={theme} />;
    case "code":    return <CodeBlock          data={block.data} />;
    case "heading": return <HeadingBlock       data={block.data} theme={theme} id={headingId} />;
    case "note":    return <NoteBlock          data={block.data} theme={theme} />;
    case "image":   return <ImageBlockRenderer data={block.data} theme={theme} />;   // ← FIXED
    default:        return null;
  }
}

/* ─────────────────────────────────────────────────────────────
   VIDEO SECTION
───────────────────────────────────────────────────────────── */
function VideoSection({ url, theme }) {
  const isDark = theme === "dark";

  const embedUrl = useMemo(() => {
    if (!url) return null;
    const yt = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{10,12})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?title=0&byline=0&portrait=0`;
    return null;
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-6"
    >
      <div
        className={`relative rounded-3xl overflow-hidden border shadow-xl
          ${isDark ? "border-slate-800/60 bg-slate-900/60" : "border-slate-200/80 bg-white/80"}`}
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className={`flex items-center gap-3 px-6 py-4 border-b
          ${isDark ? "border-slate-800/60" : "border-slate-100"}`}>
          <div className={`p-2 rounded-xl ${isDark ? "bg-violet-500/15" : "bg-violet-50"}`}>
            <Video size={15} className="text-violet-500" />
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>Video Tutorial</p>
            <p className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>Watch alongside the reading</p>
          </div>
        </div>

        {embedUrl ? (
          <div className="relative aspect-video bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              title="Video Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        ) : (
          <div className={`aspect-video flex flex-col items-center justify-center gap-5 relative overflow-hidden
            ${isDark ? "bg-slate-900/40" : "bg-slate-50/80"}`}>
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "repeating-linear-gradient(0deg,#888 0,#888 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#888 0,#888 1px,transparent 1px,transparent 40px)" }} />
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                ${isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200 shadow-sm"}`}>
                <VideoOff size={24} className={isDark ? "text-slate-600" : "text-slate-400"} />
              </div>
              <div>
                <p className={`text-base font-semibold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Video not available for this topic
                </p>
                <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  All video tutorials are coming soon, check back shortly!
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border
                ${isDark ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Play size={10} className="fill-current" /> Video's coming soon
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DIFFICULTY BADGE
───────────────────────────────────────────────────────────── */
function DifficultyBadge({ level }) {
  const map = {
    beginner:     { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    intermediate: { cls: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500"   },
    advanced:     { cls: "bg-red-100 text-red-700 border-red-200",             dot: "bg-red-500"     },
  };
  const s = map[level] || map.beginner;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {level}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   COURSE TOPICS PANEL
───────────────────────────────────────────────────────────── */
function CourseTopicsPanel({ siblings, currentSlug, theme, navigate }) {
  const isDark = theme === "dark";

  const nearby = useMemo(() => {
    if (!siblings.length) return [];
    const idx = siblings.findIndex(s => s.slug === currentSlug);
    const start = Math.max(0, Math.min(idx < 0 ? 0 : idx - 2, siblings.length - 5));
    return siblings.slice(start, start + 5);
  }, [siblings, currentSlug]);

  if (!nearby.length) return null;

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? "bg-slate-900/80 border-slate-800/80" : "bg-white/90 border-slate-200/80"} backdrop-blur-sm`}>
      <h4 className={`text-[10px] font-bold mb-4 uppercase tracking-[0.15em] flex items-center gap-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        <BookOpen size={11} /> In This Course
      </h4>
      <div className="space-y-1.5">
        {nearby.map((t, i) => {
          const isCurrent = t.slug === currentSlug;
          return (
            <motion.button
              key={t.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => !isCurrent && navigate(`/topics/${t.slug}`)}
              disabled={isCurrent}
              className={`group w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3
                ${isCurrent
                  ? isDark ? "border-violet-500/30 bg-violet-500/10 cursor-default" : "border-violet-200 bg-violet-50 cursor-default"
                  : isDark ? "border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer" : "border-slate-100 hover:border-violet-100 hover:bg-violet-50/60 cursor-pointer"
                }`}
            >
              <span className={`flex-shrink-0 w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center mt-0.5
                ${isCurrent ? "bg-violet-500 text-white" : isDark ? "bg-slate-800 text-slate-500 border border-slate-700" : "bg-slate-100 text-slate-400"}`}>
                {t.order || i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-[13px] font-medium line-clamp-2 transition-colors leading-snug
                  ${isCurrent ? "text-violet-500" : isDark ? "text-slate-300 group-hover:text-violet-400" : "text-slate-700 group-hover:text-violet-600"}`}>
                  {t.title}
                </p>
                {t.reading_time && (
                  <span className={`text-[11px] flex items-center gap-1 mt-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    <Clock size={10} /> {t.reading_time} min
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PREV / NEXT NAV
───────────────────────────────────────────────────────────── */
function PrevNextNav({ siblings, currentSlug, theme, navigate }) {
  const isDark = theme === "dark";
  const idx  = siblings.findIndex(s => s.slug === currentSlug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  if (!prev && !next) return null;

  const btnBase = `group flex flex-col p-5 rounded-2xl border transition-all duration-200
    ${isDark
      ? "border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
      : "border-slate-200 hover:border-violet-200 hover:bg-violet-50/50 bg-white/60"}`;

  return (
    <div className="mt-10 grid grid-cols-2 gap-4">
      {prev ? (
        <button onClick={() => navigate(`/topics/${prev.slug}`)} className={`${btnBase} items-start`}>
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] mb-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            <ChevronLeft size={12} /> Previous
          </span>
          <span className={`text-sm font-semibold text-left line-clamp-2 group-hover:text-violet-500 transition-colors ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {prev.title}
          </span>
        </button>
      ) : <div />}

      {next ? (
        <button onClick={() => navigate(`/topics/${next.slug}`)} className={`${btnBase} items-end`}>
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] mb-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            Next <ChevronRight size={12} />
          </span>
          <span className={`text-sm font-semibold text-right line-clamp-2 group-hover:text-violet-500 transition-colors ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {next.title}
          </span>
        </button>
      ) : <div />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LEGACY NOTICE
───────────────────────────────────────────────────────────── */
function LegacyNotice({ theme }) {
  const isDark = theme === "dark";
  return (
    <div className={`flex items-start gap-3 p-5 rounded-2xl border ${isDark ? "bg-amber-950/20 border-amber-800/60 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 opacity-70" />
      <div>
        <p className="text-sm font-semibold mb-0.5">Content being updated</p>
        <p className="text-xs opacity-60 leading-relaxed">This topic is being migrated to the new format. Check back soon.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function TopicDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [topic,         setTopic]         = useState(null);
  const [siblings,      setSiblings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeId,      setActiveId]      = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setTopic(null);
    setSiblings([]);

    client.get(`/topics/${slug}/`)
      .then(async res => {
        if (!alive) return;
        const t = res.data;
        setTopic(t);
        if (t.course) {
          try {
            const sr = await client.get(`/topics/?course=${t.course}`);
            const all = sr.data.results || sr.data || [];
            if (alive) setSiblings(all.sort((a, b) => a.order - b.order));
          } catch { /* silent */ }
        }
      })
      .catch(() => { if (alive) toast.error("Failed to load topic"); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    const fn = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const blocks     = Array.isArray(topic?.content) ? topic.content : [];
  const isLegacy   = topic?.content_version === "legacy" || !topic?.content_version;
  const hasContent = blocks.length > 0;

  const headingIdMap = useMemo(() => {
    const map = {};
    let headingCount = 0;
    blocks.forEach((b, i) => {
      if (b.type === "heading" && b.data?.text) {
        map[i] = `heading-${headingCount++}-${b.data.text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")}`;
      }
    });
    return map;
  }, [blocks]);

  const toc = useMemo(() =>
    blocks.reduce((acc, b, i) => {
      if (b.type === "heading" && b.data?.text && headingIdMap[i]) {
        acc.push({ id: headingIdMap[i], text: b.data.text, level: b.data.level || 2 });
      }
      return acc;
    }, []),
  [blocks, headingIdMap]);

  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); }),
      { rootMargin: "0px 0px -60% 0px" }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-5 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-2xl border-2 border-violet-500/20" />
        <div className="absolute inset-0 rounded-2xl border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>Loading topic…</p>
    </div>
  );

  if (!topic) return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-5 px-6 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Topic not found</h2>
      <button
        onClick={() => navigate("/courses")}
        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm shadow-lg transition-all hover:scale-105"
      >
        Back to Courses
      </button>
    </div>
  );

  const courseProgress = siblings.length > 1 ? (() => {
    const idx = siblings.findIndex(s => s.slug === slug);
    return { idx, pct: idx >= 0 ? Math.round(((idx + 1) / siblings.length) * 100) : 0 };
  })() : null;

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0b0f]" : "bg-[#f6f7fb]"}`}>
      <ReadingProgress />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className={`border-b ${isDark ? "bg-[#0e0f14] border-slate-800/60" : "bg-white border-slate-200/80"}`}>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10">

          {/* Back link */}
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(topic.course_info?.slug ? `/courses/${topic.course_info.slug}` : "/courses")}
            className={`inline-flex items-center gap-2 text-[13px] mb-8 transition-colors font-medium group
              ${isDark ? "text-slate-600 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200 group-hover:scale-95
              ${isDark ? "border-slate-800 bg-slate-900 group-hover:border-slate-700" : "border-slate-200 bg-white group-hover:border-slate-300"}`}>
              <ArrowLeft size={13} />
            </span>
            {topic.course_info?.title || "Back to Course"}
          </motion.button>

          {/* Course label */}
          {topic.course_info?.title && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <span className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full border
                ${isDark ? "bg-violet-500/10 border-violet-500/25 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Layers size={10} />
                {topic.course_info.title}
              </span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight mb-4 max-w-5xl
              ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {topic.title}
          </motion.h1>

          {topic.description && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className={`text-[1.0625rem] leading-relaxed mb-7 max-w-3xl ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {topic.description}
            </motion.p>
          )}

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-2.5"
          >
            {topic.difficulty && <DifficultyBadge level={topic.difficulty} />}

            {topic.reading_time && (
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border
                ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                <Clock size={11} /> {topic.reading_time} min read
              </span>
            )}

            {topic.code_languages?.length > 0 && topic.code_languages.map(lang => (
              <span key={lang} className={`inline-flex items-center text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border
                ${isDark ? "bg-slate-800/80 border-slate-700 text-violet-400" : "bg-violet-50 border-violet-100 text-violet-600"}`}>
                {lang}
              </span>
            ))}

            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
              className={`ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all
                ${isDark ? "border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 bg-slate-900/50" : "border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 bg-white/80"}`}
            >
              <Share2 size={11} /> Share
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10">
        <div className="flex gap-8 items-start">

          {/* ── Article ───────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`rounded-3xl border p-6 md:p-8 shadow-sm
                ${isDark
                  ? "bg-[#0e0f14]/80 border-slate-800/60"
                  : "bg-white/90 border-slate-200/70"}`}
              style={{ backdropFilter: "blur(4px)" }}
            >
              {isLegacy && !hasContent && <LegacyNotice theme={theme} />}

              {hasContent
                ? blocks.map((block, i) => (
                    <motion.div
                      key={block.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
                      viewport={{ once: true }}
                      className={i === 0 ? "[&_h2]:mt-0 [&_h3]:mt-0 [&_h4]:mt-0 [&_p:first-child]:mt-0" : ""}
                    >
                      <RenderBlock block={block} theme={theme} headingId={headingIdMap[i]} />
                    </motion.div>
                  ))
                : !isLegacy && (
                    <p className={`italic text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                      No content yet.
                    </p>
                  )
              }
            </motion.article>

            <VideoSection url={topic.video_url} theme={theme} />
            <PrevNextNav siblings={siblings} currentSlug={slug} theme={theme} navigate={navigate} />
          </main>

          {/* ── Right sidebar ─────────────────────────────────── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto
              [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.700)_transparent]">

              {courseProgress && (
                <div className={`rounded-2xl border p-5 ${isDark ? "bg-slate-900/80 border-slate-800/80" : "bg-white/90 border-slate-200/80"} backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <BarChart2 size={11} /> Progress
                    </h4>
                    <span className="text-xs font-bold text-violet-500">{courseProgress.pct}%</span>
                  </div>
                  <div className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${courseProgress.pct}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    />
                  </div>
                  <p className={`text-[11px] mt-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {courseProgress.idx + 1} of {siblings.length} topics
                  </p>
                </div>
              )}

              <TableOfContents toc={toc} activeId={activeId} theme={theme} />
              <CourseTopicsPanel siblings={siblings} currentSlug={slug} theme={theme} navigate={navigate} />
            </div>
          </aside>
        </div>
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed right-7 bottom-7 z-50 p-3.5 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95
              ${isDark
                ? "bg-slate-900 text-white border border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-lg"}`}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}