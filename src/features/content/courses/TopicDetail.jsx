// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState, useRef } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { Play, Copy, RefreshCcw, ChevronRight } from "lucide-react";
// import { useTheme } from "../../../context/ThemeContext";
// import toast from "react-hot-toast";
// import { lowlight } from "lowlight/lib/common.js";
// import js from "highlight.js/lib/languages/javascript";
// import xml from "highlight.js/lib/languages/xml";
// import cssLang from "highlight.js/lib/languages/css";
// import python from "highlight.js/lib/languages/python";
// import bash from "highlight.js/lib/languages/bash";
// import jsonLang from "highlight.js/lib/languages/json";
// import "highlight.js/styles/github.css";

// lowlight.registerLanguage("javascript", js);
// lowlight.registerLanguage("html", xml);
// lowlight.registerLanguage("css", cssLang);
// lowlight.registerLanguage("python", python);
// lowlight.registerLanguage("bash", bash);
// lowlight.registerLanguage("json", jsonLang);

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// // -------------------- Playground Component --------------------
// function UniversalPlayground({ language = "javascript", code = "" }) {
//   const iframeRef = useRef(null);
//   const [userCode, setUserCode] = useState(code);
//   const [running, setRunning] = useState(false);

//   const run = () => {
//     setRunning(true);
//     const safeSrcDoc = `
//       <!DOCTYPE html><html><head><meta charset="utf-8"/>
//       <style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:12px;color:#111}</style>
//       </head><body>
//       <div id="app"></div>
//       <script>
//         try { ${userCode} } catch(e){ document.body.innerHTML += '<pre style="color:red;">Error: '+e+'</pre>'; }
//       </script>
//       </body></html>
//     `;
//     if (iframeRef.current) iframeRef.current.srcdoc = safeSrcDoc;
//     setTimeout(() => setRunning(false), 100); // reset running
//   };

//   const copy = () => {
//     navigator.clipboard.writeText(userCode);
//     toast.success("Code copied");
//   };

//   const reset = () => setUserCode(code);

//   return (
//     <div className="my-6 border rounded-lg overflow-hidden">
//       <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-b">
//         <span className="text-sm font-medium">{language.toUpperCase()}</span>
//         <div className="flex gap-2">
//           <button onClick={run} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded flex items-center gap-2">
//             <Play size={14}/> {running ? "Running..." : "Run"}
//           </button>
//           <button onClick={reset} className="p-2 rounded hover:bg-gray-100"><RefreshCcw size={14}/></button>
//           <button onClick={copy} className="p-2 rounded hover:bg-gray-100"><Copy size={14}/></button>
//         </div>
//       </div>
//       <div className="grid md:grid-cols-2 gap-3 p-3">
//         <textarea value={userCode} onChange={e => setUserCode(e.target.value)} className="font-mono text-sm border rounded p-3 min-h-[200px] bg-gray-900 text-green-100"/>
//         <div className="border rounded p-2 min-h-[200px]">
//           <iframe ref={iframeRef} title="playground" className="w-full h-full bg-white"/>
//         </div>
//       </div>
//     </div>
//   );
// }

// // -------------------- TopicDetail --------------------
// export default function TopicDetail() {
//   const { slug } = useParams();
//   const { theme } = useTheme();

//   const [topic, setTopic] = useState(null);
//   const [recommended, setRecommended] = useState([]);
//   const [toc, setToc] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/topics/slug/${slug}/`);
//         if (!mounted) return;
//         setTopic(res.data);

//         // Extract headings for ToC
//         const headings = [];
//         const extractHeadings = (nodes) => {
//           if (!nodes) return;
//           nodes.forEach(n => {
//             if (n.type === "heading") {
//               headings.push({ level: n.attrs?.level || 2, text: n.content.map(c => c.text || "").join(""), id: n.attrs?.id || `${n.attrs?.level}-${n.content[0]?.text?.slice(0,10)}` });
//             }
//             extractHeadings(n.content);
//           });
//         };
//         extractHeadings(res.data.content?.content || []);
//         setToc(headings);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [slug]);

