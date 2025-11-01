import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; // ✅ import
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

function PrivateAdmin({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider> {/* ✅ Wrap your whole app here */}
        <BrowserRouter>
        <Navbar />
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/topics/:slug" element={<TopicDetail />} />
            <Route path="/courses" element={<CoursesPage />} />

            <Route
              path="/admin"
              element={
                <PrivateAdmin>
                  <AdminDashboard />
                </PrivateAdmin>
              }
            />
          </Routes>
          <Footer/>
        </BrowserRouter>
      </ThemeProvider>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
