/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Play, RefreshCcw, Copy } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext"; // adjust path if needed

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/* ---------------------------
   🔹 Language Icons
--------------------------- */
const LanguageIcon = ({ lang }) => {
  const icons = {
    javascript: "🟨",
    js: "🟨",
    python: "🐍",
    py: "🐍",
    html: "🌐",
    css: "🎨",
    react: "⚛️",
  };
  return <span className="text-lg">{icons[(lang || "").toLowerCase()] || "💡"}</span>;
};

/* ---------------------------
   🔹 Universal Sandbox
   Uses theme to style editor/output for both modes
--------------------------- */
function UniversalCodeSandbox({ language, code }) {
  const { theme } = useTheme();
  const [userCode, setUserCode] = useState(code || "");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef(null);
  const originalCode = useRef(code);

  const isWebLang = ["html", "css", "js", "javascript", "react"].includes(
    (language || "").toLowerCase()
  );

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    try {
      if (isWebLang) {
        const iframe = iframeRef.current;
        const htmlContent = `
          <html>
            <head><style>body{font-family:sans-serif;padding:10px;color:#111}</style></head>
            <body>
              ${language === "html" ? userCode : ""}
              <script>
                try {
                  ${language.includes("js") ? userCode : ""}
                } catch(e) {
                  document.body.innerHTML += '<pre style="color:red;">' + e + '</pre>';
                }
              </script>
            </body>
          </html>`;
        iframe.srcdoc = htmlContent;
      } else {
        const res = await axios.post(`${BASE_URL}/api/run-code/`, {
          language,
          code: userCode,
        });
        setOutput(res.data.output || res.data.error || "No output.");
      }
    } catch (err) {
      setOutput("⚠️ Error running code: " + (err.response?.data?.error || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => setUserCode(originalCode.current);
  const copyCode = async () => {
    await navigator.clipboard.writeText(userCode);
    // Simple toast fallback
    try {
      // If you use a toaster lib it will show up nicer
      alert("✅ Code copied to clipboard!");
    } catch {
      /* noop */
    }
  };

  // theme-aware classes
  const headerBg = theme === "dark" ? "bg-[#0B0B0D] border-gray-800" : "bg-gray-100 border-gray-300";
  const editorBg = theme === "dark" ? "bg-[#111214] text-green-200" : "bg-gray-900 text-green-100"; // editor uses dark background regardless for readability
  const outputBg = theme === "dark" ? "bg-[#0B0B0D] text-green-300" : "bg-black text-green-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`my-8 border rounded-xl overflow-hidden shadow transition-colors duration-300
        ${theme === "dark" ? "border-gray-800 bg-[#0B0B0D]" : "border-gray-200 bg-white"}`}
    >
      {/* Header */}
      <div className={`flex justify-between items-center px-4 py-3 border-b ${headerBg}`}>
        <div className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
          <LanguageIcon lang={language} />
          <span className="font-semibold uppercase text-sm">{(language || "").toUpperCase()}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition"
          >
            <Play size={14} /> {isRunning ? "Running..." : "Run"}
          </button>

          <button
            onClick={resetCode}
            className={`p-2 rounded-md transition ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"}`}
            title="Reset code"
          >
            <RefreshCcw size={15} />
          </button>

          <button
            onClick={copyCode}
            className={`p-2 rounded-md transition ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"}`}
            title="Copy code"
          >
            <Copy size={15} />
          </button>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="grid md:grid-cols-2 gap-3 p-4">
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          spellCheck="false"
          className={`font-mono text-sm border rounded-lg p-3 w-full min-h-[320px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
            ${theme === "dark"
              ? "bg-[#0F1112] text-green-200 border-gray-800"
              : "bg-gray-900 text-green-100 border-gray-700"
            }`}
        />

        <div className={`border rounded-lg overflow-hidden min-h-[320px] ${theme === "dark" ? "border-gray-800" : "border-gray-700"}`}>
          {isWebLang ? (
            <iframe ref={iframeRef} title="sandbox" className={`w-full h-full ${theme === "dark" ? "bg-white/5" : "bg-white"}`} />
          ) : (
            <pre className={`p-3 whitespace-pre-wrap text-sm ${theme === "dark" ? "bg-[#0B0B0D] text-green-300" : "bg-black text-green-400"}`}>
              {output || "Output will appear here after running..."}
            </pre>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------
   🔹 TipTap Renderer (theme-aware)
--------------------------- */
function renderTipTapContent(node, idx) {
  if (!node) return null;
  // We'll import theme inside the render branch to keep renderer pure enough;
  // But to avoid hook rules, better to let caller wrap content rendering in component scope.
  // In this file we will call this function from within TopicDetail where we have theme.
  switch (node.type) {
    case "heading": {
      const Tag = `h${node.attrs?.level || 2}`;
      return (
        <Tag key={idx} className="mt-6 mb-3 font-bold text-2xl">
          {node.content?.map((c, i) => renderTipTapContent(c, i))}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={idx} className="mb-4 leading-relaxed">
          {node.content?.map((c, i) => renderTipTapContent(c, i))}
        </p>
      );
    case "codeBlock": {
      const lang = node.attrs?.language || "javascript";
      const code = node.content?.map((c) => c.text || "").join("") || "";
      return <UniversalCodeSandbox key={idx} language={lang} code={code} />;
    }
    case "text":
      return node.text;
    default:
      if (Array.isArray(node.content)) return node.content.map(renderTipTapContent);
      return null;
  }
}

/* ---------------------------
   🔹 Video Embed Helper
--------------------------- */
const getEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const youtubeRegex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    if (youtubeRegex.test(url)) {
      const id = url.match(youtubeRegex)[1];
      return `https://www.youtube.com/embed/${id}`;
    } else if (vimeoRegex.test(url)) {
      const id = url.match(vimeoRegex)[1];
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch (e) {
    console.warn("Invalid video URL:", url);
  }
  return null;
};

/* ---------------------------
   🔹 Main Component (TopicDetail)
--------------------------- */
export default function TopicDetail() {
  const { slug } = useParams();
  const { theme } = useTheme();

  const [topic, setTopic] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Topic
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/topics/slug/${slug}/`);
        setTopic(res.data);
      } catch (err) {
        console.error("Failed to load topic:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Fetch Recommended Topics
  useEffect(() => {
    if (!topic?.id) return;
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/topics/${topic.id}/recommended/`);
        setRecommended(res.data || []);
      } catch (err) {
        console.error("Failed to load recommended topics:", err);
      }
    })();
  }, [topic]);

  if (loading)
    return (
      <div className={`min-h-screen flex items-center justify-center animate-pulse ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        Loading topic...
      </div>
    );

  if (!topic)
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
        Topic not found.
      </div>
    );

  const contentNodes = topic.content?.content || [];
  const embedUrl = getEmbedUrl(topic.video_url);

  // helper to render nodes with theme-aware class wrappers
  const renderNode = (node, idx) => {
    if (!node) return null;
    switch (node.type) {
      case "heading": {
        const Tag = `h${node.attrs?.level || 2}`;
        return (
          <Tag
            key={idx}
            className={`mt-6 mb-3 font-bold text-2xl ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"}`}
          >
            {node.content?.map((c, i) => renderNode(c, i))}
          </Tag>
        );
      }
      case "paragraph":
        return (
          <p key={idx} className={`${theme === "dark" ? "text-gray-200" : "text-gray-800"} mb-4 leading-relaxed`}>
            {node.content?.map((c, i) => renderNode(c, i))}
          </p>
        );
      case "codeBlock": {
        const lang = node.attrs?.language || "javascript";
        const code = node.content?.map((c) => c.text || "").join("") || "";
        return <UniversalCodeSandbox key={idx} language={lang} code={code} />;
      }
      case "text":
        return node.text;
      default:
        if (Array.isArray(node.content)) return node.content.map(renderNode);
        return null;
    }
  };

  return (
    <div className={`relative flex flex-col lg:flex-row w-full min-h-screen mt-6 transition-colors duration-300
      ${theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* --- Floating Sidebar --- */}
      <aside
        className={`lg:w-80 w-full lg:fixed lg:right-6 lg:top-24 rounded-2xl p-6 h-fit z-20 transition-colors
          ${theme === "dark" ? "bg-[#141416] border border-gray-800 shadow-xl" : "bg-white border border-gray-200 shadow-xl"}`}
      >
        <h3 className={`font-bold text-xl mb-4 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"}`}>
          Recommended Topics
        </h3>

        {recommended.length ? (
          <ul className="space-y-3">
            {recommended.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/topics/${t.slug}`}
                  className={`block p-3 rounded-lg transition
                    ${theme === "dark" ? "hover:bg-[#111213]" : "hover:bg-indigo-50"}`}
                >
                  <p className={`${theme === "dark" ? "font-semibold text-gray-100" : "font-semibold text-gray-800"}`}>
                    {t.title}
                  </p>
                  <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} text-sm line-clamp-2`}>
                    {t.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} text-sm`}>No related topics found.</p>
        )}
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-10 lg:mr-[25rem] px-5 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-4xl md:text-4xl font-extrabold mt-4 mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          {topic.title}
        </motion.h1>

        {topic.description && (
          <p className={`${theme === "dark" ? "text-gray-200" : "text-gray-700"} text-lg mb-6 leading-relaxed`}>
            {topic.description}
          </p>
        )}

        {/* Content */}
        <div className="prose max-w-none">
          {contentNodes.map((node, idx) => renderNode(node, idx))}
        </div>

        {/* Video Section */}
        <div className={`mt-10 border-t pt-8 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
          <h3 className={`font-bold text-2xl mb-4 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"}`}>
            🎥 Watch Lesson Video
          </h3>

          {embedUrl ? (
            <div className="flex justify-center">
              <div className={`aspect-video w-full max-w-2xl rounded-xl overflow-hidden shadow-lg ${theme === "dark" ? "" : ""}`}>
                <iframe
                  src={embedUrl}
                  title="Topic Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <p className={`${theme === "dark" ? "text-gray-400 italic" : "text-gray-500 italic"}`}>
              No video lesson available for this topic yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
