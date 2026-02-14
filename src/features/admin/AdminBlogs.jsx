import React, { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Trash2,
    Loader2,
    Plus,
    Eye,
    EyeOff,
    Clock,
    X,
    Grid3x3,
    List,
    Tag as TagIcon,
    Image as ImageIcon,
    AlertCircle,
    Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import client from "../../features/auth/api";

const PAGE_SIZE = 9;

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function AdminBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    /* Filters */
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState("grid");
    const [page, setPage] = useState(1);

    /* Modals */
    const [showEditor, setShowEditor] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [blogToDelete, setBlogToDelete] = useState(null);

    /* Form */
    const [form, setForm] = useState(initialForm());
    const [tagInput, setTagInput] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    /* ======================================================
       FETCH DATA
    ====================================================== */
    useEffect(() => {
        fetchBlogs();
        fetchTags();
    }, []);

    async function fetchBlogs() {
        setLoading(true);
        try {
            const res = await client.get("/blogs/admin/");
            setBlogs(res.data?.results || res.data || []);
            setPage(1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    }

    async function fetchTags() {
        try {
            const res = await client.get("/blogs/tags/");
            setTags(res.data?.results || res.data || []);
        } catch (err) {
            console.error(err);
        }
    }

    /* ======================================================
       FILTERING & PAGINATION
    ====================================================== */
    const filteredBlogs = useMemo(() => {
        let data = [...blogs];
        const q = search.trim().toLowerCase();

        if (q) {
            data = data.filter(
                b =>
                    b.title?.toLowerCase().includes(q) ||
                    b.description?.toLowerCase().includes(q) ||
                    (Array.isArray(b.tags) && b.tags.some(t => 
                        (typeof t === 'string' ? t : t.name)?.toLowerCase().includes(q)
                    ))
            );
        }

        if (statusFilter !== "all") {
            data = data.filter(b => b.status === statusFilter);
        }

        return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [blogs, search, statusFilter]);

    const paginatedBlogs = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredBlogs.slice(start, start + PAGE_SIZE);
    }, [filteredBlogs, page]);

    const totalPages = Math.ceil(filteredBlogs.length / PAGE_SIZE);

    /* ======================================================
       FORM HANDLERS
    ====================================================== */
    function openCreate() {
        setEditingBlog(null);
        setForm(initialForm());
        setImagePreview(null);
        setShowEditor(true);
    }

    function openEdit(blog) {
        setEditingBlog(blog);
        
        // Extract tag IDs from the blog data
        const tagIds = Array.isArray(blog.tags) 
            ? blog.tags.map(t => typeof t === 'object' ? t.id : t)
            : [];

        setForm({
            title: blog.title || "",
            description: blog.description || "",
            content: blog.content || "",
            tags: tagIds,
            cover_image: null,
            status: blog.status || "draft",
            read_time: blog.read_time || 5,
        });
        
        setImagePreview(blog.cover_image || null);
        setShowEditor(true);
    }

    function handleChange(e) {
        const { name, value, type, files } = e.target;
        
        if (type === "file" && files[0]) {
            setForm(f => ({ ...f, [name]: files[0] }));
            
            // Generate preview for image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    }

    function handleNumberChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: parseInt(value) || 0 }));
    }

    async function createNewTag() {
        const tagName = tagInput.trim();
        if (!tagName) return;

        try {
            const res = await client.post("/blogs/tags/", { 
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, '-')
            });
            
            const newTag = res.data;
            setTags(prev => [...prev, newTag]);
            setForm(f => ({ ...f, tags: [...f.tags, newTag.id] }));
            setTagInput("");
            toast.success("Tag created");
        } catch (err) {
            toast.error("Failed to create tag");
            console.error(err);
        }
    }

    function toggleTag(tagId) {
        setForm(f => ({
            ...f,
            tags: f.tags.includes(tagId)
                ? f.tags.filter(id => id !== tagId)
                : [...f.tags, tagId]
        }));
    }

    /* ======================================================
       SAVE & DELETE
    ====================================================== */
    async function saveBlog(e) {
        e.preventDefault();

        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!form.description.trim()) {
            toast.error("Description is required");
            return;
        }

        if (!form.content.trim()) {
            toast.error("Content is required");
            return;
        }

        setSaving(true);

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("content", form.content);
        formData.append("status", form.status);
        formData.append("read_time", form.read_time);

        // Append tags as individual items (for ManyToMany field)
        form.tags.forEach(tagId => {
            formData.append("tags", tagId);
        });

        // Only append image if a new one was selected
        if (form.cover_image instanceof File) {
            formData.append("cover_image", form.cover_image);
        }

        try {
            if (editingBlog) {
                await client.patch(`/blogs/admin/${editingBlog.slug}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Blog updated successfully");
            } else {
                await client.post("/blogs/admin/", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Blog created successfully");
            }
            
            setShowEditor(false);
            fetchBlogs();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || 
                           err.response?.data?.message || 
                           "Failed to save blog";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    }

    async function deleteBlog() {
        try {
            await client.delete(`/blogs/admin/${blogToDelete.slug}/`);
            toast.success("Blog deleted successfully");
            setBlogToDelete(null);
            fetchBlogs();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete blog");
        }
    }

    /* ======================================================
       RENDER
    ====================================================== */
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Blog Management
                        </h1>
                        <p className="text-slate-600 mt-1">
                            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'}
                        </p>
                    </div>
                    
                    <button 
                        onClick={openCreate} 
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Plus size={20} /> New Blog Post
                    </button>
                </motion.div>

                {/* FILTERS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 mb-6"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Search by title, description, or tags..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[150px]"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>

                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                    viewMode === "grid"
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <Grid3x3 size={18} />
                                <span className="hidden sm:inline">Grid</span>
                            </button>

                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                    viewMode === "list"
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <List size={18} />
                                <span className="hidden sm:inline">List</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* CONTENT */}
                {loading ? (
                    <Loader />
                ) : filteredBlogs.length === 0 ? (
                    <EmptyState search={search} statusFilter={statusFilter} />
                ) : (
                    <>
                        <motion.div 
                            className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {paginatedBlogs.map((blog, idx) => (
                                <BlogCard
                                    key={blog.id}
                                    blog={blog}
                                    onEdit={() => openEdit(blog)}
                                    onDelete={() => setBlogToDelete(blog)}
                                    viewMode={viewMode}
                                    index={idx}
                                />
                            ))}
                        </motion.div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <Pagination 
                                page={page} 
                                totalPages={totalPages} 
                                onPageChange={setPage} 
                            />
                        )}
                    </>
                )}

                {/* EDITOR MODAL */}
                <AnimatePresence>
                    {showEditor && (
                        <Modal onClose={() => !saving && setShowEditor(false)} large>
                            <h2 className="text-2xl font-bold mb-6 text-slate-900">
                                {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                            </h2>
                            
                            <form onSubmit={saveBlog} className="space-y-6">
                                {/* TITLE */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter blog title"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* DESCRIPTION */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Short description (max 500 characters)"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        rows={3}
                                        maxLength={500}
                                        required
                                    />
                                    <div className="text-xs text-slate-500 mt-1 text-right">
                                        {form.description.length}/500
                                    </div>
                                </div>

                                {/* CONTENT */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Content * (Markdown supported)
                                    </label>
                                    <textarea
                                        name="content"
                                        value={form.content}
                                        onChange={handleChange}
                                        placeholder="Write your blog content here..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm"
                                        rows={12}
                                        required
                                    />
                                </div>

                                {/* COVER IMAGE */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Cover Image
                                    </label>
                                    
                                    {imagePreview && (
                                        <div className="mb-3 relative group">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setForm(f => ({ ...f, cover_image: null }));
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    
                                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <ImageIcon size={20} className="text-slate-500" />
                                        <span className="text-slate-600">
                                            {imagePreview ? "Change Image" : "Upload Cover Image"}
                                        </span>
                                        <input
                                            type="file"
                                            name="cover_image"
                                            onChange={handleChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* TAGS */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tags
                                    </label>
                                    
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), createNewTag())}
                                            placeholder="Create new tag..."
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={createNewTag}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[60px]">
                                        {tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTag(tag.id)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                    form.tags.includes(tag.id)
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "bg-white text-slate-700 border border-slate-200 hover:border-blue-400"
                                                }`}
                                            >
                                                {form.tags.includes(tag.id) && <Check size={14} className="inline mr-1" />}
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* STATUS & READ TIME */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Read Time (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            name="read_time"
                                            value={form.read_time}
                                            onChange={handleNumberChange}
                                            min="1"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* SUBMIT */}
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingBlog ? "Update Blog Post" : "Create Blog Post"}
                                        </>
                                    )}
                                </button>
                            </form>
                        </Modal>
                    )}
                </AnimatePresence>

                {/* DELETE CONFIRMATION */}
                <AnimatePresence>
                    {blogToDelete && (
                        <Modal onClose={() => setBlogToDelete(null)}>
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="text-red-600" size={32} />
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Delete Blog Post?
                                </h3>
                                
                                <p className="text-slate-600 mb-6">
                                    Are you sure you want to delete "<strong>{blogToDelete.title}</strong>"? 
                                    This action cannot be undone.
                                </p>
                                
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setBlogToDelete(null)}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={deleteBlog}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

/* ======================================================
   HELPER COMPONENTS
====================================================== */

function initialForm() {
    return {
        title: "",
        description: "",
        content: "",
        tags: [],
        cover_image: null,
        status: "draft",
        read_time: 5,
    };
}

function BlogCard({ blog, onEdit, onDelete, viewMode, index }) {
    const getTagNames = (tags) => {
        if (!Array.isArray(tags)) return [];
        return tags.map(t => typeof t === 'string' ? t : t.name || t);
    };

    const tagNames = getTagNames(blog.tags);

    if (viewMode === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all p-4"
            >
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg overflow-hidden flex-shrink-0">
                        {blog.cover_image && (
                            <img 
                                src={blog.cover_image} 
                                alt={blog.title}
                                className="w-full h-full object-cover" 
                            />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 truncate">
                                {blog.title}
                            </h3>
                            <StatusBadge status={blog.status} />
                        </div>
                        
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {blog.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Clock size={14} /> {blog.read_time} min
                            </span>
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                            {tagNames.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <TagIcon size={14} /> {tagNames.length}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        <button 
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-medium"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={onDelete}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
        >
            <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                {blog.cover_image ? (
                    <img 
                        src={blog.cover_image} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-slate-400" size={48} />
                    </div>
                )}
                
                <div className="absolute top-3 right-3">
                    <StatusBadge status={blog.status} />
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {blog.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {blog.description}
                </p>

                {tagNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tagNames.slice(0, 3).map((tag, i) => (
                            <span 
                                key={i}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                        {tagNames.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                +{tagNames.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-4 border-t border-slate-200">
                    <span className="flex items-center gap-1">
                        <Clock size={14} /> {blog.read_time} min read
                    </span>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={onEdit}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-medium"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const config = {
        published: {
            bg: "bg-green-100",
            text: "text-green-700",
            icon: Eye,
            label: "Published"
        },
        draft: {
            bg: "bg-amber-100",
            text: "text-amber-700",
            icon: EyeOff,
            label: "Draft"
        }
    };

    const { bg, text, icon: Icon, label } = config[status] || config.draft;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
            <Icon size={12} />
            {label}
        </span>
    );
}

function Modal({ children, onClose, large = false }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className={`bg-white rounded-2xl p-6 w-full ${large ? 'max-w-3xl max-h-[90vh] overflow-y-auto' : 'max-w-md'} relative shadow-2xl`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                    <X size={20} />
                </button>
                {children}
            </motion.div>
        </motion.div>
    );
}

function Loader() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-600">Loading blogs...</p>
        </div>
    );
}

function EmptyState({ search, statusFilter }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
        >
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search className="text-slate-400" size={40} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
                No blogs found
            </h3>
            
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {search || statusFilter !== "all" 
                    ? "Try adjusting your filters or search query"
                    : "Get started by creating your first blog post"
                }
            </p>
        </motion.div>
    );
}

function Pagination({ page, totalPages, onPageChange }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-2 mt-8"
        >
            <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Previous
            </button>

            <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => onPageChange(i + 1)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                            page === i + 1
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Next
            </button>
        </motion.div>
    );
}