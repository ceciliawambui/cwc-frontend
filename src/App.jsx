import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import useAuth from "./hooks/useAuth";
import { track } from "@vercel/analytics";

// Static imports for initial render
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import LandingPage from "./features/content/LandingPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ContactPage from "./features/content/ContactPage";

// Lazy load everything else
const AdminDashboard = lazy(() => import("./features/admin/AdminDashboard"));
const CourseDetail = lazy(() => import("./features/content/courses/CourseDetail"));
const TopicDetail = lazy(() => import("./features/content/courses/TopicDetail"));
const CoursesPage = lazy(() => import("./features/content/courses/CoursesPage"));
const CategoriesPage = lazy(() => import("./features/content/courses/CategoriesPage"));
const CategoryDetail = lazy(() => import("./features/content/courses/CategoryDetail"));
const Blogs = lazy(() => import("./features/content/Blogs"));
const BlogDetails = lazy(() => import("./features/content/BlogDetails"));
const Profile = lazy(() => import("./features/content/Profile"));
const Bookmarks = lazy(() => import("./features/content/Bookmarks"));
const TopicsPage = lazy(() => import("./features/content/courses/TopicsPage"));

function PrivateAdmin({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    track(location.pathname);
  }, [location]);

  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = "https://www.googletagmanager.com/gtag/js?id=G-R7YHM0WPHV";
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-R7YHM0WPHV');
    `;
    document.head.appendChild(script2);
  }, []);

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-R7YHM0WPHV", { page_path: location.pathname });
    }
  }, [location]);

  return (
    <ThemeProvider>
      <Navbar />
      <Toaster position="top-right" />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/courses/:courseSlug/topics/:topicSlug" element={<TopicDetail />} />
          <Route path="/topics/:slug" element={<TopicDetail />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetail />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Bookmarks />} />
          <Route path="/contact" element={<ContactPage/>} />
          <Route
            path="/admin"
            element={
              <PrivateAdmin>
                <AdminDashboard />
              </PrivateAdmin>
            }
          />
        </Routes>
      </Suspense>
      <Footer />
    </ThemeProvider>
  );
}