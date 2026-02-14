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
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// // eslint-disable-next-line no-unused-vars
// import { motion, useScroll, useSpring } from "framer-motion";
// import {
//   FiClock, FiCopy, FiCheck, FiBook, FiVideo,
//   FiArrowLeft, FiHash, FiCalendar, FiShare2, FiArrowRight,
//   FiChevronRight, FiArrowUp
// } from "react-icons/fi";
// import toast from "react-hot-toast";
// import client from "../../auth/api";
// import { useTheme } from "../../../context/ThemeContext";

// // Syntax Highlighting
// import hljs from "highlight.js";
// import "highlight.js/styles/atom-one-dark.css";

// // HTML Parsing
// import DOMPurify from "dompurify";
// import parse, { Element, domToReact} from "html-react-parser";


// const ReadingProgress = ({ theme }) => {
//   const { scrollYProgress } = useScroll();
//   const scaleX = useSpring(scrollYProgress, {
//     stiffness: 100,
//     damping: 30,
//     restDelta: 0.001
//   });

//   const gradientColor = theme === "dark"
//     ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
//     : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600";

//   return (
//     <motion.div
//       className={`fixed top-0 left-0 right-0 h-1.5 ${gradientColor} origin-left z-[100]`}
//       style={{ scaleX }}
//     />
//   );
// };


// /* ==========================================================================
//    UTILITY HELPERS
//    ========================================================================== */

// function decodeHtml(html) {
//   if (!html) return "";
//   const txt = document.createElement("textarea");
//   txt.innerHTML = html;
//   return txt.value;
// }

// function extractTextFromDomNode(node) {
//   if (!node) return "";
//   if (node.type === "text") return node.data;
//   if (node.children && node.children.length > 0) {
//     return node.children.map(extractTextFromDomNode).join("");
//   }
//   return "";
// }

// function cleanCodeString(rawString) {
//   if (!rawString) return "";
//   return rawString.replace(/\u00A0/g, " ").replace(/&nbsp;/g, " ");
// }

// function injectHeadingIDs(html) {
//   if (!html) return "";
//   const temp = document.createElement("div");
//   temp.innerHTML = html;
//   const headings = temp.querySelectorAll("h1, h2, h3, h4, h5, h6");
//   headings.forEach((h, idx) => {
//     const id = (h.textContent || "")
//       .toLowerCase()
//       .trim()
//       .replace(/\s+/g, "-")
//       .replace(/[^\w-]/g, "") + "-" + idx;
//     h.setAttribute("id", id);
//   });
//   return temp.innerHTML;
// }

// // Convert inline-styled paragraphs to proper headings
// function convertInlineStyledParagraphsToHeadings(html) {
//   if (!html) return "";
//   const temp = document.createElement("div");
//   temp.innerHTML = html;
//   const paragraphs = temp.querySelectorAll("p[style]");
  
//   paragraphs.forEach((p) => {
//     const style = p.getAttribute("style");
//     if (!style) return;
    
//     const sizeMatch = style.match(/font-size:\s*(\d+)px/i);
//     if (!sizeMatch) return;
    
//     const size = parseInt(sizeMatch[1]);
//     let level = null;
    
//     if (size >= 32) level = "h1";
//     else if (size >= 26) level = "h2";
//     else if (size >= 22) level = "h3";
//     else if (size >= 18) level = "h4";
    
//     if (level) {
//       const h = document.createElement(level);
//       h.innerHTML = p.innerHTML;
//       p.replaceWith(h);
//     }
//   });
  
//   return temp.innerHTML;
// }

// /* ==========================================================================
//    CODE BLOCK COMPONENT
//    ========================================================================== */

// const CodeBlock = ({ code, language }) => {
//   const [copied, setCopied] = useState(false);
//   const codeRef = useRef(null);

//   useEffect(() => {
//     if (codeRef.current && code) {
//       let cleanLang = language;
//       if (cleanLang && cleanLang.startsWith("language-")) {
//         cleanLang = cleanLang.replace("language-", "");
//       }

//       try {
//         const result = cleanLang && hljs.getLanguage(cleanLang)
//           ? hljs.highlight(code, { language: cleanLang })
//           : hljs.highlightAuto(code);

//         codeRef.current.innerHTML = result.value;
//         codeRef.current.classList.add("hljs");
//       } catch (e) {
//         console.error("Highlighting error:", e);
//         codeRef.current.textContent = code;
//       }
//     }
//   }, [code, language]);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(code);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error("Failed to copy", err);
//     }
//   };

//   return (
//     <motion.div
//       className="my-8 rounded-2xl overflow-hidden bg-[#0d1117] border border-gray-700/50 shadow-2xl group ring-1 ring-white/10"
//       initial={{ opacity: 0, y: 10 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       viewport={{ once: true }}
//     >
//       <div className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-gray-800 select-none">
//         <div className="flex items-center gap-3">
//           <div className="flex gap-1.5">
//             <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
//             <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
//             <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
//           </div>
//           {language && (
//             <span className="text-xs font-mono text-gray-400 uppercase opacity-70">
//               {language.replace("language-", "")}
//             </span>
//           )}
//         </div>

