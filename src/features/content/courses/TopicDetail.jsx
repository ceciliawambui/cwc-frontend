/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUp, Copy, Divide } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import toast from "react-hot-toast";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import cssLang from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import jsonLang from "highlight.js/lib/languages/json";
import ReactMarkdown from "react-markdown";

import "highlight.js/styles/github.css";               
import "highlight.js/styles/github-dark-dimmed.css";  

javascript && hljs.registerLanguage("javascript", javascript);
xml && hljs.registerLanguage("xml", xml);
cssLang && hljs.registerLanguage("css", cssLang);
python && hljs.registerLanguage("python", python);
bash && hljs.registerLanguage("bash", bash);
jsonLang && hljs.registerLanguage("json", jsonLang);

const BASE_URL = import.meta.env.VITE_API_BASE_URL


function CodeBlock({ language = "plaintext", code = "", theme }) {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) hljs.highlightElement(codeRef.current);
  }, [code, language, theme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied");
    } catch {
      toast.error("Unable to copy");
    }
  };

  const containerClass =
    theme === "dark"
      ? "bg-[#0d1117] border border-gray-800 text-gray-200"
      : "bg-gray-50 border border-gray-200 text-gray-900";

  return (
    <div className={`relative my-6 rounded-lg overflow-hidden ${containerClass}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/30">
        <span className="text-xs font-medium">{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:opacity-80"
        >
          <Copy size={14} /> Copy
        </button>
      </div>

      <pre className="p-4 overflow-auto text-sm">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

// MAIN TOPIC DETAIL PAGE
export default function TopicDetail() {
  const { slug } = useParams();
  const { theme } = useTheme();

  const [topic, setTopic] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [toc, setToc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTop, setShowTop] = useState(false);
  const [summary, setSummary] = useState("");
  const [summLoading, setSummLoading] = useState(false);

  // FETCH TOPIC
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/topics/slug/${slug}/`);
        if (!mounted) return;

        setTopic(res.data || null);

        // Build table of contents from TipTap JSON
        const headings = [];
        const extractHeadings = (nodes) => {
          if (!nodes) return;
          nodes.forEach((n) => {
            if (n?.type === "heading") {
              const text = (n.content || []).map((c) => c.text || "").join("");
              const level = n.attrs?.level || 2;
              const id =
                n.attrs?.id ||
                `${level}-${text
                  .slice(0, 12)
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`;

              headings.push({ level, text, id });
            }
            extractHeadings(n.content);
          });
        };

        extractHeadings(res.data.content?.content || []);
        setToc(headings);
      } catch (err) {
        console.error(err);
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  //  fetch recommended topics

  useEffect(() => {
    if (topic?.id) {
      axios
        .get(`${BASE_URL}/topics/${topic.id}/ai-recommended/`)
        .then((res) => setRecommended(res.data))
        .catch(() => setRecommended([]));
    }
  }, [topic]);

  const handleSummarize = async () => {
    if (!topic?.content) return;

    try {
      setSummLoading(true);
      setSummary("");

      const res = await axios.post(`${BASE_URL}/api/ai/summarize/`, {
        title: topic.title,
        content: topic.content,
      });

      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      toast.error("Unable to summarize right now");
    } finally {
      setSummLoading(false);
    }
  };

  // BACK TO TOP BUTTON LOGIC
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">
        Loading topic…
      </div>
    );

  if (!topic)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Topic not found.
      </div>
    );

  // RENDER TIPTAP NODES
  const renderNode = (node, key) => {
    if (!node) return null;

    if (node.type === "heading") {
      const level = node.attrs?.level || 2;
      const Tag = `h${level}`;
      const text = (node.content || []).map((c) => c.text || "").join("");
      const id =
        node.attrs?.id ||
        `${level}-${text.slice(0, 12).replace(/\s+/g, "-").toLowerCase()}`;

      return (
        <Tag
          key={key}
          id={id}
          className="mt-8 mb-3 font-semibold"
          style={{ color: theme === "dark" ? "#e6e6e6" : undefined }}
        >
          {text}
        </Tag>
      );
    }

    if (node.type === "paragraph") {
      return (
        <p
          key={key}
          className="mb-4 leading-relaxed"
          style={{ color: theme === "dark" ? "#d1d1d1" : undefined }}
        >
          {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
        </p>
      );
    }

    if (node.type === "text") {
      return (
        <span key={key} style={{ color: theme === "dark" ? "#d1d1d1" : undefined }}>
          {node.text}
        </span>
      );
    }

    if (node.type === "codeBlock") {
      const language = node.attrs?.language || "plaintext";
      const codeText = (node.content || [])
        .map((c) => c.text || "")
        .join("\n");

      return (
        <CodeBlock key={key} language={language} code={codeText} theme={theme} />
      );
    }

    if (node.type === "image") {
      return (
        <img
          key={key}
          src={node.attrs?.src}
          alt={node.attrs?.alt || ""}
          className="my-4 max-w-full rounded"
        />
      );
    }

    return (
      <div key={key}>
        {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
      </div>
    );
  };

  const contentNodes = topic.content?.content || [];

  const textColorClass = theme === "dark" ? "text-gray-300" : "text-gray-900";
  const secondaryTextClass =
    theme === "dark" ? "text-gray-400" : "text-gray-600";
  const getEmbedUrl = (url) => {
    if (!url) return null;

    try {
      const ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
      );

      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
      }

      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  return (
    <div
      className={`relative w-full min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"
        }`}
    >
      <div className="flex flex-col lg:flex-row w-full px-4 md:px-10">
        <main className="flex-1 px-2 md:px-6 py-10 lg:pr-96">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold pt-6"
            style={{ color: theme === "dark" ? "#f3f4f6" : undefined }}
          >
            {topic.title}
          </motion.h1>
          {/* AI SUMMARIZER */}
          <div className="mt-6">
            <button
              onClick={handleSummarize}
              disabled={summLoading}
              className={`px-4 py-2 rounded-lg font-medium shadow-md 
      ${theme === "dark"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}
            >
              {summLoading ? "Summarizing…" : "Summarize with AI"}
            </button>

            {summary && (
              <div
                className={`mt-4 border rounded-xl p-4 leading-relaxed shadow-sm ${theme === "dark"
                  ? "bg-gray-900 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200 text-gray-800"
                  }`}
              >
                <h3 className="font-semibold text-lg mb-2">AI Summary</h3>
                <div className="prose dark:prose-invert">
                  {summary}
                </div>
              </div>
            )}
          </div>


          {topic.description && (
            <p
              className={`mt-4 max-w-3xl leading-relaxed text-lg ${secondaryTextClass}`}
            >
              {topic.description}
            </p>
          )}


          <article
            className={`mt-8 prose max-w-none ${textColorClass}`}
          >
            {contentNodes.map((n, i) => renderNode(n, `node-${i}`))}
          </article>

          <div className="mt-16">
            <h2
              className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
            >
              Video Lesson
            </h2>

            {topic.video_url && getEmbedUrl(topic.video_url) ? (
              <div className="w-full my-6">
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={getEmbedUrl(topic.video_url)}
                    title="Topic video"
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ) : (
              <p
                className={`mt-2 italic ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                No video for this topic.
              </p>
            )}
          </div>

        </main>

        <aside
          className={`lg:w-80 w-full lg:fixed right-6 top-24 backdrop-blur-md shadow-xl rounded-2xl p-6 h-fit border ${theme === "dark"
            ? "bg-gray-900/70 border-gray-800"
            : "bg-white/70 border-gray-200"
            }`}
        >
          <h3
            className={`font-bold text-lg mb-3 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"
              }`}
          >
            Table of Contents
          </h3>

          <div className="space-y-2">
            {toc.map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  document.getElementById(t.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className={`block w-full text-left text-sm ${theme === "dark"
                  ? "text-gray-200 hover:text-indigo-300"
                  : "text-gray-700 hover:text-indigo-600"
                  }`}
              >
                {Array.from({ length: t.level - 1 }).map((_, i) => (
                  <span key={i} className="inline-block ml-2" />
                ))}
                {t.text}
              </button>
            ))}
          </div>

          <hr className="my-4" />

          <h3
            className={`font-bold text-lg mb-3 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"
              }`}
          >
            Recommended Topics
          </h3>

          {recommended.length === 0 ? (
            <p className="italic text-gray-500">No recommendations available.</p>
          ) : (
            <div className={`block w-full text-left text-sm ${theme === "dark"
              ? "text-gray-200 hover:text-indigo-300"
              : "text-gray-700 hover:text-indigo-600"
              }`}>
              {recommended.map((rec) => (
                <motion.div
                  key={rec.id}
                  whileHover={{ scale: 1.02 }}
                  className={`block w-full text-left text-sm ${theme === "dark"
                    ? "text-gray-200 hover:text-indigo-300"
                    : "text-gray-700 hover:text-indigo-600"
                    }`}
                >
                  <a href={`/topics/${rec.slug}`} className="inline-block ml-2">
                    {rec.title}
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed right-6 bottom-8 z-50 p-3 rounded-full shadow-lg ${showTop
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg,#4f46e5,#ec4899)"
              : "linear-gradient(135deg,#6366f1,#f472b6)",
          color: "white",
        }}
      >
        <ArrowUp />
      </button>
    </div>
  );
}