//   useEffect(() => {
//     if (!topic?.id) return;
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/topics/${topic.id}/recommended/`);
//         if (!mounted) return;
//         setRecommended(res.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [topic]);

//   if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse">Loading topic…</div>;
//   if (!topic) return <div className="min-h-screen flex items-center justify-center text-red-500">Topic not found.</div>;

//   const scrollToId = (id) => {
//     const el = document.getElementById(id);
//     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   const renderNode = (node, key) => {
//     if (!node) return null;
//     // headings with IDs for TOC linking
//     if (node.type === "heading") {
//       const Tag = `h${node.attrs?.level || 2}`;
//       const id = node.attrs?.id || `${node.attrs?.level}-${node.content[0]?.text?.slice(0,10)}`;
//       return <Tag key={key} id={id} className="mt-6 mb-3 font-semibold text-2xl">{node.content?.map((c,i)=>renderNode(c, `${key}-${i}`))}</Tag>;
//     }
//     // paragraphs
//     if (node.type === "paragraph") return <p key={key} className="mb-4">{node.content?.map((c,i)=>renderNode(c, `${key}-${i}`))}</p>;
//     // text node
//     if (node.type === "text") return <span key={key}>{node.text}</span>;
//     // codeBlock
//     if (node.type === "codeBlock") {
//       const language = node.attrs?.language || "plaintext";
//       const codeText = (node.content || []).map(c=>c.text||"").join("\n");
//       return <UniversalPlayground key={key} language={language} code={codeText}/>;
//     }
//     // video
//     if (node.type === "youtube" || node.type === "video") {
//       let src = node.attrs?.src || node.attrs?.url;
//       if (!src) return null;
//       if (src.includes("youtube.com") || src.includes("youtu.be")) {
//         const idMatch = src.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
//         if (idMatch) src = `https://www.youtube.com/embed/${idMatch[1]}`;
//       }
//       return <div key={key} className="my-6 rounded overflow-hidden shadow"><iframe src={src} title={`video-${key}`} className="w-full aspect-video" allowFullScreen /></div>;
//     }
//     return <div key={key}>{node.content?.map((c,i)=>renderNode(c, `${key}-${i}`))}</div>;
//   };

//   const contentNodes = topic.content?.content || [];

//   return (
//     <div className={`relative flex flex-col lg:flex-row w-full min-h-screen transition-colors duration-500 ${theme==="dark"?"bg-gray-950 text-white":"bg-gray-50 text-gray-900"}`}>

//       {/* Sidebar */}
//       <aside className={`lg:w-80 w-full lg:fixed lg:right-6 lg:top-24 backdrop-blur-md shadow-xl rounded-2xl p-6 h-fit z-20 border ${theme==="dark"?"bg-gray-900/70 border-gray-800":"bg-white/70 border-gray-200"}`}>
//         <h3 className="font-bold text-xl mb-4 text-indigo-700">Table of Contents</h3>
//         {toc.length ? toc.map(t => (
//           <button key={t.id} onClick={()=>scrollToId(t.id)} className="block w-full text-left mb-2 hover:text-indigo-500 transition">{t.text}</button>
//         )) : <p className="text-sm text-gray-500">No headings available</p>}

//         <hr className="my-4"/>

//         <h3 className="font-bold text-xl mb-4 text-indigo-700">Recommended Topics</h3>
//         {recommended.length ? recommended.map(t => (
//           <Link key={t.id} to={`/topics/${t.slug}`} className="block mb-2 hover:text-indigo-500">{t.title}</Link>
//         )) : <p className="text-sm text-gray-500">No recommended topics</p>}
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 lg:ml-10 lg:mr-100 px-6 py-10">
//         <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent pt-8">
//           {topic.title}
//         </motion.h1>
//         {topic.description && <p className="mt-4 max-w-3xl leading-relaxed text-lg text-gray-600">{topic.description}</p>}

//         <article className="mt-8 prose max-w-none">
//           {contentNodes.map((n,i)=>renderNode(n, `node-${i}`))}
//         </article>

//         <div className="mt-10">


//         </div>
//       </main>
//     </div>
//   );
// }

// /* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { Copy, ArrowUp } from "lucide-react";
// import { useTheme } from "../../../context/ThemeContext";
// import toast from "react-hot-toast";