//         <button
//           onClick={handleCopy}
//           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-white transition-all bg-white/5 hover:bg-white/15 rounded-lg border border-gray-700/50 hover:border-gray-500"
//         >
//           {copied ? <FiCheck className="text-emerald-400" size={14} /> : <FiCopy size={14} />}
//           {copied ? "COPIED" : "COPY"}
//         </button>
//       </div>

//       <div className="relative overflow-x-auto">
//         <pre className="m-0 !p-6 !bg-transparent">
//           <code
//             ref={codeRef}
//             className="font-mono text-sm leading-relaxed !text-white !bg-transparent"
//           >
//             {code}
//           </code>
//         </pre>
//       </div>
//     </motion.div>
//   );
// };

// /* ==========================================================================
//    CONTENT RENDERER COMPONENT - THE MAIN FIX
//    ========================================================================== */

// const ContentRenderer = ({ htmlContent, theme = "light" }) => {
//   const processedHtml = useMemo(() => {
//     if (!htmlContent) return "";

//     let decoded = decodeHtml(htmlContent);
    
//     // Convert inline-styled paragraphs to proper headings
//     decoded = convertInlineStyledParagraphsToHeadings(decoded);
    
//     // Merge broken code blocks
//     decoded = decoded.replace(/<\/code>\s*<\/pre>\s*<pre[^>]*>\s*<code[^>]*>/gi, "\n");
//     decoded = decoded.replace(/<\/pre>\s*<pre[^>]*>/gi, "\n");
    
//     // Remove empty paragraphs
//     decoded = decoded.replace(/<p><\/p>/g, "");
//     decoded = decoded.replace(/<p>\s*<\/p>/g, "");
    
//     // Clean up BlockNote artifacts
//     decoded = decoded.replace(/data-id="[^"]*"/g, "");
//     decoded = decoded.replace(/data-content-type="[^"]*"/g, "");
    
//     const clean = DOMPurify.sanitize(decoded, {
//       USE_PROFILES: { html: true },
//       ADD_TAGS: ["iframe", "img", "pre", "code", "span", "figure"],
//       ADD_ATTR: [
//         "style", "class", "id", "src", "alt", "allow", "allowfullscreen",
//         "frameborder", "scrolling", "data-language", "width", "height"
//       ],
//       FORBID_TAGS: ["script"],
//       ALLOWED_URI_REGEXP: /^https?:\/\//i,
//     });

//     return injectHeadingIDs(clean);
//   }, [htmlContent]);

//   const options = {
//     replace: (domNode) => {
//       // Handle Code Blocks
//       if (domNode instanceof Element && domNode.name === "pre") {
//         const codeNode = domNode.children?.find((c) => c.name === "code");

//         if (codeNode) {
//           let language = codeNode.attribs?.class || "plaintext";
//           if (domNode.attribs?.["data-language"]) {
//             language = domNode.attribs["data-language"];
//           }

//           const rawCode = cleanCodeString(extractTextFromDomNode(codeNode));
//           if (!rawCode.trim()) return null;

//           return (
//             <div className="not-prose max-w-full">
//               <CodeBlock code={rawCode} language={language} />
//             </div>
//           );
//         }
//       }

//       // Handle Images
//       if (domNode instanceof Element && domNode.name === "img") {
//         return (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.96 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//             viewport={{ once: true }}
//             className="my-10"
//           >
//             <img
//               src={domNode.attribs.src}
//               alt={domNode.attribs.alt || "Content Image"}
//               className="rounded-2xl shadow-xl w-full border border-gray-200 dark:border-gray-800"
//               loading="lazy"
//             />
//           </motion.div>
//         );
//       }

//       // Handle Headings - ensure proper styling
//       if (domNode instanceof Element && /^h[1-6]$/.test(domNode.name)) {
//         const HeadingTag = domNode.name;
//         return (
//           <HeadingTag
//             id={domNode.attribs?.id}
//             className={`
//               ${HeadingTag === 'h1' ? 'text-4xl font-black mb-6 mt-12' : ''}
//               ${HeadingTag === 'h2' ? 'text-3xl font-bold mb-5 mt-10' : ''}
//               ${HeadingTag === 'h3' ? 'text-2xl font-semibold mb-4 mt-8' : ''}
//               ${HeadingTag === 'h4' ? 'text-xl font-semibold mb-3 mt-6' : ''}
//               ${HeadingTag === 'h5' ? 'text-lg font-semibold mb-2 mt-4' : ''}
//               ${HeadingTag === 'h6' ? 'text-base font-semibold mb-2 mt-4' : ''}
//               scroll-mt-32
//               ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
//             `}
//           >
//             {domToReact(domNode.children, options)}
//           </HeadingTag>
//         );
//       }

//       // Handle Lists - ensure proper styling
//       if (domNode instanceof Element && (domNode.name === "ul" || domNode.name === "ol")) {
//         const ListTag = domNode.name;
//         return (
//           <ListTag
//             className={`
//               my-6 space-y-2
//               ${ListTag === 'ul' ? 'list-disc' : 'list-decimal'}
//               ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
//               pl-6 marker:text-blue-500
//             `}
//           >
//             {domToReact(domNode.children, options)}
//           </ListTag>
//         );
//       }

