// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState, useRef } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { ArrowUp, Copy, Divide } from "lucide-react";
// import { useTheme } from "../../../context/ThemeContext";
// import toast from "react-hot-toast";

// import hljs from "highlight.js/lib/core";
// import javascript from "highlight.js/lib/languages/javascript";
// import xml from "highlight.js/lib/languages/xml";
// import cssLang from "highlight.js/lib/languages/css";
// import python from "highlight.js/lib/languages/python";
// import bash from "highlight.js/lib/languages/bash";
// import jsonLang from "highlight.js/lib/languages/json";
// import ReactMarkdown from "react-markdown";

// import "highlight.js/styles/github.css";               
// import "highlight.js/styles/github-dark-dimmed.css";  

// javascript && hljs.registerLanguage("javascript", javascript);
// xml && hljs.registerLanguage("xml", xml);
// cssLang && hljs.registerLanguage("css", cssLang);
// python && hljs.registerLanguage("python", python);
// bash && hljs.registerLanguage("bash", bash);
// jsonLang && hljs.registerLanguage("json", jsonLang);

// const BASE_URL = import.meta.env.VITE_API_BASE_URL


// function CodeBlock({ language = "plaintext", code = "", theme }) {
//   const codeRef = useRef(null);

//   useEffect(() => {
//     if (codeRef.current) hljs.highlightElement(codeRef.current);
//   }, [code, language, theme]);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(code);
//       toast.success("Code copied");
//     } catch {
//       toast.error("Unable to copy");
//     }
//   };

//   const containerClass =
//     theme === "dark"
//       ? "bg-[#0d1117] border border-gray-800 text-gray-200"
//       : "bg-gray-50 border border-gray-200 text-gray-900";

//   return (
//     <div className={`relative my-6 rounded-lg overflow-hidden ${containerClass}`}>
//       <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/30">
//         <span className="text-xs font-medium">{language.toUpperCase()}</span>
//         <button
//           onClick={handleCopy}
//           className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:opacity-80"
//         >
//           <Copy size={14} /> Copy
//         </button>
//       </div>

//       <pre className="p-4 overflow-auto text-sm">
//         <code ref={codeRef} className={`language-${language}`}>
//           {code}
//         </code>
//       </pre>
//     </div>
//   );
// }

// // MAIN TOPIC DETAIL PAGE
// export default function TopicDetail() {
//   const { slug } = useParams();
//   const { theme } = useTheme();

//   const [topic, setTopic] = useState(null);
//   const [recommended, setRecommended] = useState([]);
//   const [toc, setToc] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showTop, setShowTop] = useState(false);
//   const [summary, setSummary] = useState("");
//   const [summLoading, setSummLoading] = useState(false);

