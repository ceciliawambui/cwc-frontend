// /* eslint-disable no-unused-vars */
// import React, { useEffect, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
//   Edit3,
//   Trash2,
//   Loader2,
//   Plus,
//   X,
//   AlertTriangle,
//   ImageIcon,
//   Tag,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import { toast } from "react-hot-toast";
// import client from "../../features/auth/api";

// const PAGE_SIZE = 8;

// export default function AdminCourses() {
//   const [courses, setCourses] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");

//   const [showModal, setShowModal] = useState(false);
//   const [editingCourse, setEditingCourse] = useState(null);
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     category: "",
//     thumbnail: "",
//     is_published: true, // Added
//   });

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [courseToDelete, setCourseToDelete] = useState(null);

//   const [page, setPage] = useState(1);
//   const [newThisWeek, setNewThisWeek] = useState(0);

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   async function fetchCourses() {
//     setLoading(true);
//     try {
//       const res = await client.get("/courses/");
//       let data = res.data;
  
//       if (Array.isArray(data)) {
//         // OK
//       } else if (Array.isArray(data?.results)) {
//         data = data.results;
//       } else if (Array.isArray(data?.courses)) {
//         data = data.courses;
//       } else {
//         console.error("Unexpected courses response:", res.data);
//         toast.error("Invalid response format from server.");
//         setCourses([]);
//         setFiltered([]);
//         return;
//       }
  
//       setCourses(data);
//       setFiltered(data);
//       computeAnalytics(data);
//       setPage(1);
  
//     } catch (err) {
//       console.error("Failed to load courses:", err);
//       toast.error("Failed to load courses.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function computeAnalytics(data) {
//     const weekAgo = new Date();
//     weekAgo.setDate(weekAgo.getDate() - 7);
//     const count = data.filter(
//       (c) => new Date(c.created_at) >= weekAgo
//     ).length;
//     setNewThisWeek(count);
//   }

//   const categories = useMemo(() => {
//     const setCat = new Set();
//     courses.forEach((c) => {
//       if (c.category) setCat.add(c.category);
//     });
//     return ["all", ...Array.from(setCat).sort()];
//   }, [courses]);

//   useEffect(() => {
//     let out = [...courses];
//     const q = search.trim().toLowerCase();
//     if (q) {
//       out = out.filter(
//         (c) =>
//           (c.title || "").toLowerCase().includes(q) ||
//           (c.description || "").toLowerCase().includes(q) ||
//           (c.category || "").toLowerCase().includes(q)
//       );
//     }
//     if (categoryFilter !== "all") {
//       out = out.filter((c) => c.category === categoryFilter);
//     }
//     setFiltered(out);
//     setPage(1);
//   }, [search, categoryFilter, courses]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const paginated = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filtered.slice(start, start + PAGE_SIZE);
//   }, [filtered, page]);

//   function openAddModal() {
//     setEditingCourse(null);
//     setForm({
//       title: "",
//       description: "",
//       category: "",
//       thumbnail: "",
//       is_published: true, // Default to published
//     });
//     setShowModal(true);
//   }

//   function openEditModal(course) {
//     setEditingCourse(course);
//     setForm({
//       title: course.title || "",
//       description: course.description || "",
//       category: course.category || "",
//       thumbnail: course.thumbnail || "",
//       is_published: course.is_published !== undefined ? course.is_published : true, // Added
//     });
//     setShowModal(true);
//   }

//   function handleChange(e) {
//     const { name, value } = e.target;
//     setForm((s) => ({ ...s, [name]: value }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
  
//     if (!form.title.trim()) {
//       toast.error("Title is required.");
//       return;
//     }
  
//     const formData = new FormData();
//     formData.append("title", form.title.trim());
//     formData.append("description", form.description.trim());
//     formData.append("is_published", form.is_published); // Added
//     if (form.category.trim()) formData.append("category", form.category.trim());
//     if (form.thumbnail instanceof File) {
//       formData.append("thumbnail", form.thumbnail);
//     }
  
//     try {
//       if (editingCourse) {
//         // Use slug for update
//         await client.put(`/courses/${editingCourse.slug}/`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast.success("Course updated successfully.");
//       } else {
//         await client.post("/courses/", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast.success("Course created successfully.");
//       }
  
//       setShowModal(false);
//       fetchCourses();
//     } catch (err) {
//       console.error("Save error:", err.response || err);
//       const msg =
//         err.response?.data?.detail ||
//         err.response?.data?.title?.[0] ||
//         "Failed to save course.";
//       toast.error(msg);
//     }
//   }

//   function confirmDelete(course) {
//     setCourseToDelete(course);
//     setShowDeleteModal(true);
//   }

//   async function handleDeleteConfirmed() {
//     if (!courseToDelete) return;
//     try {
//       // Use slug for delete
//       await client.delete(`/courses/${courseToDelete.slug}/`);
//       toast.success("Course deleted.");
//       setShowDeleteModal(false);
//       setCourseToDelete(null);
//       fetchCourses();
//     } catch (err) {
//       console.error("Delete error:", err);
//       toast.error("Failed to delete course.");
//     }
//   }

//   function renderEmpty() {
//     return (
//       <div className="py-20 text-center text-gray-500 dark:text-gray-400">
//         <ImageIcon className="mx-auto mb-4 text-gray-300" size={36} />
//         <p className="mb-2">No courses yet.</p>
//         <button
//           onClick={openAddModal}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white"
//         >
//           <Plus size={14} /> Add first course
//         </button>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/50 shadow-md backdrop-blur-xl border border-gray-200 dark:border-gray-700"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//     >
//       {/* HEADER */}
//       <div className="flex items-center justify-between gap-4 mb-6">
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
//             Manage Courses
//           </h2>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Add, edit and organize the course listings.
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-4 bg-white/60 dark:bg-gray-900/60 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 shadow-sm">
//             <div className="text-sm text-indigo-600 font-medium">This week</div>
//             <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
//               {newThisWeek}
//             </div>
//           </div>

//           <button
//             onClick={openAddModal}
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg hover:scale-[1.01] transition-transform"
//           >
//             <Plus size={16} /> Add Course
//           </button>
//         </div>
//       </div>

//       {/* SEARCH + FILTER */}
//       <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search courses, descriptions, categories..."
//             className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/50 text-sm focus:ring-2 focus:ring-indigo-500"
//           />
//         </div>

//         <div className="flex items-center gap-3">
//           <select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/50 text-sm"
//           >
//             {categories.map((c) => (
//               <option key={c} value={c}>
//                 {c === "all" ? "All categories" : c}
//               </option>
//             ))}
//           </select>

//           <div className="text-sm text-gray-500">
//             {filtered.length} result{filtered.length !== 1 ? "s" : ""}
//           </div>
//         </div>
//       </div>

//       {/* COURSES GRID */}
//       <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
//         {loading ? (
//           <div className="p-10 text-center text-gray-500">
//             <Loader2 className="animate-spin inline-block mr-2" /> Loading...
//           </div>
//         ) : filtered.length === 0 ? (
//           renderEmpty()
//         ) : (
//           <div className="p-4">
//             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {paginated.map((course) => (
//                 <motion.div
//                   key={course.id}
//                   whileHover={{ y: -4 }}
//                   className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-800"
//                 >
//                   <div className="flex items-start gap-4">
//                     <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border">
//                       {course.thumbnail ? (
//                         <img
//                           className="w-full h-full object-cover"
//                           src={course.thumbnail}
//                           alt={course.title}
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-gray-400">
//                           <ImageIcon />
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex-1">
//                       <div className="flex items-start justify-between gap-2 mb-1">
//                         <h3 className="font-semibold text-gray-900 dark:text-gray-100">
//                           {course.title}
//                         </h3>
//                         {/* Published status indicator */}
//                         {course.is_published ? (
//                           <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" title="Published" />
//                         ) : (
//                           <XCircle size={16} className="text-gray-400 flex-shrink-0" title="Unpublished" />
//                         )}
//                       </div>
                      
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
//                         {course.description || "No description"}
//                       </p>

//                       <div className="flex items-center justify-between mt-3">
//                         <div className="text-xs text-gray-500">
//                           {course.category || "Uncategorized"}
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => openEditModal(course)}
//                             className="text-indigo-600 hover:text-indigo-800"
//                             aria-label="Edit course"
//                           >
//                             <Edit3 size={16} />
//                           </button>
//                           <button
//                             onClick={() => confirmDelete(course)}
//                             className="text-red-500 hover:text-red-700"
//                             aria-label="Delete course"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>