//       // Handle List Items
//       if (domNode instanceof Element && domNode.name === "li") {
//         return (
//           <li className="leading-relaxed pl-2">
//             {domToReact(domNode.children, options)}
//           </li>
//         );
//       }

//       // Handle Paragraphs
//       if (domNode instanceof Element && domNode.name === "p") {
//         return (
//           <p className={`
//             leading-[1.8] mb-6 text-lg
//             ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
//           `}>
//             {domToReact(domNode.children, options)}
//           </p>
//         );
//       }

//       // Handle Blockquotes
//       if (domNode instanceof Element && domNode.name === "blockquote") {
//         return (
//           <blockquote className={`
//             my-6 border-l-4 border-blue-500 pl-6 py-2 rounded-r-lg
//             ${theme === 'dark' 
//               ? 'bg-blue-500/10 text-gray-300' 
//               : 'bg-blue-50 text-gray-700'}
//             italic
//           `}>
//             {domToReact(domNode.children, options)}
//           </blockquote>
//         );
//       }

//       // Handle Links
//       if (domNode instanceof Element && domNode.name === "a") {
//         return (
//           <a
//             href={domNode.attribs.href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-500 hover:text-blue-600 underline decoration-blue-500/30 hover:decoration-blue-600 underline-offset-2 transition-colors"
//           >
//             {domToReact(domNode.children, options)}
//           </a>
//         );
//       }

//       // Handle Bold
//       if (domNode instanceof Element && (domNode.name === "strong" || domNode.name === "b")) {
//         return (
//           <strong className="font-bold">
//             {domToReact(domNode.children, options)}
//           </strong>
//         );
//       }

//       // Handle Italic
//       if (domNode instanceof Element && (domNode.name === "em" || domNode.name === "i")) {
//         return (
//           <em className="italic">
//             {domToReact(domNode.children, options)}
//           </em>
//         );
//       }
//     },
//   };

//   return (
//     <article className="max-w-none w-full">
//       {parse(processedHtml, options)}
//     </article>
//   );
// };


// const TableOfContents = React.memo(({ toc, activeId, theme }) => {
//   if (!toc || toc.length === 0) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.5 }}
//       className={`p-6 rounded-2xl border backdrop-blur-md transition-colors
//         ${theme === "dark"
//           ? "bg-gray-900/80 border-gray-700/50"
//           : "bg-white/80 border-indigo-100/50 shadow-lg shadow-indigo-100/50"}`
//       }
//     >
//       <h4 className={`text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//         <FiBook className="text-blue-500" />
//         Contents
//       </h4>
//       <nav className="space-y-1 relative">
//         {/* Decorative line */}
//         <div className={`absolute left-[5px] top-2 bottom-2 w-px ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />

//         {toc.map((item) => (
//           <a
//             key={item.id}
//             href={`#${item.id}`}
//             onClick={(e) => {
//               e.preventDefault();
//               document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
//             }}
//             className={`
//                block pl-4 py-2 text-sm transition-all relative
//                ${item.level === 3 ? "ml-4" : ""}
//                ${activeId === item.id
//                 ? "text-blue-500 font-semibold"
//                 : theme === 'dark' ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
//               }
//             `}
//           >
//             {activeId === item.id && (
//               <motion.div
//                 layoutId="toc-active"
//                 className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-full bg-blue-500 rounded-full"
//               />
//             )}
//             {item.text}
//           </a>
//         ))}
//       </nav>
//     </motion.div>
//   );
// });
// TableOfContents.displayName = "TableOfContents";

// /* ==========================================================================
//    MAIN PAGE COMPONENT
//    ========================================================================== */
// export default function TopicDetail() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const { theme } = useTheme();

//   const [topic, setTopic] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeId, setActiveId] = useState("");
//   const [recommended, setRecommended] = useState([]);
//   const [recLoading, setRecLoading] = useState(false);
//   const [showBackToTop, setShowBackToTop] = useState(false);

//   // 1. Fetch Topic
//   useEffect(() => {
//     let mounted = true;
//     const fetchTopic = async () => {
//       setLoading(true);
//       try {
//         const res = await client.get(`/api/topics/slug/${slug}/`);
//         if (mounted) setTopic(res.data);
//       } catch (err) {
//         console.error("Topic load failed:", err);
//         toast.error("Failed to load topic");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     fetchTopic();
//     return () => { mounted = false; };
//   }, [slug]);

//   // 2. Fetch Recommended
//   useEffect(() => {
//     if (!topic?.id) return;
//     let mounted = true;
//     const fetchRecommended = async () => {
//       setRecLoading(true);
//       try {
//         const res = await client.get(`/api/topics/${topic.id}/ai-recommended/`);
//         if (mounted) {
//           setRecommended(Array.isArray(res.data) ? res.data : (res.data.results || []));
//         }
//       } catch (err) {
//         console.log(err)
//         // Silently fail for recommendations
//       } finally {
//         if (mounted) setRecLoading(false);
//       }
//     };
//     fetchRecommended();
//     return () => { mounted = false; };
//   }, [topic?.id]);

