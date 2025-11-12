/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Play, RefreshCcw, Copy } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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
   🔹 Universal Sandbox (refined UI)
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
                try { ${language.includes("js") ? userCode : ""} }
                catch(e){document.body.innerHTML += '<pre style="color:red;">'+e+'</pre>';}
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
    alert("Code copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`my-10 border rounded-2xl overflow-hidden shadow-md transition-colors duration-300 ${theme === "dark"
          ? "border-gray-800 bg-[#0B0B0D]/70 backdrop-blur-lg"
          : "border-gray-200 bg-white"
        }`}
    >
      <div
        className={`flex justify-between items-center px-4 py-3 border-b ${theme === "dark" ? "border-gray-800 text-gray-300" : "border-gray-200 text-gray-700"
          }`}
      >
        <div className="flex items-center gap-2">
          <LanguageIcon lang={language} />
          <span className="font-semibold uppercase text-sm">{language?.toUpperCase()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition"
          >
            <Play size={14} /> {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={resetCode}
            title="Reset"
            className="p-2 rounded-md hover:bg-indigo-100 dark:hover:bg-gray-800 transition"
          >
            <RefreshCcw size={15} />
          </button>
          <button
            onClick={copyCode}
            title="Copy"
            className="p-2 rounded-md hover:bg-indigo-100 dark:hover:bg-gray-800 transition"
          >
            <Copy size={15} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 p-4">
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          spellCheck="false"
          className={`font-mono text-sm border rounded-lg p-3 w-full min-h-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
            ${theme === "dark"
              ? "bg-[#0F1112] text-green-200 border-gray-800"
              : "bg-gray-900 text-green-100 border-gray-700"
            }`}
        />

        <div
          className={`border rounded-lg overflow-hidden min-h-80 ${theme === "dark" ? "border-gray-800" : "border-gray-700"
            }`}
        >
          {isWebLang ? (
            <iframe
              ref={iframeRef}
              title="sandbox"
              className="w-full h-full bg-white dark:bg-gray-900"
            />
          ) : (
            <pre
              className={`p-3 whitespace-pre-wrap text-sm ${theme === "dark" ? "bg-[#0B0B0D] text-green-300" : "bg-black text-green-400"
                }`}
            >
              {output || "Output will appear here after running..."}
            </pre>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Embed Helper

const getEmbedUrl = (url) => {
  if (!url) return null;
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const vm = /vimeo\.com\/(\d+)/;
  if (yt.test(url)) return `https://www.youtube.com/embed/${url.match(yt)[1]}`;
  if (vm.test(url)) return `https://player.vimeo.com/video/${url.match(vm)[1]}`;
  return null;
};

//  Main Topic Detail

export default function TopicDetail() {
  const { slug } = useParams();
  const { theme } = useTheme();
  const [topic, setTopic] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!topic?.id) return;
    setSummarizing(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/topics/${topic.id}/summarize/`);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setSummary("⚠️ Failed to generate summary.");
    } finally {
      setSummarizing(false);
    }
  };


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
      <div className="flex justify-center items-center min-h-screen text-gray-500 animate-pulse">
        Loading topic...
      </div>
    );

  if (!topic)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Topic not found.
      </div>
    );

  const embedUrl = getEmbedUrl(topic.video_url);
  const contentNodes = topic.content?.content || [];

  return (
    <div
      className={`relative flex flex-col lg:flex-row w-full min-h-screen mt-6 transition-colors duration-300 ${theme === "dark"
          ? "bg-[#0A0A0C] text-gray-100"
          : "bg-gray-50 text-gray-900"
        }`}
    >
      {/* --- Sidebar --- */}
      <aside
        className={`lg:w-80 w-full lg:fixed lg:right-8 lg:top-28 rounded-2xl p-6 z-20 backdrop-blur-lg ${theme === "dark"
            ? "bg-[#141416]/70 border border-gray-800 shadow-2xl"
            : "bg-white border border-gray-200 shadow-xl"
          }`}
      >
        <h3
          className={`font-semibold text-lg mb-4 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"
            }`}
        >
          Recommended Topics
        </h3>
        {recommended.length ? (
          <ul className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {recommended.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/topics/${t.slug}`}
                  className={`block p-3 rounded-lg transition ${theme === "dark" ? "hover:bg-[#111213]" : "hover:bg-indigo-50"
                    }`}
                >
                  <p className="font-semibold truncate">{t.title}</p>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                      } line-clamp-2`}
                  >
                    {t.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No related topics yet.</p>
        )}
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-10 px-5 py-10 lg:pr-100">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold mb-4"
        >
          {topic.title}
        </motion.h1>

        <p className="text-lg opacity-90 mb-8 leading-relaxed">{topic.description}</p>
        

        <article className="prose max-w-none prose-headings:font-semibold dark:prose-invert">
          {contentNodes.map((node, idx) => {
            if (node.type === "codeBlock") {
              const lang = node.attrs?.language || "javascript";
              const code = node.content?.map((c) => c.text || "").join("") || "";
              return <UniversalCodeSandbox key={idx} language={lang} code={code} />;
            }
            if (node.type === "heading") {
              const Tag = `h${node.attrs?.level || 2}`;
              return <Tag key={idx}>{node.content?.map((c, i) => c.text || "")}</Tag>;
            }
            if (node.type === "paragraph")
              return <p key={idx}>{node.content?.map((c) => c.text || "")}</p>;
            return null;
          })}
        </article>

        {/* --- Video Section --- */}
        <section
          className={`mt-14 border-t pt-8 ${theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
        >
          <h3
            className={`font-bold text-2xl mb-4 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"
              }`}
          >
            🎥 Watch Lesson Video
          </h3>
          {embedUrl ? (
            <div className="relative rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-xl group">
              <iframe
                src={embedUrl}
                title="Lesson Video"
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="italic text-gray-500">No video available for this topic yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