//                       <div className="text-[11px] text-gray-400 mt-2">
//                         Created: {new Date(course.created_at).toLocaleDateString()}
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//             {/* PAGINATION */}
//             <div className="mt-6 flex items-center justify-between">
//               <div className="text-sm text-gray-600">
//                 Page {page} of {totalPages}
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-40"
//                 >
//                   Prev
//                 </button>
//                 <button
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-40"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add/Edit Modal */}
//       <AnimatePresence>
//         {showModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => setShowModal(false)}
//             />

//             <motion.div
//               initial={{ y: 20, opacity: 0, scale: 0.98 }}
//               animate={{ y: 0, opacity: 1, scale: 1 }}
//               exit={{ y: 10, opacity: 0, scale: 0.98 }}
//               transition={{ duration: 0.18 }}
//               className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
//             >
//               <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-700/20">
//                     <Tag className="text-indigo-600" />
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
//                       {editingCourse ? "Edit Course" : "Create Course"}
//                     </div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">
//                       Add title, category, thumbnail and description
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => {
//                     setShowModal(false);
//                     setEditingCourse(null);
//                   }}
//                   className="text-gray-600 hover:text-gray-800 dark:text-gray-300"
//                 >
//                   <X />
//                 </button>
//               </div>

//               {/* FORM */}
//               <form
//                 onSubmit={handleSubmit}
//                 className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 max-h-[75vh] overflow-auto"
//               >
//                 {/* LEFT */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
//                       Title <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       name="title"
//                       value={form.title}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
//                       placeholder="e.g. HTML & CSS basics"
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
//                       Category
//                     </label>
//                     <input
//                       name="category"
//                       value={form.category}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
//                       placeholder="e.g. Web Development"
//                     />
//                   </div>

//                   {/* Published Status Checkbox */}
//                   <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
//                     <input
//                       type="checkbox"
//                       id="is_published"
//                       name="is_published"
//                       checked={form.is_published}
//                       onChange={(e) => setForm(s => ({ ...s, is_published: e.target.checked }))}
//                       className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                     />
//                     <label htmlFor="is_published" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
//                       Publish course (make visible to users)
//                     </label>
//                   </div>

//                   <div>
//                     <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
//                       Thumbnail
//                     </label>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       name="thumbnail"
//                       onChange={(e) => setForm((s) => ({ ...s, thumbnail: e.target.files[0] }))}
//                       className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
//                     />
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500 mb-2">
//                       Thumbnail preview
//                     </div>
//                     <div className="w-full h-40 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
//                       {form.thumbnail ? (
//                         <img
//                           src={
//                             form.thumbnail instanceof File
//                               ? URL.createObjectURL(form.thumbnail)
//                               : form.thumbnail
//                           }
//                           alt="thumbnail preview"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="text-gray-400 flex flex-col items-center gap-2">
//                           <ImageIcon />
//                           <div className="text-xs">No thumbnail</div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* RIGHT */}
//                 <div className="space-y-4 flex flex-col">
//                   <div className="flex-1 flex flex-col">
//                     <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
//                       Description
//                     </label>
//                     <textarea
//                       name="description"
//                       rows={10}
//                       value={form.description}
//                       onChange={handleChange}
//                       className="flex-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
//                       placeholder="Explain the course, what's included, prerequisites..."
//                     />
//                   </div>

//                   <div className="flex items-center justify-end gap-3">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowModal(false);
//                         setEditingCourse(null);
//                       }}
//                       className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
//                     >
//                       Cancel
//                     </button>

//                     <button
//                       type="submit"
//                       className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-semibold text-sm hover:opacity-90"
//                     >
//                       {editingCourse ? "Update Course" : "Create Course"}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* DELETE CONFIRMATION */}
//       <AnimatePresence>
//         {showDeleteModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="absolute inset-0 bg-black/40"
//               onClick={() => setShowDeleteModal(false)}
//             />
//             <motion.div
//               initial={{ scale: 0.98, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.98, opacity: 0 }}
//               className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
//             >
//               <div className="flex items-start gap-3">
//                 <AlertTriangle className="text-red-500" />
//                 <div>
//                   <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
//                     Confirm deletion
//                   </div>
//                   <div className="text-sm text-gray-600 dark:text-gray-400">
//                     Are you sure you want to delete{" "}
//                     <span className="font-medium">
//                       {courseToDelete?.title}
//                     </span>
//                     ?
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end gap-3">
//                 <button
//                   onClick={() => setShowDeleteModal(false)}
//                   className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteConfirmed}
//                   className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Edit3,
  Trash2,
  Loader2,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Upload,
  Tag,
  Grid3x3,
  List,
  TrendingUp,
  Folder,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import client from "../../features/auth/api";

const PAGE_SIZE = 9;

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner Friendly", color: "green" },
  { value: "intermediate", label: "Intermediate", color: "yellow" },
  { value: "advanced", label: "Advanced", color: "red" },
];

