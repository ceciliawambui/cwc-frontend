// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { motion } from "framer-motion";
// import AnimatedBackground from "../../../components/AnimatedBackground";
// import ThemeToggle from "../../../components/ThemeToggle";

// export default function TopicDetail() {
//   const { slug } = useParams(); // from /topic/:slug
//   const [topic, setTopic] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const BASE_URL =
//     import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

//   useEffect(() => {
//     const fetchTopic = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/topics?slug=${slug}`);
//         if (res.data.length > 0) setTopic(res.data[0]);
//         else setError("Topic not found.");
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load topic.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTopic();
//   }, [slug]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400 animate-pulse text-lg">
//         Loading topic...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex justify-center items-center h-screen text-red-500 dark:text-red-400 text-lg">
//         {error}
//       </div>
//     );

//   return (
//     <div className="min-h-screen relative overflow-hidden transition-colors duration-700 ease-in-out bg-gray-50 dark:bg-gray-950">
//       <AnimatedBackground />

//       <div className="relative z-10 container mx-auto px-6 py-10">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-12">
//           {topic?.course ? (
//             <Link
//               to={`/courses/${topic.course.id}`} // correct course slug
//               className="text-sm text-indigo-600 dark:text-pink-400 hover:underline hover:text-indigo-700 dark:hover:text-pink-300 transition-colors"
//             >
//               ← Back to {topic.course.title}
//             </Link>
//           ) : null}
//           <ThemeToggle />
//         </div>

//         {/* Topic Hero */}
//         <motion.section
//           className="rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md mb-10"
//           initial={{ opacity: 0, y: 25 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 mb-4">
//             {topic.title}
//           </h1>

//           <p className="text-gray-800 dark:text-gray-300 leading-relaxed text-lg">
//             {topic.description || "Detailed notes and tutorials for this topic."}
//           </p>

//           {topic.video_url && (
//             <div className="mt-6 aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//               <iframe
//                 src={topic.video_url}
//                 title={topic.title}
//                 className="w-full h-full"
//                 frameBorder="0"
//                 allowFullScreen
//               ></iframe>
//             </div>
//           )}
//         </motion.section>

//         {/* Content Blocks */}
//         {topic.content && topic.content.length > 0 && (
//           <motion.section
//             className="space-y-6 mb-20"
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.1 }}
//           >
//             {topic.content.map((block, idx) => {
//               switch (block.type) {
//                 case "h2":
//                   return (
//                     <h2
//                       key={idx}
//                       className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6"
//                     >
//                       {block.text}
//                     </h2>
//                   );
//                 case "p":
//                   return (
//                     <p key={idx} className="text-gray-800 dark:text-gray-300 leading-relaxed">
//                       {block.text}
//                     </p>
//                   );
//                 case "code":
//                   return (
//                     <div key={idx} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
//                       <pre className="font-mono text-sm text-gray-900 dark:text-gray-100">
//                         {block.code}
//                       </pre>
//                       {block.explanation && (
//                         <p className="text-gray-700 dark:text-gray-300 mt-2">{block.explanation}</p>
//                       )}
//                     </div>
//                   );
//                 default:
//                   return null;
//               }
//             })}
//           </motion.section>
//         )}

//         {/* Footer */}
//         {topic?.course && (
//           <div className="text-center mb-10">
    
