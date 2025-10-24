// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { motion } from "framer-motion";
// import AnimatedBackground from "../../../components/AnimatedBackground";
// import ThemeToggle from "../../../components/ThemeToggle";

// export default function CourseDetail() {
//   const { slug } = useParams(); // from route /courses/:slug
//   const [course, setCourse] = useState(null);
//   const [topics, setTopics] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const BASE_URL =
//     import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

//   useEffect(() => {
//     const fetchCourseDetail = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/courses/${slug}/`);
//         setCourse(res.data);
//         if (res.data.topics) setTopics(res.data.topics);
//       } catch (err) {
//         console.error("Error fetching course details:", err);
//         setError("Could not load course details.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCourseDetail();
//   }, [slug]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400 text-lg animate-pulse">
//         Loading course...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex justify-center items-center h-screen text-red-500 dark:text-red-400 text-lg">
//         {error}
//       </div>
//     );

//   if (!course)
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400 text-lg">
//         Course not found.
//       </div>
//     );

//   return (
//     <div className="min-h-screen relative overflow-hidden transition-colors duration-700 ease-in-out">
//       <AnimatedBackground />

//       <div className="relative z-10 container mx-auto px-6 py-20">
//         {/* === Header === */}
//         <header className="flex items-center justify-between mb-12">
//           <Link
//             to="/"
//             className="text-sm text-pink-500 dark:text-pink-900 hover:underline"
//           >
//             ← Back to Courses
//           </Link>
//           <ThemeToggle />
//         </header>

//         {/* === Course Section === */}
//         <motion.section
//           className="rounded-3xl p-8 glass-effect shadow-lg border border-white/20 dark:border-gray-800 backdrop-blur-md"
//           initial={{ opacity: 0, y: 25 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           {/* Title & Meta */}
//           <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 mb-3">
//             {course.title}
//           </h1>

//           {course.category && (
//             <span className="inline-block text-xs uppercase font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-4">
//               {course.category.name}
//             </span>
//           )}

//           <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">
//             {course.description ||
//               "This course provides a curated learning experience filled with practical content and examples."}
//           </p>

//           {/* Creator Info */}
//           <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
//             <p className="text-gray-600 dark:text-gray-400">
//               Created by{" "}
//               <span className="font-semibold text-indigo-600 dark:text-indigo-400">
//                 {course.created_by_name || "Admin"}
//               </span>
//             </p>
//             <p className="text-gray-500 dark:text-gray-400">
//               {new Date(course.created_at).toLocaleDateString()}
//             </p>
//           </div>
//         </motion.section>

//         {/* === Topics Section === */}
//         <motion.section
//           id="topics"
//           className="mt-16"
//           initial={{ opacity: 0, y: 25 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, delay: 0.1 }}
//         >
//           <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
//             Topics Covered
//           </h2>

//           {topics.length === 0 ? (
//             <p className="text-gray-600 dark:text-gray-400">
//               No topics available for this course yet.
//             </p>
//           ) : (
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {topics.map((topic, index) => (
//                 <motion.div
//                   key={topic.id || index}
//                   whileHover={{ scale: 1.03 }}
//                   transition={{ type: "spring", stiffness: 200 }}
//                   className="rounded-2xl p-6 shadow-md glass-effect border border-white/10 dark:border-gray-800 hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300"
//                 >
//                   <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2">
//                     {topic.title}
//                   </h3>
//                   <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
//                     {topic.description ||
//                       "Detailed notes, examples, and explanations will be provided under this topic."}
//                   </p>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </motion.section>

//         {/* === Footer CTA === */}
//         <div className="mt-20 text-center">
//           <Link
//             to="/"
//             className="inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
//           >
//             ← Back to All Courses
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import AnimatedBackground from "../../../components/AnimatedBackground";
import ThemeToggle from "../../../components/ThemeToggle";

export default function CourseDetail() {
  const { id } = useParams();
  const { slug } = useParams(); // from route /courses/:slug
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/courses/${id}/`);
        setCourse(res.data);
        if (res.data.topics) setTopics(res.data.topics);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Could not load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [slug]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400 text-lg animate-pulse">
        Loading course...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 dark:text-red-400 text-lg">
        {error}
      </div>
    );

  if (!course)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 dark:text-gray-400 text-lg">
        Course not found.
      </div>
    );

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-700 ease-in-out bg-gray-50 dark:bg-gray-950">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-6 py-10">
        {/* === Header === */}
        {/* <header className="flex items-center justify-between mb-12">
          <Link
            to="/"
            className="text-sm text-indigo-600 dark:text-pink-400 hover:underline hover:text-indigo-700 dark:hover:text-pink-300 transition-colors"
          >
            ← Back to Courses
          </Link>
          <ThemeToggle />
        </header> */}

        {/* === Course Hero Section === */}
        <motion.section
          className="rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md transition-all"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 mb-4">
            {course.title}
          </h1>

          {course.category && (
            <span className="inline-block text-xs uppercase font-semibold tracking-wide text-indigo-600 dark:text-pink-400 mb-3">
              {course.category.name}
            </span>
          )}

          {/* {course.thumbnail && (
            <div className="mt-4 mb-6">
              <img
                src={`${BASE_URL}${course.thumbnail}`}
                alt={course.title}
                className="rounded-2xl shadow-lg object-cover w-full md:w-3/4 mx-auto border border-gray-200 dark:border-gray-800"
              />
            </div>
          )} */}

          <p className="text-gray-800 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto text-lg">
            {course.description ||
              "This course provides a rich learning experience filled with structured lessons, projects, and practical examples to guide your mastery."}
          </p>

          {/* <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="text-gray-600 dark:text-gray-400">
              Created by{" "}
              <span className="font-semibold text-indigo-700 dark:text-pink-400">
                {course.created_by_name || "Admin"}
              </span>
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {new Date(course.created_at).toLocaleDateString()}
            </p>
          </div> */}
        </motion.section>

        {/* === Topics Section === */}
        <motion.section
          id="topics"
          className="mt-10"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 mb-8">
            Topics Covered
          </h2>

          {topics.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No topics available for this course yet.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id || index}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() => navigate(`/topic/${topic.slug}`)}
                  className="cursor-pointer rounded-2xl p-6 shadow-md bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 hover:border-pink-400 hover:shadow-pink-300/20 dark:hover:shadow-pink-600/10 transition-all duration-300"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                    {topic.description ||
                      "Detailed notes, exercises, and examples will be provided under this topic soon."}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* === Footer CTA === */}
        <div className="mt-20 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            ← Back to All Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