// // HighlightJS
// import hljs from "highlight.js/lib/core";
// import javascript from "highlight.js/lib/languages/javascript";
// import xml from "highlight.js/lib/languages/xml";
// import cssLang from "highlight.js/lib/languages/css";
// import python from "highlight.js/lib/languages/python";
// import bash from "highlight.js/lib/languages/bash";
// import jsonLang from "highlight.js/lib/languages/json";

// import "highlight.js/styles/github.css";
// import "highlight.js/styles/github-dark.css";

// hljs.registerLanguage("javascript", javascript);
// hljs.registerLanguage("html", xml);
// hljs.registerLanguage("css", cssLang);
// hljs.registerLanguage("python", python);
// hljs.registerLanguage("bash", bash);
// hljs.registerLanguage("json", jsonLang);

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function TopicDetail() {
//   const { slug } = useParams();
//   const { theme } = useTheme();

//   const [topic, setTopic] = useState(null);
//   const [recommended, setRecommended] = useState([]);
//   const [toc, setToc] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // -------------------------------------------------------
//   // Fetch Topic By Slug
//   // -------------------------------------------------------
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/topics/slug/${slug}/`);
//         if (!mounted) return;

//         setTopic(res.data);

//         // Generate TOC — FIXED to support both array or doc.content
//         const headings = [];

//         const extract = (nodes) => {
//           if (!nodes) return;

//           nodes.forEach((n) => {
//             if (n.type === "heading") {
//               const level = n.attrs?.level || 2;
//               const text = n.content?.map((c) => c.text || "").join("") || "";
//               const id =
//                 n.attrs?.id ||
//                 text.toLowerCase().replace(/\s+/g, "-").slice(0, 40);

//               headings.push({ id, level, text });
//             }
//             extract(n.content);
//           });
//         };

//         const contentNodes = Array.isArray(res.data.content)
//           ? res.data.content
//           : res.data.content?.content;

//         extract(contentNodes);
//         setToc(headings);
//       } catch (e) {
//         console.log(e);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => (mounted = false);
//   }, [slug]);

//   // -------------------------------------------------------
//   // Recommended Topics
//   // -------------------------------------------------------
//   useEffect(() => {
//     if (!topic?.id) return;
//     let mounted = true;

//     (async () => {
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/api/topics/${topic.id}/recommended/`
//         );
//         if (!mounted) return;
//         setRecommended(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.log(e);
//       }
//     })();

//     return () => (mounted = false);
//   }, [topic]);

//   // -------------------------------------------------------
//   // Highlight.js activate
//   // -------------------------------------------------------
//   useEffect(() => {
//     document.querySelectorAll("pre code").forEach((block) => {
//       hljs.highlightElement(block);
//     });
//   }, [topic, theme]);

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-500">
//         Loading topic…
//       </div>
//     );

//   if (!topic)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-500">
//         Topic not found.
//       </div>
//     );

//   const scrollToId = (id) => {
//     const el = document.getElementById(id);
//     if (el) el.scrollIntoView({ behavior: "smooth" });
//   };

//   // -------------------------------------------------------
//   // TipTap Node Renderer
//   // -------------------------------------------------------
//   const renderNode = (node, key) => {
//     if (!node) return null;

//     // ---------------- HEADING ----------------
//     if (node.type === "heading") {
//       const Tag = `h${node.attrs?.level || 2}`;
//       const text =
//         node.content?.map((c) => c.text || "").join("") || "heading";
//       const id =
//         node.attrs?.id ||
//         text.toLowerCase().replace(/\s+/g, "-").slice(0, 40);

//       return (
//         <Tag
//           id={id}
//           key={key}
//           className="mt-12 mb-4 font-bold text-3xl tracking-tight dark:text-gray-100"
//         >
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </Tag>
//       );
//     }

//     // ---------------- PARAGRAPH ----------------
//     if (node.type === "paragraph")
//       return (
//         <p
//           key={key}
//           className="mb-6 text-[18px] leading-8 dark:text-gray-100"
//         >
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </p>
//       );

//     // ---------------- TEXT ----------------
//     if (node.type === "text") {
//       let cls = "";
//       if (node.marks) {
//         node.marks.forEach((m) => {
//           if (m.type === "bold") cls += " font-semibold";
//           if (m.type === "italic") cls += " italic";
//           if (m.type === "code")
//             cls += " bg-gray-800 text-yellow-300 px-1 rounded";
//         });
//       }

//       return (
//         <span key={key} className={cls}>
//           {node.text}
//         </span>
//       );
//     }

//     // ---------------- LINK ----------------
//     if (node.type === "link")
//       return (
//         <a
//           key={key}
//           href={node.attrs?.href}
//           target="_blank"
//           rel="noreferrer"
//           className="text-indigo-600 dark:text-indigo-300 underline"
//         >
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </a>
//       );

//     // ---------------- BULLET LIST ----------------
//     if (node.type === "bulletList")
//       return (
//         <ul key={key} className="list-disc ml-6 mb-6">
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </ul>
//       );

//     // ---------------- ORDERED LIST ----------------
//     if (node.type === "orderedList")
//       return (
//         <ol key={key} className="list-decimal ml-6 mb-6">
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </ol>
//       );

//     // ---------------- LIST ITEM ----------------
//     if (node.type === "listItem")
//       return (
//         <li key={key} className="mb-2 text-[18px] leading-8">
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </li>
//       );

//     // ---------------- BLOCKQUOTE ----------------
//     if (node.type === "blockquote")
//       return (
//         <blockquote
//           key={key}
//           className="border-l-4 pl-4 my-6 italic text-gray-700 dark:text-gray-300"
//         >
//           {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//         </blockquote>
//       );

//     // ---------------- IMAGE ----------------
//     if (node.type === "image")
//       return (
//         <img
//           key={key}
//           src={node.attrs?.src}
//           alt=""
//           className="rounded-xl my-6 shadow-lg"
//         />
//       );

//     // ---------------- CODE BLOCK ----------------
//     if (node.type === "codeBlock") {
//       const lang = node.attrs?.language || "plaintext";
//       const code = node.content?.map((c) => c.text).join("\n") || "";

//       return (
//         <div
//           key={key}
//           className="relative my-8 border border-gray-700/20 dark:border-gray-300/10 rounded-xl overflow-hidden shadow-xl"
//         >
//           <button
//             onClick={() => {
//               navigator.clipboard.writeText(code);
//               toast.success("Copied!");
//             }}
//             className="absolute top-3 right-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-black px-3 py-1 rounded text-xs flex items-center gap-1"
//           >
//             <Copy size={12} />
//             Copy
//           </button>

//           <pre className="p-5 bg-gray-900 dark:bg-gray-950 text-gray-200 overflow-x-auto">
//             <code className={`language-${lang}`}>{code}</code>
//           </pre>
//         </div>
//       );
//     }

//     // ---------------- VIDEO/YOUTUBE ----------------
//     if (node.type === "youtube" || node.type === "video") {
//       let src = node.attrs?.src;

//       if (src.includes("youtu")) {
//         const m = src.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
//         if (m) src = `https://www.youtube.com/embed/${m[1]}`;
//       }

//       return (
//         <div key={key} className="my-10 rounded-2xl overflow-hidden shadow-xl">
//           <iframe
//             src={src}
//             title="video"
//             className="w-full aspect-video rounded-2xl"
//             allowFullScreen
//           />
//         </div>
//       );
//     }

//     // ---------------- FALLBACK ----------------
//     return (
//       <div key={key}>
//         {node.content?.map((c, i) => renderNode(c, `${key}-${i}`))}
//       </div>
//     );
//   };

//   // -------------------------------------------------------
//   // FIXED CONTENT NODE EXTRACTION
//   // -------------------------------------------------------
//   const nodes = Array.isArray(topic.content)
//     ? topic.content
//     : topic.content?.content || [];

//   return (
//     <div
//       className={`relative flex flex-col lg:flex-row min-h-screen transition-colors duration-500 ${
//         theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-gray-50"
//       }`}
//     >
//       {/* --------------------- SIDEBAR --------------------- */}
//       <aside
//         className={`lg:w-80 w-full lg:fixed lg:right-6 lg:top-24 p-6 rounded-2xl shadow-xl border backdrop-blur-xl ${
//           theme === "dark"
//             ? "bg-gray-900/80 border-gray-800"
//             : "bg-white/80 border-gray-200"
//         }`}
//       >
//         <h3 className="font-bold text-2xl mb-6 text-indigo-500">
//           Table of Contents
//         </h3>

//         {toc.length ? (
//           toc.map((h) => (
//             <button
//               key={h.id}
//               onClick={() => scrollToId(h.id)}
//               className="block w-full text-left mb-2 text-[16px] hover:text-indigo-500 dark:hover:text-indigo-300 transition"
//             >
//               {h.text}
//             </button>
//           ))
//         ) : (
//           <p className="text-gray-500 text-sm">No headings</p>
//         )}

//         <hr className="my-6" />

//         <h3 className="font-bold text-2xl mb-4 text-indigo-500">
//           Recommended
//         </h3>

//         {recommended.length ? (
//           recommended.map((r) => (
//             <Link
//               key={r.id}
//               to={`/topics/${r.slug}`}
//               className="block mb-2 hover:text-indigo-500 dark:hover:text-indigo-300"
//             >
//               {r.title}
//             </Link>
//           ))
//         ) : (
//           <p className="text-sm text-gray-500">No recommended topics</p>
//         )}
//       </aside>

//       {/* --------------------- MAIN CONTENT --------------------- */}
//       <main className="flex-1 lg:mr-[360px] px-6 py-12 max-w-4xl mx-auto">
//         <motion.h1
//           initial={{ opacity: 0, y: 15 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600"
//         >
//           {topic.title}
//         </motion.h1>

//         {topic.description && (
//           <p className="mt-5 text-xl text-gray-700 dark:text-gray-300 leading-8">
//             {topic.description}
//           </p>
//         )}

//         <article className="mt-10 prose max-w-none dark:prose-invert">
//           {nodes.map((n, i) => renderNode(n, `n-${i}`))}
//         </article>
//       </main>

//       {/* --------------------- BACK TO TOP --------------------- */}
//       <button
//         onClick={() =>
//           window.scrollTo({
//             top: 0,
//             behavior: "smooth",
//           })
//         }
//         className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl"
//       >
//         <ArrowUp size={22} />
//       </button>
//     </div>
//   );
// }

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
// import Markdown from "react-markdown";
import ReactMarkdown from "react-markdown";

// Highlight.js themes
import "highlight.js/styles/github.css";               // Light mode
import "highlight.js/styles/github-dark-dimmed.css";   // Dark mode

javascript && hljs.registerLanguage("javascript", javascript);
xml && hljs.registerLanguage("xml", xml);
cssLang && hljs.registerLanguage("css", cssLang);
python && hljs.registerLanguage("python", python);
bash && hljs.registerLanguage("bash", bash);
jsonLang && hljs.registerLanguage("json", jsonLang);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// ======================================================
// CODE BLOCK COMPONENT
// ======================================================
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

// ======================================================
// MAIN TOPIC DETAIL PAGE
// ======================================================
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


  // ======================================================
  // FETCH TOPIC
  // ======================================================
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



  // ======================================================
  // BACK TO TOP BUTTON LOGIC
  // ======================================================
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ======================================================
  // LOADING & NOT FOUND
  // ======================================================
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

  // ======================================================
  // RENDER TIPTAP NODES
  // ======================================================
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


  // ======================================================
  // FINAL PAGE LAYOUT
  // ======================================================
  return (
    <div
      className={`relative w-full min-h-screen transition-colors duration-500 ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"
        }`}
    >
      <div className="flex flex-col lg:flex-row w-full px-4 md:px-10">
        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}
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
                {/* <p className="whitespace-pre-line">{summary}</p> */}
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

          {/* MAIN ARTICLE CONTENT */}
          <article
            className={`mt-8 prose max-w-none ${textColorClass}`}
          >
            {contentNodes.map((n, i) => renderNode(n, `node-${i}`))}
          </article>

          {/* ======================================================
              YOUTUBE / VIDEO SECTION
          ====================================================== */}
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

        {/* ======================================================
            SIDEBAR
        ====================================================== */}
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

      {/* ======================================================
          BACK TO TOP BUTTON
      ====================================================== */}
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