//             <Link
//               to={`/courses/${topic.course.id}`}
//               className="inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//             >
//              ← Back to {topic.course.title}
//             </Link>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import AnimatedBackground from "../../../components/AnimatedBackground";
import ThemeToggle from "../../../components/ThemeToggle";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Interactive code block component
function InteractiveCodeBlock({ code, language }) {
  const [editorCode, setEditorCode] = useState(code || "");
  const [output, setOutput] = useState("");

  const runCode = () => {
    try {
      if (language === "javascript") {
        const result = Function(`"use strict"; ${editorCode}`)();
        setOutput(String(result));
      } else if (language === "html") {
        const newWindow = window.open("", "_blank");
        newWindow.document.write(editorCode);
        newWindow.document.close();
        setOutput("Opened preview in new tab.");
      } else {
        setOutput("Only JS and HTML execution supported in-browser.");
      }
    } catch (err) {
      setOutput(err.message);
    }
  };

  return (
    <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <textarea
        className="w-full h-40 p-2 font-mono text-sm rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 mb-2"
        value={editorCode}
        onChange={(e) => setEditorCode(e.target.value)}
      />
      <button
        onClick={runCode}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:scale-105 transition-transform mb-2"
      >
        Run
      </button>
      {output && (
        <pre className="bg-gray-200 dark:bg-gray-900 p-3 rounded font-mono text-sm overflow-x-auto">
          {output}
        </pre>
      )}
    </div>
  );
}

// Recursive TipTap JSON renderer
const renderNode = (node, idx) => {
  switch (node.type) {
    case "heading": {
      const level = node.attrs?.level || 1;
      const Tag = `h${level}`;
      return (
        <Tag key={idx} className={`mt-6 font-bold text-gray-900 dark:text-gray-100 ${level === 1 ? "text-3xl" : "text-2xl"}`}>
          {node.content?.map((c, i) => c.text || "").join("")}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={idx} className="text-gray-800 dark:text-gray-300 leading-relaxed text-lg">
          {node.content?.map((c) => c.text).join("")}
        </p>
      );
    case "codeBlock": {
      const lang = node.attrs?.language || "javascript";
      const code = node.content?.map((c) => c.text).join("") || "";
      return <InteractiveCodeBlock key={idx} code={code} language={lang} />;
    }
    case "youtube": {
      const src = node.attrs?.src;
      if (!src) return null;
      return (
        <div key={idx} className="my-6 aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
          <iframe src={src} title={`youtube-${idx}`} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
        </div>
      );
    }
    case "bulletList":
      return (
        <ul key={idx} className="list-disc pl-6 my-2 text-gray-800 dark:text-gray-300">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={idx} className="list-decimal pl-6 my-2 text-gray-800 dark:text-gray-300">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );
    case "listItem":
      return (
        <li key={idx} className="mb-1">
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );
    case "blockquote":
      return (
        <blockquote key={idx} className="pl-4 border-l-4 border-indigo-500 text-gray-700 dark:text-gray-300 my-3">
          {node.content?.map((c) => c.text).join("")}
        </blockquote>
      );
    default:
      return null;
  }
};

export default function TopicDetail() {
  const { slug } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/topics?slug=${slug}`);
        if (res.data.length > 0) setTopic(res.data[0]);
        else setError("Topic not found.");
      } catch (err) {
        console.error(err);
        setError("Failed to load topic.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [slug]);

  if (loading)
    return <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400 animate-pulse text-lg">Loading topic...</div>;
  if (error)
    return <div className="flex justify-center items-center h-screen text-red-500 dark:text-red-400 text-lg">{error}</div>;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-700 ease-in-out">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-12">
          {topic?.course && (
            <Link
              to={`/courses/${topic.course.id}`}
              className="text-sm text-indigo-600 dark:text-pink-400 hover:underline hover:text-indigo-700 dark:hover:text-pink-300 transition-colors"
            >
              ← Back to {topic.course.title}
            </Link>
          )}
          <ThemeToggle />
        </div>

        <motion.section
          className="rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md mb-10"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 mb-4">{topic.title}</h1>
          <p className="text-gray-800 dark:text-gray-300 leading-relaxed text-lg">{topic.description || "Detailed notes and tutorials for this topic."}</p>
        </motion.section>

        {topic.content?.content && topic.content.content.length > 0 && (
          <motion.section className="space-y-8 mb-20" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            {topic.content.content.map((node, idx) => renderNode(node, idx))}
          </motion.section>
        )}
      </div>
    </div>
  );
}