//   // 3. Scroll Spy for TOC
//   useEffect(() => {
//     if (!topic) return;
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) setActiveId(entry.target.id);
//         });
//       },
//       { rootMargin: "0px 0px -60% 0px" }
//     );
//     const heads = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id]");
//     heads.forEach((h) => observer.observe(h));
//     return () => observer.disconnect();
//   }, [topic]);

//   // 4. Parse TOC from HTML
//   const toc = useMemo(() => {
//     if (!topic?.content_html) return [];
//     const temp = document.createElement("div");
//     temp.innerHTML = decodeHtml(topic.content_html);
//     const headings = temp.querySelectorAll("h1, h2, h3, h4");
//     return Array.from(headings).map((h, idx) => ({
//       id: (h.textContent || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + idx,
//       text: h.textContent,
//       level: Number(h.tagName.replace("H", ""))
//     }));
//   }, [topic]);

//   // 5. Video Embed Helper
//   const videoEmbedUrl = useMemo(() => {
//     if (!topic?.video_url) return null;
//     const match = topic.video_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([\w-]{10,12})/);
//     return match ? `https://www.youtube.com/embed/${match[1]}` : null;
//   }, [topic?.video_url]);

//   // 6. Back to Top Logic
//   useEffect(() => {
//     const onScroll = () => setShowBackToTop(window.scrollY > 400);
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   // LOADING STATE
//   if (loading) {
//     return (
//       <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
//         <p className="text-gray-500 animate-pulse font-medium">Loading knowledge...</p>
//       </div>
//     );
//   }

//   // NOT FOUND STATE
//   if (!topic) {
//     return (
//       <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
//         <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Topic not found</h2>
//         <button onClick={() => navigate("/courses")} className="text-blue-500 hover:underline">← Return to courses</button>
//       </div>
//     );
//   }

//   // --- RENDER ---
//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0B0F15]' : 'bg-gray-50'}`}>
//       <ReadingProgress theme={theme} />

//       <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">

//           {/* LEFT COLUMN: Content */}
//           <main className="lg:col-span-8 w-full">

//             {/* Header */}
//             <motion.header
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//               className="mb-12"
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border 
//                   ${theme === 'dark'
//                     ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
//                     : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
//                   {topic.course_detail?.title || "Topic"}
//                 </span>
//                 <span className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
//                   <FiClock size={14} /> {new Date(topic.created_at).toLocaleDateString()}
//                 </span>
//               </div>

//               <h1 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6 
//                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                 {topic.title}
//               </h1>

//               {topic.description && (
//                 <p className={`text-xl font-light leading-relaxed 
//                    ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//                   {topic.description}
//                 </p>
//               )}
//             </motion.header>

//             {/* Video Section */}
//             {videoEmbedUrl && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.1 }}
//                 className="mb-14 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video"
//               >
//                 <iframe
//                   src={videoEmbedUrl}
//                   className="w-full h-full"
//                   title="Topic Video"
//                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                   allowFullScreen
//                 />
//               </motion.div>
//             )}

//             {/* Main Article Content */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="min-h-[200px]"
//             >
//               <ContentRenderer htmlContent={topic.content_html} theme={theme} />
//             </motion.div>

//             {/* Footer Navigation */}
//             <div className={`mt-16 pt-8 border-t flex justify-between items-center ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
//               <button
//                 onClick={() => navigate(`/courses/${topic.course_detail?.id || ''}`)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
//                    ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
//               >
//                 <FiArrowLeft /> Back to Course
//               </button>

//               <button
//                 onClick={() => {
//                   navigator.clipboard.writeText(window.location.href);
//                   toast.success("Link copied!");
//                 }}
//                 className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
//               >
//                 <FiShare2 />
//               </button>
//             </div>
//           </main>

//           {/* RIGHT COLUMN: Sidebar (Sticky) */}
//           <aside className="hidden lg:block lg:col-span-4 relative">
//             <div className="sticky top-28 space-y-8">

//               <TableOfContents toc={toc} activeId={activeId} theme={theme} />

//               {/* Recommendations */}
//               <div className={`p-6 rounded-2xl border transition-colors
//                  ${theme === 'dark'
//                   ? 'bg-gray-900/40 border-gray-800'
//                   : 'bg-white border-gray-200 shadow-sm'}`}
//               >
//                 <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2
//                    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                   <FiArrowRight className="text-purple-500" /> Recommended
//                 </h4>

//                 {recLoading ? (
//                   <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
//                 ) : recommended.length === 0 ? (
//                   <div className="py-2 text-sm text-gray-500 italic">No recommendations yet.</div>
//                 ) : (
//                   <div className="space-y-4">
//                     {recommended.map((rec, i) => (
//                       <div
//                         key={i}
//                         onClick={() => navigate(rec.slug ? `/topics/slug/${rec.slug}` : `/topics/${rec.id}`)}
//                         className={`group cursor-pointer p-3 rounded-xl transition-all border
//                           ${theme === 'dark'
//                             ? 'hover:bg-gray-800 border-transparent hover:border-gray-700'
//                             : 'hover:bg-indigo-50 border-transparent hover:border-indigo-100'}`}
//                       >
//                         <h5 className={`text-sm font-semibold mb-1 group-hover:text-blue-500 transition-colors
//                            ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
//                           {rec.title}
//                         </h5>
//                         <p className="text-xs text-gray-500 line-clamp-2">{rec.description}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//             </div>
//           </aside>