const SUBCATEGORY_OPTIONS = [
  { value: "foundation", label: "Foundations" },
  { value: "library", label: "Libraries & Frameworks" },
  { value: "tool", label: "Tools & Utilities" },
  { value: "concept", label: "Concepts & Patterns" },
  { value: "advanced", label: "Advanced Topics" },
];

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // View & Pagination
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  // Analytics
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "foundation",
    difficulty: "beginner",
    prerequisites: "",
    tags: [],
    thumbnail: null,
    is_published: true,
  });

  const [tagInput, setTagInput] = useState("");

  /* FETCH DATA */
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [cRes, catRes] = await Promise.all([
        client.get("/courses/"),
        client.get("/categories/"),
      ]);

      const courseData = Array.isArray(cRes.data) ? cRes.data : cRes.data.results || [];
      const categoryData = Array.isArray(catRes.data) ? catRes.data : catRes.data.results || [];

      setCourses(courseData);
      setCategories(categoryData);
      setFiltered(courseData);
      computeAnalytics(courseData);
      setPage(1);
    } catch (e) {
      console.error("Failed to load data:", e);
      toast.error("Failed to load courses or categories");
    } finally {
      setLoading(false);
    }
  }

  function computeAnalytics(data) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setNewThisWeek(data.filter((c) => new Date(c.created_at) >= weekAgo).length);
    setPublishedCount(data.filter((c) => c.is_published).length);
  }

  /* FILTERING */
  useEffect(() => {
    let out = [...courses];
    const q = search.trim().toLowerCase();

    if (q) {
      out = out.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== "all") {
      out = out.filter((c) => String(c.category) === String(categoryFilter));
    }

    if (difficultyFilter !== "all") {
      out = out.filter((c) => c.difficulty === difficultyFilter);
    }

    if (statusFilter === "published") {
      out = out.filter((c) => c.is_published);
    } else if (statusFilter === "draft") {
      out = out.filter((c) => !c.is_published);
    }

    setFiltered(out);
    setPage(1);
  }, [search, categoryFilter, difficultyFilter, statusFilter, courses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* MODAL HELPERS */
  function openAddModal() {
    setEditingCourse(null);
    setForm({
      title: "",
      description: "",
      category: "",
      subcategory: "foundation",
      difficulty: "beginner",
      prerequisites: "",
      tags: [],
      thumbnail: null,
      is_published: true,
    });
    setTagInput("");
    setShowModal(true);
  }

  function openEditModal(course) {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      subcategory: course.subcategory || "foundation",
      difficulty: course.difficulty || "beginner",
      prerequisites: course.prerequisites || "",
      tags: course.tags || [],
      thumbnail: course.thumbnail || null,
      is_published: course.is_published !== undefined ? course.is_published : true,
    });
    setTagInput("");
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((s) => ({ ...s, [name]: checked }));
    } else if (type === "file") {
      setForm((s) => ({ ...s, [name]: files[0] }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((s) => ({ ...s, tags: [...s.tags, tag] }));
      setTagInput("");
    }
  }

  function removeTag(tag) {
    setForm((s) => ({ ...s, tags: s.tags.filter((t) => t !== tag) }));
  }

  /* SAVE */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("category", form.category);
    fd.append("subcategory", form.subcategory);
    fd.append("difficulty", form.difficulty);
    fd.append("prerequisites", form.prerequisites.trim());
    fd.append("tags", JSON.stringify(form.tags));
    fd.append("is_published", form.is_published);
    
    // Only append thumbnail if a new file was selected
    if (form.thumbnail instanceof File) {
      fd.append("thumbnail", form.thumbnail);
    }

    try {
      if (editingCourse) {
        // Update existing course
        await client.put(`/courses/${editingCourse.slug}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Course updated successfully!");
      } else {
        // Create new course
        await client.post("/courses/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Course created successfully!");
      }
      setShowModal(false);
      fetchAll();
    } catch (e) {
      console.error("Failed to save course:", e);
      const errorMsg = e.response?.data?.detail || 
                       e.response?.data?.message || 
                       "Failed to save course. Please try again.";
      toast.error(errorMsg);
    }
  }

  /* DELETE */
  function confirmDelete(course) {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirmed() {
    try {
      await client.delete(`/courses/${courseToDelete.slug}/`);
      toast.success("Course deleted successfully!");
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchAll();
    } catch (e) {
      console.error("Failed to delete course:", e);
      const errorMsg = e.response?.data?.detail || 
                       e.response?.data?.message || 
                       "Failed to delete course. Please try again.";
      toast.error(errorMsg);
    }
  }

  const getDifficultyColor = (difficulty) => {
    const opt = DIFFICULTY_OPTIONS.find(d => d.value === difficulty);
    return opt?.color || "gray";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Course Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your learning content and track performance
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              <span className="font-semibold">Create Course</span>
            </button>
          </div>

          {/* ANALYTICS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {courses.length}
                  </p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                  <BookOpen className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {publishedCount}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {newThisWeek}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {categories.length}
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                  <Folder className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* FILTERS & SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Search courses, tags..."
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
            >
              <option value="all">All Levels</option>
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600"
                }`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* RESULTS COUNT */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginated.length} of {filtered.length} courses
          </p>
        </div>

        {/* COURSES GRID/LIST */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginated.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="text-white/30" size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {course.is_published ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Eye size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <EyeOff size={12} />
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {course.description || "No description"}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Folder size={14} />
                      <span>{course.category_info?.title || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(course.difficulty)}-100 dark:bg-${getDifficultyColor(course.difficulty)}-900/30 text-${getDifficultyColor(course.difficulty)}-700 dark:text-${getDifficultyColor(course.difficulty)}-300`}>
                        {DIFFICULTY_OPTIONS.find(d => d.value === course.difficulty)?.label}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {course.articles_count || 0} articles
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs">
                          #{tag}
                        </span>
                      ))}
                      {course.tags.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{course.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => openEditModal(course)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
                    >
                      <Edit3 size={16} />
                      <span className="font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(course)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
          >
            {paginated.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white" size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {course.category_info?.title} • {course.articles_count} articles
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(course.difficulty)}-100 text-${getDifficultyColor(course.difficulty)}-700`}>
                    {DIFFICULTY_OPTIONS.find(d => d.value === course.difficulty)?.label}
                  </span>
                  
                  {course.is_published ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-gray-400" size={20} />
                  )}

                  <button
                    onClick={() => openEditModal(course)}
                    className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                  >
                    <Edit3 size={18} className="text-indigo-600" />
                  </button>
                  
                  <button
                    onClick={() => confirmDelete(course)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === p
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* CREATE/EDIT MODAL */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <form onSubmit={handleSubmit}>
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingCourse ? "Edit Course" : "Create New Course"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Course Title *
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="e.g., React Fundamentals"
                        required
                      />
                    </div>

                    {/* Category & Subcategory */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Subcategory
                        </label>
                        <select
                          name="subcategory"
                          value={form.subcategory}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500"
                        >
                          {SUBCATEGORY_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        rows={4}
                        placeholder="What will learners get from this course?"
                      />
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <div className="flex gap-3">
                        {DIFFICULTY_OPTIONS.map((d) => (
                          <label
                            key={d.value}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                              form.difficulty === d.value
                                ? `border-${d.color}-500 bg-${d.color}-50 dark:bg-${d.color}-900/30`
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="difficulty"
                              value={d.value}
                              checked={form.difficulty === d.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <Award size={18} className={form.difficulty === d.value ? `text-${d.color}-600` : "text-gray-400"} />
                            <span className="font-medium text-sm">{d.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Prerequisites */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Prerequisites
                      </label>
                      <input
                        name="prerequisites"
                        value={form.prerequisites}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., JavaScript basics, HTML/CSS"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500"
                          placeholder="Add a tag..."
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                        >
                          <Tag size={20} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-indigo-900 dark:hover:text-indigo-100"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Thumbnail Image
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                          <Upload size={20} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {form.thumbnail instanceof File ? form.thumbnail.name : "Choose file"}
                          </span>
                          <input
                            type="file"
                            name="thumbnail"
                            onChange={handleChange}
                            className="sr-only"
                            accept="image/*"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Published Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Publish Course</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Make this course visible to learners
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_published"
                          checked={form.is_published}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      {editingCourse ? "Update Course" : "Create Course"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Delete Course
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {courseToDelete?.title}
                  </strong>
                  ? All associated topics will also be deleted.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirmed}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold"
                  >
                    Delete Course
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}