//   // FETCH TOPIC
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/topics/slug/${slug}/`);
//         if (!mounted) return;

//         setTopic(res.data || null);

//         // Build table of contents from TipTap JSON
//         const headings = [];
//         const extractHeadings = (nodes) => {
//           if (!nodes) return;
//           nodes.forEach((n) => {
//             if (n?.type === "heading") {
//               const text = (n.content || []).map((c) => c.text || "").join("");
//               const level = n.attrs?.level || 2;
//               const id =
//                 n.attrs?.id ||
//                 `${level}-${text
//                   .slice(0, 12)
//                   .replace(/\s+/g, "-")
//                   .toLowerCase()}`;

//               headings.push({ level, text, id });
//             }
//             extractHeadings(n.content);
//           });
//         };

//         extractHeadings(res.data.content?.content || []);
//         setToc(headings);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         mounted && setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [slug]);

//   //  fetch recommended topics

//   useEffect(() => {
//     if (topic?.id) {
//       axios
//         .get(`${BASE_URL}/topics/${topic.id}/ai-recommended/`)
//         .then((res) => setRecommended(res.data))
//         .catch(() => setRecommended([]));
//     }
//   }, [topic]);

//   const handleSummarize = async () => {
//     if (!topic?.content) return;

//     try {
//       setSummLoading(true);
//       setSummary("");

//       const res = await axios.post(`${BASE_URL}/api/ai/summarize/`, {
//         title: topic.title,
//         content: topic.content,
//       });

//       setSummary(res.data.summary);
//     } catch (err) {
//       console.error(err);
//       toast.error("Unable to summarize right now");
//     } finally {
//       setSummLoading(false);
//     }
//   };

//   // BACK TO TOP BUTTON LOGIC
//   useEffect(() => {
//     const onScroll = () => setShowTop(window.scrollY > 400);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);
//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">
//         Loading topic…
//       </div>
//     );

//   if (!topic)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-500">
//         Topic not found.
//       </div>
//     );

//   // RENDER TIPTAP NODES
//   const renderNode = (node, key) => {
//     if (!node) return null;

//     if (node.type === "heading") {
//       const level = node.attrs?.level || 2;
//       const Tag = `h${level}`;
//       const text = (node.content || []).map((c) => c.text || "").join("");
//       const id =
//         node.attrs?.id ||
//         `${level}-${text.slice(0, 12).replace(/\s+/g, "-").toLowerCase()}`;

//       return (
//         <Tag
//           key={key}
//           id={id}
//           className="mt-8 mb-3 font-semibold"
//           style={{ color: theme === "dark" ? "#e6e6e6" : undefined }}
//         >
//           {text}
//         </Tag>
//       );
//     }

//     if (node.type === "paragraph") {
//       return (
//         <p
//           key={key}
//           className="mb-4 leading-relaxed"
//           style={{ color: theme === "dark" ? "#d1d1d1" : undefined }}
//         >
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </p>
//       );
//     }

//     if (node.type === "text") {
//       return (
//         <span key={key} style={{ color: theme === "dark" ? "#d1d1d1" : undefined }}>
//           {node.text}
//         </span>
//       );
//     }

//     if (node.type === "codeBlock") {
//       const language = node.attrs?.language || "plaintext";
//       const codeText = (node.content || [])
//         .map((c) => c.text || "")
//         .join("\n");

//       return (
//         <CodeBlock key={key} language={language} code={codeText} theme={theme} />
//       );
//     }

//     if (node.type === "image") {
//       return (
//         <img
//           key={key}
//           src={node.attrs?.src}
//           alt={node.attrs?.alt || ""}
//           className="my-4 max-w-full rounded"
//         />
//       );
//     }

//     return (
//       <div key={key}>
//         {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//       </div>
//     );
//   };

//   const contentNodes = topic.content?.content || [];

//   const textColorClass = theme === "dark" ? "text-gray-300" : "text-gray-900";
//   const secondaryTextClass =
//     theme === "dark" ? "text-gray-400" : "text-gray-600";
//   const getEmbedUrl = (url) => {
//     if (!url) return null;

//     try {
//       const ytMatch = url.match(
//         /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
//       );

//       if (ytMatch && ytMatch[1]) {
//         return `https://www.youtube.com/embed/${ytMatch[1]}`;
//       }

//       const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
//       if (vimeoMatch && vimeoMatch[1]) {
//         return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
//       }

//       return null;
//     } catch (err) {
//       return null;
//     }
//   };

//   return (
//     <div
//       className={`relative w-full min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"
//         }`}
//     >
//       <div className="flex flex-col lg:flex-row w-full px-4 md:px-10">
//         <main className="flex-1 px-2 md:px-6 py-10 lg:pr-96">
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="text-4xl md:text-5xl font-extrabold pt-6"
//             style={{ color: theme === "dark" ? "#f3f4f6" : undefined }}
//           >
//             {topic.title}
//           </motion.h1>
//           {/* AI SUMMARIZER */}
//           <div className="mt-6">
//             <button
//               onClick={handleSummarize}
//               disabled={summLoading}
//               className={`px-4 py-2 rounded-lg font-medium shadow-md 
//       ${theme === "dark"
//                   ? "bg-indigo-600 hover:bg-indigo-700 text-white"
//                   : "bg-indigo-500 hover:bg-indigo-600 text-white"
//                 }`}
//             >
//               {summLoading ? "Summarizing…" : "Summarize with AI"}
//             </button>

//             {summary && (
//               <div
//                 className={`mt-4 border rounded-xl p-4 leading-relaxed shadow-sm ${theme === "dark"
//                   ? "bg-gray-900 border-gray-700 text-gray-200"
//                   : "bg-white border-gray-200 text-gray-800"
//                   }`}
//               >
//                 <h3 className="font-semibold text-lg mb-2">AI Summary</h3>
//                 <div className="prose dark:prose-invert">
//                   {summary}
//                 </div>
//               </div>
//             )}
//           </div>


//           {topic.description && (
//             <p
//               className={`mt-4 max-w-3xl leading-relaxed text-lg ${secondaryTextClass}`}
//             >
//               {topic.description}
//             </p>
//           )}


//           <article
//             className={`mt-8 prose max-w-none ${textColorClass}`}
//           >
//             {contentNodes.map((n, i) => renderNode(n, `node-${i}`))}
//           </article>

//           <div className="mt-16">
//             <h2
//               className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"
//                 }`}
//             >
//               Video Lesson
//             </h2>

//             {topic.video_url && getEmbedUrl(topic.video_url) ? (
//               <div className="w-full my-6">
//                 <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
//                   <iframe
//                     src={getEmbedUrl(topic.video_url)}
//                     title="Topic video"
//                     className="absolute top-0 left-0 w-full h-full rounded-xl"
//                     frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                   ></iframe>
//                 </div>
//               </div>
//             ) : (
//               <p
//                 className={`mt-2 italic ${theme === "dark" ? "text-gray-400" : "text-gray-600"
//                   }`}
//               >
//                 No video for this topic.
//               </p>
//             )}
//           </div>

//         </main>

//         <aside
//           className={`lg:w-80 w-full lg:fixed right-6 top-24 backdrop-blur-md shadow-xl rounded-2xl p-6 h-fit border ${theme === "dark"
//             ? "bg-gray-900/70 border-gray-800"
//             : "bg-white/70 border-gray-200"
//             }`}
//         >
//           <h3
//             className={`font-bold text-lg mb-3 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"
//               }`}
//           >
//             Table of Contents
//           </h3>

//           <div className="space-y-2">
//             {toc.map((t) => (
//               <button
//                 key={t.id}
//                 onClick={() =>
//                   document.getElementById(t.id)?.scrollIntoView({
//                     behavior: "smooth",
//                     block: "start",
//                   })
//                 }
//                 className={`block w-full text-left text-sm ${theme === "dark"
//                   ? "text-gray-200 hover:text-indigo-300"
//                   : "text-gray-700 hover:text-indigo-600"
//                   }`}
//               >
//                 {Array.from({ length: t.level - 1 }).map((_, i) => (
//                   <span key={i} className="inline-block ml-2" />
//                 ))}
//                 {t.text}
//               </button>
//             ))}
//           </div>

//           <hr className="my-4" />

//           <h3
//             className={`font-bold text-lg mb-3 ${theme === "dark" ? "text-indigo-300" : "text-indigo-700"
//               }`}
//           >
//             Recommended Topics
//           </h3>

//           {recommended.length === 0 ? (
//             <p className="italic text-gray-500">No recommendations available.</p>
//           ) : (
//             <div className={`block w-full text-left text-sm ${theme === "dark"
//               ? "text-gray-200 hover:text-indigo-300"
//               : "text-gray-700 hover:text-indigo-600"
//               }`}>
//               {recommended.map((rec) => (
//                 <motion.div
//                   key={rec.id}
//                   whileHover={{ scale: 1.02 }}
//                   className={`block w-full text-left text-sm ${theme === "dark"
//                     ? "text-gray-200 hover:text-indigo-300"
//                     : "text-gray-700 hover:text-indigo-600"
//                     }`}
//                 >
//                   <a href={`/topics/${rec.slug}`} className="inline-block ml-2">
//                     {rec.title}
//                   </a>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </aside>
//       </div>

//       <button
//         onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//         className={`fixed right-6 bottom-8 z-50 p-3 rounded-full shadow-lg ${showTop
//           ? "opacity-100 translate-y-0"
//           : "opacity-0 translate-y-6 pointer-events-none"
//           }`}
//         style={{
//           background:
//             theme === "dark"
//               ? "linear-gradient(135deg,#4f46e5,#ec4899)"
//               : "linear-gradient(135deg,#6366f1,#f472b6)",
//           color: "white",
//         }}
//       >
//         <ArrowUp />
//       </button>
//     </div>
//   );
// }
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiClock, FiCopy, FiCheck, FiBook, FiVideo, FiArrowLeft } from "react-icons/fi";
import { useTheme } from "../../../context/ThemeContext";
import toast from "react-hot-toast";
import client from "../../auth/api";