//         </div>
//       </div>

//       {/* Back to Top */}
//       <motion.button
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: showBackToTop ? 1 : 0, scale: showBackToTop ? 1 : 0.8 }}
//         onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//         className={`fixed right-8 bottom-8 z-50 p-4 rounded-full shadow-2xl transition-transform hover:scale-110 focus:outline-none
//            ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'}`}
//       >
//         <FiArrowUp size={20} />
//       </motion.button>

//     </div>
//   );
// }
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import {
  Clock,
  Copy,
  Check,
  BookOpen,
  Video,
  ArrowLeft,
  Share2,
  ArrowRight,
  ArrowUp,
  List,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import client from "../../auth/api";
import { useTheme } from "../../../context/ThemeContext";

// Syntax Highlighting
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// HTML Parsing
import DOMPurify from "dompurify";
import parse, { Element, domToReact } from "html-react-parser";

/* ================================
   Reading Progress Bar
================================ */
const ReadingProgress = ({ theme }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 origin-left z-[100]
        ${theme === "dark" ? "bg-blue-500" : "bg-blue-600"}`}
      style={{ scaleX }}
    />
  );
};

/* ================================
   Utility Helpers
================================ */
function decodeHtml(html) {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function extractTextFromDomNode(node, preserveFormatting = false) {
  if (!node) return "";
  if (node.type === "text") return node.data;
  
  if (node.type === "tag" || (node instanceof Element)) {
    if (node.name) {
      let html = `<${node.name}`;
      
      if (node.attribs && typeof node.attribs === 'object') {
        for (const [key, value] of Object.entries(node.attribs)) {
          if (key !== 'class' || !value.includes('language-')) {
            html += ` ${key}="${value}"`;
          }
        }
      }
      html += '>';
      
      if (node.children && node.children.length > 0) {
        html += node.children.map(child => extractTextFromDomNode(child, true)).join('');
      }
      
      html += `</${node.name}>`;
      return html;
    }
  }
  
  if (node.children && node.children.length > 0) {
    return node.children.map(child => extractTextFromDomNode(child, preserveFormatting)).join(preserveFormatting ? "" : "");
  }
  return "";
}

function decodeHtmlEntities(text) {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  
  let decoded = text;
  let previousDecoded = '';
  
  for (let i = 0; i < 3 && decoded !== previousDecoded; i++) {
    previousDecoded = decoded;
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }
  
  return decoded;
}

function cleanCodeString(rawString) {
  if (!rawString) return "";
  return rawString.replace(/\u00A0/g, " ").replace(/&nbsp;/g, " ");
}

function injectHeadingIDs(html) {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const headings = temp.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headings.forEach((h, idx) => {
    const id = (h.textContent || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "") + "-" + idx;
    h.setAttribute("id", id);
  });
  return temp.innerHTML;
}

function convertInlineStyledParagraphsToHeadings(html) {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const paragraphs = temp.querySelectorAll("p[style]");
  
  paragraphs.forEach((p) => {
    const style = p.getAttribute("style");
    if (!style) return;
    
    const sizeMatch = style.match(/font-size:\s*(\d+)px/i);
    if (!sizeMatch) return;
    
    const size = parseInt(sizeMatch[1]);
    let level = null;
    
    if (size >= 32) level = "h1";
    else if (size >= 26) level = "h2";
    else if (size >= 22) level = "h3";
    else if (size >= 18) level = "h4";
    
    if (level) {
      const h = document.createElement(level);
      h.innerHTML = p.innerHTML;
      p.replaceWith(h);
    }
  });
  
  return temp.innerHTML;
}

/* ================================
   Code Block Component
================================ */
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && code) {
      let cleanLang = language;
      if (cleanLang && cleanLang.startsWith("language-")) {
        cleanLang = cleanLang.replace("language-", "");
      }

      try {
        const result = cleanLang && hljs.getLanguage(cleanLang)
          ? hljs.highlight(code, { language: cleanLang })
          : hljs.highlightAuto(code);

        codeRef.current.innerHTML = result.value;
        codeRef.current.classList.add("hljs");
      } catch (e) {
        console.error("Highlighting error:", e);
        codeRef.current.textContent = code;
      }
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Code copied!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <motion.div
      className="my-8 rounded-xl overflow-hidden bg-[#0d1117] border border-slate-800 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-lg"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="relative overflow-x-auto">
        <pre className="m-0 p-5 bg-transparent">
          <code
            ref={codeRef}
            className="font-mono text-sm leading-relaxed text-white bg-transparent"
          >
            {code}
          </code>
        </pre>
      </div>
    </motion.div>
  );
};

/* ================================
   Content Renderer Component
================================ */
const ContentRenderer = ({ htmlContent, theme = "light" }) => {
  const processedHtml = useMemo(() => {
    if (!htmlContent) return "";

    let decoded = decodeHtml(htmlContent);
    decoded = convertInlineStyledParagraphsToHeadings(decoded);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = decoded;
    
    const preElements = tempDiv.querySelectorAll('pre');
    preElements.forEach(pre => {
      const codeElement = pre.querySelector('code');
      if (codeElement) {
        let codeContent = codeElement.innerHTML;
        
        const tempDecoder = document.createElement('textarea');
        tempDecoder.innerHTML = codeContent;
        let decodedContent = tempDecoder.value;
        
        if (decodedContent.includes('<') && decodedContent.includes('>')) {
          const base64 = btoa(unescape(encodeURIComponent(decodedContent)));
          pre.setAttribute('data-code-base64', base64);
          
          const escaped = decodedContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
          pre.setAttribute('data-code-content', escaped);
          
          codeElement.innerHTML = escaped;
        } else {
          const textContent = codeElement.textContent || codeElement.innerText || '';
          const base64 = btoa(unescape(encodeURIComponent(textContent)));
          pre.setAttribute('data-code-base64', base64);
          pre.setAttribute('data-code-content', textContent);
        }
      }
    });
    
    decoded = tempDiv.innerHTML;
    decoded = decoded.replace(/<\/code>\s*<\/pre>\s*<pre[^>]*>\s*<code[^>]*>/gi, "\n");
    decoded = decoded.replace(/<\/pre>\s*<pre[^>]*>/gi, "\n");
    decoded = decoded.replace(/<p><\/p>/g, "");
    decoded = decoded.replace(/<p>\s*<\/p>/g, "");
    decoded = decoded.replace(/data-id="[^"]*"/g, "");
    decoded = decoded.replace(/data-content-type="[^"]*"/g, "");
    
    const clean = DOMPurify.sanitize(decoded, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["iframe", "img", "pre", "code", "span", "figure"],
      ADD_ATTR: [
        "style", "class", "id", "src", "alt", "allow", "allowfullscreen",
        "frameborder", "scrolling", "data-language", "data-code-content", 
        "data-code-base64", "width", "height"
      ],
      FORBID_TAGS: ["script", "style"],
      ALLOWED_URI_REGEXP: /^https?:\/\//i,
      KEEP_CONTENT: true,
    });

    return injectHeadingIDs(clean);
  }, [htmlContent]);

  const options = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === "pre") {
        const codeNode = domNode.children?.find((c) => c.name === "code");

        if (codeNode) {
          let language = codeNode.attribs?.class || "plaintext";
          if (domNode.attribs?.["data-language"]) {
            language = domNode.attribs["data-language"];
          }

          let rawCode = null;
          
          if (domNode.attribs?.["data-code-base64"]) {
            try {
              rawCode = decodeURIComponent(escape(atob(domNode.attribs["data-code-base64"])));
            } catch (e) {
              console.warn("Failed to decode base64 code content", e);
            }
          }
          
          if (!rawCode && domNode.attribs?.["data-code-content"]) {
            rawCode = decodeHtmlEntities(domNode.attribs["data-code-content"]);
          }
          
          if (!rawCode && codeNode.children) {
            const hasElementChildren = codeNode.children.some(child => 
              child.type === 'tag' || (child.name && child.name !== 'text')
            );
            
            if (hasElementChildren) {
              rawCode = extractTextFromDomNode(codeNode, true);
            } else {
              rawCode = extractTextFromDomNode(codeNode);
            }
          }
          
          if (!rawCode) {
            rawCode = extractTextFromDomNode(codeNode);
          }
          
          rawCode = cleanCodeString(rawCode);
          
          if (!rawCode.trim()) return null;

          return (
            <div className="not-prose max-w-full">
              <CodeBlock code={rawCode} language={language} theme={theme} />
            </div>
          );
        }
      }

      if (domNode instanceof Element && domNode.name === "code" && domNode.parent?.name !== "pre") {
        const codeText = extractTextFromDomNode(domNode);
        
        return (
          <code className={`
            px-2 py-0.5 rounded-md text-sm font-mono
            ${theme === 'dark' 
              ? 'bg-slate-800 text-pink-400' 
              : 'bg-slate-100 text-pink-600'}
          `}>
            {codeText}
          </code>
        );
      }

      if (domNode instanceof Element && domNode.name === "img") {
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="my-8"
          >
            <img
              src={domNode.attribs.src}
              alt={domNode.attribs.alt || "Content Image"}
              className="rounded-xl shadow-lg w-full border border-slate-200 dark:border-slate-800"
              loading="lazy"
            />
          </motion.div>
        );
      }

      if (domNode instanceof Element && /^h[1-6]$/.test(domNode.name)) {
        const HeadingTag = domNode.name;
        return (
          <HeadingTag
            id={domNode.attribs?.id}
            className={`
              ${HeadingTag === 'h1' ? 'text-3xl font-bold mb-6 mt-12' : ''}
              ${HeadingTag === 'h2' ? 'text-2xl font-bold mb-5 mt-10' : ''}
              ${HeadingTag === 'h3' ? 'text-xl font-semibold mb-4 mt-8' : ''}
              ${HeadingTag === 'h4' ? 'text-lg font-semibold mb-3 mt-6' : ''}
              ${HeadingTag === 'h5' ? 'text-base font-semibold mb-2 mt-4' : ''}
              ${HeadingTag === 'h6' ? 'text-sm font-semibold mb-2 mt-4' : ''}
              scroll-mt-32
              ${theme === 'dark' ? 'text-white' : 'text-slate-900'}
            `}
          >
            {domToReact(domNode.children, options)}
          </HeadingTag>
        );
      }

      if (domNode instanceof Element && domNode.name === "ul") {
        return (
          <ul className={`my-6 space-y-2 list-disc pl-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} marker:text-blue-500`}>
            {domToReact(domNode.children, options)}
          </ul>
        );
      }

      if (domNode instanceof Element && domNode.name === "ol") {
        return (
          <ol className={`my-6 space-y-2 list-decimal pl-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} marker:text-blue-500`}>
            {domToReact(domNode.children, options)}
          </ol>
        );
      }

      if (domNode instanceof Element && domNode.name === "li") {
        return (
          <li className="leading-relaxed pl-2">
            {domToReact(domNode.children, options)}
          </li>
        );
      }

      if (domNode instanceof Element && domNode.name === "p") {
        return (
          <p className={`leading-relaxed mb-6 text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {domToReact(domNode.children, options)}
          </p>
        );
      }

      if (domNode instanceof Element && domNode.name === "blockquote") {
        return (
          <blockquote className={`my-6 border-l-4 border-blue-500 pl-6 py-2 rounded-r-lg ${theme === 'dark' ? 'bg-blue-500/10 text-slate-300' : 'bg-blue-50 text-slate-700'} italic`}>
            {domToReact(domNode.children, options)}
          </blockquote>
        );
      }

      if (domNode instanceof Element && domNode.name === "a") {
        return (
          <a
            href={domNode.attribs.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline decoration-blue-500/30 hover:decoration-blue-600 underline-offset-2 transition-colors"
          >
            {domToReact(domNode.children, options)}
          </a>
        );
      }

      if (domNode instanceof Element && (domNode.name === "strong" || domNode.name === "b")) {
        return <strong className="font-bold">{domToReact(domNode.children, options)}</strong>;
      }

      if (domNode instanceof Element && (domNode.name === "em" || domNode.name === "i")) {
        return <em className="italic">{domToReact(domNode.children, options)}</em>;
      }

      if (domNode instanceof Element && domNode.name === "hr") {
        return <hr className={`my-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`} />;
      }
    },
  };

  return (
    <article className="max-w-none w-full">
      {parse(processedHtml, options)}
    </article>
  );
};

