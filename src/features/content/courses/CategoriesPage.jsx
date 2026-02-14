import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import {
  ArrowUpRight,
  BookOpen,
  Layers,
  Grid3x3,
  Sparkles,
  Search,
  Filter,
  Folder,
  X,
  TrendingUp,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================================
   Category Icon Resolver
================================ */
const getCategoryIcon = (title) => {
  const lower = title.toLowerCase();
  
  if (lower.includes('web') || lower.includes('frontend')) return BookOpen;
  if (lower.includes('backend') || lower.includes('server')) return Layers;
  if (lower.includes('data') || lower.includes('database')) return Grid3x3;
  if (lower.includes('cloud') || lower.includes('database')) return Folder;
  
  return Sparkles;
};

/* ================================
   Modern Card Component
================================ */
const CategoryCard = ({ category, theme, index }) => {
  const Icon = getCategoryIcon(category.title);
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      <Link to={`/categories/${category.slug}`} className="block h-full">
        <div
          className={`relative h-full rounded-2xl border p-8 transition-all duration-300
            ${theme === "dark"
              ? "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl"
            }
            overflow-hidden`}
        >
          {/* Hover gradient overlay */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            ${theme === "dark" 
              ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50" 
              : "bg-gradient-to-br from-slate-50 to-white"
            }`}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6
              transition-all duration-300 group-hover:scale-110
              ${theme === "dark" 
                ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300" 
                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700"
              }`}
            >
              <Icon size={24} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3 className={`text-2xl font-bold mb-3 ${textPrimary}
              transition-colors duration-300`}
            >
              {category.title}
            </h3>

            {/* Description */}
            <p className={`text-sm mb-6 line-clamp-3 leading-relaxed ${textSecondary}`}>
              {category.description || "Explore curated resources, guides, and references in this domain."}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className={`inline-flex items-center gap-2 text-sm font-semibold
                ${theme === "dark" ? "text-slate-300" : "text-slate-700"}
                group-hover:gap-3 transition-all duration-300`}
              >
                Explore Category
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
              >
                <ArrowUpRight size={20} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ================================
   Search & Filter Bar
================================ */
const SearchFilterBar = ({ theme, searchQuery, setSearchQuery, totalCount }) => {
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-12">
      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search 
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`}
          size={18}
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className={`w-full pl-12 pr-10 py-3 rounded-xl border text-sm
            transition-all duration-300 focus:outline-none
            ${theme === "dark"
              ? "bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-slate-700"
              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
            }
            focus:shadow-lg`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
              ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
          >
            <X size={16} className={textSecondary} />
          </button>
        )}
      </div>

      {/* Results count */}
      <div className={`text-sm ${textSecondary}`}>
        {searchQuery ? (
          <span>Found {totalCount} {totalCount === 1 ? 'category' : 'categories'}</span>
        ) : (
          <span>{totalCount} {totalCount === 1 ? 'category' : 'categories'} available</span>
        )}
      </div>
    </div>
  );
};

/* ================================
   Empty State
================================ */
const EmptyState = ({ theme, searchQuery }) => {
  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="text-center py-20">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
        ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
      >
        <Search size={28} className={textSecondary} />
      </div>
      <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>
        No categories found
      </h3>
      <p className={`text-sm ${textSecondary}`}>
        Try adjusting your search for "{searchQuery}"
      </p>
    </div>
  );
};

/* ================================
   Categories Page
================================ */
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();

  const fetchCategories = useCallback(async () => {
    const res = await axios.get(`${BASE_URL}/api/categories/`);
    setCategories(Array.isArray(res.data) ? res.data : res.data.results);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  });

  const textPrimary = theme === "dark" ? "text-white" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative pt-32 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
                ${theme === "dark" 
                  ? "bg-slate-800 text-slate-300 border border-slate-700" 
                  : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <TrendingUp size={14} />
                Knowledge Domains
              </span>
            </div>

            {/* Title */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
              Explore by{" "}
              <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>
                Category
              </span>
            </h1>

            {/* Description */}
            <p className={`text-base md:text-lg leading-relaxed ${textSecondary}`}>
              Categories organize DevNook's knowledge space into focused domains. 
              Choose your area of interest and dive into curated learning paths, 
              resources, and expert insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 pb-24">
        {/* Search & Filter */}
        <SearchFilterBar 
          theme={theme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={filteredCategories.length}
        />

        {/* Categories Grid */}
        <AnimatePresence mode="wait">
          {filteredCategories.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  theme={theme}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState theme={theme} searchQuery={searchQuery} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Bottom CTA Section */}
      <section className="container mx-auto px-6 pb-20">
        <div
          className={`rounded-2xl border p-12 text-center transition-all duration-300
            ${theme === "dark"
              ? "bg-slate-900/50 border-slate-800"
              : "bg-white border-slate-200"
            }`}
        >
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${textPrimary}`}>
            Can't find what you're looking for?
          </h2>
          <p className={`text-sm mb-6 max-w-xl mx-auto ${textSecondary}`}>
            Browse our complete course catalog or search for specific topics 
            to discover exactly what you need.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/courses"
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all
                ${theme === "dark"
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-800"
                }
                shadow-lg hover:shadow-xl hover:scale-105`}
            >
              Browse All Courses
            </Link>
            <Link
              to="/topics"
              className={`px-6 py-3 rounded-xl border font-semibold text-sm transition-all
                ${theme === "dark"
                  ? "border-slate-700 text-white hover:bg-slate-800"
                  : "border-slate-300 text-slate-900 hover:bg-slate-50"
                }
                hover:scale-105`}
            >
              Explore Topics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}