import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

import DOMPurify from "dompurify";
import parse, { domToReact, Element } from "html-react-parser";

/* ==========================================================================
   HELPER: HTML DECODER
   ========================================================================== */
// This turns "&lt;p&gt;" back into "<p>" so the browser renders it as a paragraph
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/* ==========================================================================
   HTML CLEANER & NORMALIZER
   ========================================================================== */

function normalizeHtml(html) {
  if (!html) return "";

  // 1. DECODE THE HTML (Fixes your specific screenshot issue)
  // We decode once to turn the escaped string back into renderable HTML
  let cleaned = decodeHtml(html);

  // 2. Remove outer <b> wrappers if the whole doc is bold
  if (/^\s*<b>[\s\S]*<\/b>\s*$/i.test(cleaned)) {
    cleaned = cleaned.replace(/^\s*<b>/i, "").replace(/<\/b>\s*$/i, "");
  }

  // 3. Remove <b> tags that wrap block elements
  cleaned = cleaned.replace(/<b>\s*(<(?:p|h[1-6]|ul|ol|div|li)[^>]*>)/gi, "$1");
  cleaned = cleaned.replace(/(<\/(?:p|h[1-6]|ul|ol|div|li)>)\s*<\/b>/gi, "$1");

  // 4. Clean Google Docs/Word garbage
  cleaned = cleaned.replace(/<span[^>]*?>/gi, "");
  cleaned = cleaned.replace(/<\/span>/gi, "");
  
  // 5. Cleanup empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, "");
  
  // 6. Metadata stripping
  cleaned = cleaned.replace(/<meta[^>]*>/gi, "");

  return cleaned;
}

