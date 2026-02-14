import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import useAuth from "./hooks/useAuth";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import LandingPage from "./features/content/LandingPage";
import AdminDashboard from "./features/admin/AdminDashboard";
import CourseDetail from "./features/content/courses/CourseDetail";
import TopicDetail from "./features/content/courses/TopicDetail";
import Navbar from "./components/Navbar";
import CoursesPage from "./features/content/courses/CoursesPage";
import Footer from "./components/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@vercel/analytics";
import Blogs from "./features/content/Blogs";
import CategoriesPage from "./features/content/courses/CategoriesPage";
import CategoryDetail from "./features/content/courses/CategoryDetail";
import BlogDetails from "./features/content/BlogDetails";
import Profile from "./features/content/Profile";
import Bookmarks from "./features/content/Bookmarks";
import TopicsPage from "./features/content/courses/TopicsPage";

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

  return (
    <AuthProvider>
      <ThemeProvider>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          {/* <Route path="/topics/:slug" element={<TopicDetail />} /> */}
          <Route path="/topics/by-slug/:slug" element={<TopicDetail />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetail />} />
          <Route path='/blogs' element={<Blogs />} />
          <Route path='/blogs/:slug' element={<BlogDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Bookmarks />} />
          <Route path="/topics" element={<TopicsPage/>} />
        
          <Route
            path="/courses/:courseSlug/topics/:topicSlug"
            element={<TopicDetail />}
          />



          <Route
            path="/admin"
            element={
              <PrivateAdmin>
                <AdminDashboard />
              </PrivateAdmin>
            }
          />
        </Routes>
        <Footer />
      </ThemeProvider>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
