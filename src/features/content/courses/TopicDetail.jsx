/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import AnimatedBackground from "../../../components/AnimatedBackground";
import ThemeToggle from "../../../components/ThemeToggle";

export default function TopicDetail() {
  const { slug } = useParams(); // from /topic/:slug
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400 animate-pulse text-lg">
        Loading topic...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 dark:text-red-400 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-700 ease-in-out bg-gray-50 dark:bg-gray-950">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          {topic?.course ? (
            <Link
              to={`/courses/${topic.course.id}`} // correct course slug
              className="text-sm text-indigo-600 dark:text-pink-400 hover:underline hover:text-indigo-700 dark:hover:text-pink-300 transition-colors"
            >
              ← Back to {topic.course.title}
            </Link>
          ) : null}
          <ThemeToggle />
        </div>

        {/* Topic Hero */}
        <motion.section
          className="rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md mb-10"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 mb-4">
            {topic.title}
          </h1>

          <p className="text-gray-800 dark:text-gray-300 leading-relaxed text-lg">
            {topic.description || "Detailed notes and tutorials for this topic."}
          </p>

          {topic.video_url && (
            <div className="mt-6 aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
              <iframe
                src={topic.video_url}
                title={topic.title}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </motion.section>

        {/* Content Blocks */}
        {topic.content && topic.content.length > 0 && (
          <motion.section
            className="space-y-6 mb-20"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {topic.content.map((block, idx) => {
              switch (block.type) {
                case "h2":
                  return (
                    <h2
                      key={idx}
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6"
                    >
                      {block.text}
                    </h2>
                  );
                case "p":
                  return (
                    <p key={idx} className="text-gray-800 dark:text-gray-300 leading-relaxed">
                      {block.text}
                    </p>
                  );
                case "code":
                  return (
                    <div key={idx} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      <pre className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {block.code}
                      </pre>
                      {block.explanation && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2">{block.explanation}</p>
                      )}
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </motion.section>
        )}

        {/* Footer */}
        {topic?.course && (
          <div className="text-center mb-10">
    
            <Link
              to={`/courses/${topic.course.id}`}
              className="inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
             ← Back to {topic.course.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