/* ================================
   Table of Contents Component
================================ */
const TableOfContents = ({ toc, activeId, theme }) => {
  if (!toc || toc.length === 0) return null;

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl border p-6
        ${theme === "dark"
          ? "bg-slate-900/50 border-slate-800"
          : "bg-white border-slate-200"}`}
    >
      <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
        <List size={18} />
        Table of Contents
      </h4>
      <nav className="space-y-1">
        {toc.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`
              block py-2 px-3 text-sm rounded-lg transition-all
              ${item.level === 3 ? "ml-4" : ""}
              ${item.level === 4 ? "ml-8" : ""}
              ${activeId === item.id
                ? `${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'} font-medium`
                : `${textSecondary} hover:${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`
              }
            `}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </motion.div>
  );
};

/* ================================
   Recommendations Component
================================ */
const RecommendationsPanel = ({ recommendations, loading, theme, navigate }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div
      className={`rounded-xl border p-6
        ${theme === 'dark'
          ? 'bg-slate-900/50 border-slate-800'
          : 'bg-white border-slate-200'}`}
    >
      <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
        <Sparkles size={18} />
        Recommended Topics
      </h4>

      {loading ? (
        <div className="py-8 text-center">
          <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2
            ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}
          />
          <p className={`text-xs ${textSecondary}`}>Loading...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <p className={`text-sm ${textSecondary} italic`}>No recommendations yet</p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/topics/by-slug/${rec.slug}`)}
              className={`group cursor-pointer p-3 rounded-lg border transition-all
                ${theme === 'dark'
                  ? 'border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
            >
              <h5 className={`text-sm font-semibold mb-1 group-hover:text-blue-500 transition-colors line-clamp-1 ${textPrimary}`}>
                {rec.title}
              </h5>
              <p className={`text-xs line-clamp-2 ${textSecondary}`}>
                {rec.description || "Learn more about this topic"}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================================
   Loading State
================================ */
const LoadingState = ({ theme }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className={`w-16 h-16 rounded-2xl border-4 border-t-transparent animate-spin mb-6
        ${theme === "dark" ? "border-slate-700" : "border-slate-300"}`}
      />
      <p className={`text-base ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
        Loading topic...
      </p>
    </div>
  );
};