/* ==========================================================================
   HEADINGS: ID Injection for TOC
   ========================================================================== */

function injectHeadingIDs(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  const headings = temp.querySelectorAll("h2, h3");

  headings.forEach((h, index) => {
    const id = h.textContent
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "") + "-" + index;
    h.setAttribute("id", id);
  });

  return temp.innerHTML;
}

/* ==========================================================================
   SANITIZER
   ========================================================================== */

function safeSanitize(html) {
  // We allow specific attributes to ensure code highlighting classes pass through
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    KEEP_CONTENT: true,
    ALLOWED_TAGS: [
      "p", "strong", "em", "u", "i", "b", "s",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "pre", "code", "br", "hr",
      "table", "thead", "tbody", "tr", "th", "td",
      "blockquote",
      "div", "span", "a", "img"
    ],
    ALLOWED_ATTR: ["id", "class", "href", "src", "alt", "target", "style"]
  });
}

function cleanHtmlPipeline(html) {
  let out = normalizeHtml(html);
  out = injectHeadingIDs(out);
  out = safeSanitize(out);
  return out;
}

/* ==========================================================================
   CUSTOM CODE BLOCK COMPONENT
   ========================================================================== */

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const langLabel = language ? language.replace("language-", "") : "text";

  return (
    <div className="my-6 rounded-xl overflow-hidden bg-[#282c34] shadow-2xl border border-gray-700/50 group text-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-gray-700/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 font-mono uppercase tracking-wider select-none">
            {langLabel}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            title="Copy Code"
          >
            {copied ? <FiCheck className="text-green-400" size={14} /> : <FiCopy size={14} />}
          </button>
        </div>
      </div>
      
      {/* Code Body */}
      <div className="relative">
        <pre className="!m-0 !p-4 !bg-transparent overflow-x-auto">
          <code
            ref={codeRef}
            className={`!font-mono !text-sm !leading-relaxed ${language || 'language-text'}`}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};

/* ==========================================================================
   CONTENT RENDERER
   ========================================================================== */