/* ================================
   Main Topic Detail Component
================================ */
export default function TopicDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Fetch Topic
  useEffect(() => {
    let mounted = true;
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/topics/by-slug/${slug}/`);
        if (mounted) setTopic(res.data);
      } catch (err) {
        console.error("Topic load failed:", err);
        toast.error("Failed to load topic");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTopic();
    return () => { mounted = false; };
  }, [slug]);

  // Fetch Recommendations
  useEffect(() => {
    if (!topic?.id) return;
    let mounted = true;
    const fetchRecommended = async () => {
      setRecLoading(true);
      try {
        const res = await client.get(`/api/topics/${topic.id}/recommended/`);
        if (mounted) {
          setRecommended(Array.isArray(res.data) ? res.data : (res.data.results || []));
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (mounted) setRecLoading(false);
      }
    };
    fetchRecommended();
    return () => { mounted = false; };
  }, [topic?.id]);

  // Scroll Spy for TOC
  useEffect(() => {
    if (!topic) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -60% 0px" }
    );
    const heads = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id]");
    heads.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [topic]);

  // Parse TOC from HTML
  const toc = useMemo(() => {
    if (!topic?.content_html) return [];
    const temp = document.createElement("div");
    temp.innerHTML = decodeHtml(topic.content_html);
    const headings = temp.querySelectorAll("h1, h2, h3, h4");
    return Array.from(headings).map((h, idx) => ({
      id: (h.textContent || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + idx,
      text: h.textContent,
      level: Number(h.tagName.replace("H", ""))
    }));
  }, [topic]);

  // Video Embed Helper
  const videoEmbedUrl = useMemo(() => {
    if (!topic?.video_url) return null;
    
    const url = topic.video_url.trim();
    
    const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{10,12})/);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        url: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`
      };
    }
    
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        url: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`
      };
    }
    
    return null;
  }, [topic?.video_url]);

  // Back to Top Logic
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  if (loading) {
    return <LoadingState theme={theme} />;
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Topic not found</h2>
        <button 
          onClick={() => navigate("/courses")} 
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
            ${theme === "dark"
              ? "bg-white text-slate-900 hover:bg-slate-100"
              : "bg-slate-900 text-white hover:bg-slate-800"
            }
            shadow-lg hover:shadow-xl hover:scale-105`}
        >
          Return to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress theme={theme} />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              {/* Breadcrumb */}
              {/* <button
                onClick={() => navigate(`/courses/${topic.course_detail?.slug || ''}`)}
                className={`inline-flex items-center gap-2 text-sm font-medium mb-6
                  ${theme === "dark" ? "text-slate-400 hover:text-slate-300" : "text-slate-600 hover:text-slate-700"}
                  transition-colors group`}
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to {topic.course_detail?.title || "Course"}
              </button> */}

              {/* Meta Info
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border
                  ${theme === 'dark'
                    ? 'bg-blue-900/30 border-blue-800 text-blue-300'
                    : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                  {topic.course_detail?.title || "Topic"}
                </span>
                <span className={`flex items-center gap-1.5 text-sm ${textSecondary}`}>
                  <Clock size={14} />
                  {new Date(topic.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div> */}

              {/* Title */}
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-2 mt-8 leading-tight ${textPrimary}`}>
                {topic.title}
              </h1>

              {/* Description */}
              {topic.description && (
                <p className={`text-lg leading-relaxed ${textSecondary}`}>
                  {topic.description}
                </p>
              )}
            </motion.header>

            {/* Video Section */}
            {topic.video_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-12"
              >
                <div className={`rounded-xl overflow-hidden border
                  ${theme === 'dark' 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-white border-slate-200'}`}
                >
                  <div className={`px-6 py-4 border-b flex items-center gap-2
                    ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}
                  >
                    <Video size={18} className="text-blue-500" />
                    <h3 className={`font-bold text-base ${textPrimary}`}>
                      Video Tutorial
                    </h3>
                  </div>
                  
                  {videoEmbedUrl ? (
                    <div className="relative aspect-video bg-black">
                      <iframe
                        src={videoEmbedUrl.url}
                        className="w-full h-full"
                        title="Topic Video Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        frameBorder="0"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex flex-col items-center justify-center p-12">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4
                        ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <Video size={28} className={textSecondary} />
                      </div>
                      <p className={`text-sm font-medium ${textSecondary}`}>
                        No video available
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none"
            >
              <ContentRenderer htmlContent={topic.content_html} theme={theme} />
            </motion.div>

            {/* Footer Navigation */}
            <div className={`mt-16 pt-8 border-t flex justify-between items-center
              ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => navigate(`/courses/${topic.course_detail?.slug || ''}`)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${theme === 'dark' 
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                    : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'}`}
              >
                <ArrowLeft size={16} />
                Back to Course
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                className={`p-2 rounded-lg transition-colors
                  ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <Share2 size={18} />
              </button>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <TableOfContents toc={toc} activeId={activeId} theme={theme} />
              <RecommendationsPanel 
                recommendations={recommended} 
                loading={recLoading} 
                theme={theme} 
                navigate={navigate}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed right-6 bottom-6 z-50 p-3.5 rounded-xl shadow-lg transition-all hover:scale-110
              ${theme === 'dark' 
                ? 'bg-slate-900 text-white border border-slate-800' 
                : 'bg-white text-slate-900 border border-slate-200'}`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}