const ContentRenderer = ({ htmlContent }) => {
  const cleanedHtml = useMemo(() => cleanHtmlPipeline(htmlContent), [htmlContent]);

  const options = {
    replace: (domNode) => {
      // 1. Handle Code Blocks (<pre><code>...)
      if (domNode instanceof Element && domNode.name === "pre") {
        const codeNode = domNode.children.find((child) => child.name === "code");
        
        if (codeNode) {
          const className = codeNode.attribs?.class || "";
          
          // Helper to recursively get text content from children
          const getCodeText = (node) => {
            if (node.type === "text") return node.data;
            if (node.children) return node.children.map(getCodeText).join("");
            return "";
          };
          
          const codeText = getCodeText(codeNode);
          return <CodeBlock language={className} code={codeText} />;
        }
      }

      // 2. Handle Inline Code (e.g. "Use the <span> tag")
      // We explicitly style <code> tags that are NOT inside <pre>
      if (domNode instanceof Element && domNode.name === "code") {
         // If parent is NOT pre (already handled above), style it as inline code
         if (domNode.parent && domNode.parent.name !== "pre") {
            return (
                <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-sm border border-gray-200 dark:border-gray-700">
                    {domToReact(domNode.children)}
                </code>
            );
         }
      }
    },
  };

  return (
    <div
      className="
        prose prose-lg max-w-none
        dark:prose-invert
        prose-headings:font-bold prose-headings:tracking-tight
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
        prose-p:leading-loose prose-p:text-gray-600 dark:prose-p:text-gray-300
        prose-li:text-gray-600 dark:prose-li:text-gray-300
        prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400
        prose-img:rounded-xl prose-img:shadow-lg
        /* Hide default prose code styling to use our custom inline one */
        prose-code:text-inherit prose-code:bg-transparent prose-code:p-0 prose-code:before:content-none prose-code:after:content-none
      "
    >
      {parse(cleanedHtml, options)}
    </div>
  );
};

/* ==========================================================================
   MAIN TOPIC DETAIL COMPONENT
   ========================================================================== */

const TableOfContents = React.memo(({ toc, activeId }) => {
  if (toc.length === 0) return null;

  return (
    <div className="sticky top-24">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          On This Page
        </h4>
        <nav className="space-y-1">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`block text-sm py-2 px-3 rounded-lg transition-all ${
                activeId === item.id
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              } ${item.level === 3 ? "ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-3" : ""}`}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
});
TableOfContents.displayName = 'TableOfContents';

export default function TopicDetail() {
  const { slug } = useParams();
  const { theme } = useTheme();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/api/topics/slug/${slug}/`);
        if (mounted) setTopic(res.data);
      } catch (error) {
        console.error("Error fetching topic", error);
        if (mounted) toast.error("Failed to load topic");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTopic();
    return () => { mounted = false; };
  }, [slug]);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );
    const headings = document.querySelectorAll("h2, h3");
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [topic]);

  // Generate TOC
  const toc = useMemo(() => {
    if (!topic?.content_html) return [];
    // Decode first to ensure we find headings even if escaped
    const decoded = decodeHtml(topic.content_html); 
    const parser = new DOMParser();
    const doc = parser.parseFromString(decoded, "text/html");
    const headings = doc.querySelectorAll("h2, h3");
    return Array.from(headings).map((h, idx) => ({
      id: h.textContent.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + `-${idx}`,
      text: h.textContent,
      level: h.tagName === "H2" ? 2 : 3,
    }));
  }, [topic]);

  const videoEmbedUrl = useMemo(() => {
    if (!topic?.video_url) return null;
    const match = topic.video_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([\w-]{10,12})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }, [topic?.video_url]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
             <p className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Topic not found</p>
             <Link to="/topics" className="text-indigo-600 hover:underline">Go back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <Link to="/topics" className="inline-flex items-center gap-2 text-indigo-100 hover:text-white text-sm font-medium w-fit">
              <FiArrowLeft /> Back to Topics
            </Link>
            <span className="inline-flex items-center gap-2 text-indigo-100 font-medium text-xs tracking-wider uppercase bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
              <FiBook /> {topic.course_detail?.title || "Course Topic"}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">{topic.title}</h1>
            {topic.description && <p className="text-lg text-indigo-100 max-w-3xl leading-relaxed">{topic.description}</p>}
            
            <div className="flex items-center gap-4 mt-2 text-sm text-indigo-200">
              <span className="flex items-center gap-2">
                <FiClock /> {topic.created_at ? new Date(topic.created_at).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8">
          {topic.content_html ? (
            <ContentRenderer htmlContent={topic.content_html} />
          ) : (
            <div className="text-center py-20 text-gray-500">No content available.</div>
          )}

          {videoEmbedUrl && (
            <div className="mt-16 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-6"><FiVideo className="text-indigo-600" /> Video Lesson</h3>
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
                <iframe src={videoEmbedUrl} className="w-full h-full" title="Video Lesson" allowFullScreen />
              </div>
            </div>
          )}
        </motion.div>

        <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-4 hidden lg:block">
          <TableOfContents toc={toc} activeId={activeId} />
        </motion.aside>
      </div>
    </div>
  );
}