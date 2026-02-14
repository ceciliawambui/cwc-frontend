/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";

export default function AuthForm({ mode = "login", onSuccess }) {
  const { login } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        // Login - validate fields first
        if (!form.email || !form.password) {
          toast.error("Please enter both email/username and password");
          setLoading(false);
          return;
        }

        await login(form.email.trim(), form.password);

        const loggedUser = JSON.parse(localStorage.getItem("user"));
        toast.success("Welcome back!");

        if (
          loggedUser?.role === "admin" ||
          loggedUser?.is_admin ||
          loggedUser?.is_staff
        ) {
          nav("/admin");
        } else {
          nav("/dashboard");
        }

        onSuccess?.(loggedUser);
      } else {
        // Registration
        if (form.password !== form.confirm_password) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        // Validate required fields
        if (!form.email || !form.password || !form.name) {
          toast.error("Please fill in all required fields");
          setLoading(false);
          return;
        }

        const payload = {
          username: form.email, // Use email as username
          email: form.email,
          password: form.password,
          password_confirm: form.confirm_password, // Match backend field name
          name: form.name,
        };

        const { registerRequest } = await import("./api");
        const response = await registerRequest(payload);

        console.log("Registration successful:", response.data);

        toast.success("Account created successfully! Please log in.");

        // Redirect to login page
        nav("/login");

        onSuccess?.();
      }
    } catch (err) {
      console.error("Auth Error:", err);

      // Handle specific error messages from backend
      if (err?.response?.data) {
        const errorData = err.response.data;

        // Handle field-specific errors
        if (errorData.username) {
          toast.error(`Username: ${errorData.username[0]}`);
        } else if (errorData.email) {
          toast.error(`Email: ${errorData.email[0]}`);
        } else if (errorData.password) {
          toast.error(`Password: ${errorData.password[0]}`);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0]);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {mode === "register" && (
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={onChange}
          required
          className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                     bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition"
        />
      )}

      <input
        type="text"
        name="email"
        placeholder={mode === "login" ? "Email or Username" : "Email address"}
        value={form.email}
        onChange={onChange}
        required
        className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                   bg-white/70 dark:bg-gray-900/60 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500

                   text-gray-900 dark:text-gray-100 placeholder-gray-500 transition"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={onChange}
        required
        className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                   bg-white/70 dark:bg-gray-900/60 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                   text-gray-900 dark:text-gray-100 placeholder-gray-500 transition"
      />

      {mode === "register" && (
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm password"
          value={form.confirm_password}
          onChange={onChange}
          required
          className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                     bg-white/70 dark:bg-gray-900/60 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 transition"
        />
      )}

<button
  type="submit"
  disabled={loading}
  className="w-full py-3 mt-2 rounded-xl font-semibold text-white text-lg 
             bg-gradient-to-r from-emerald-500 to-teal-500
             hover:from-emerald-600 hover:to-teal-600
             shadow-lg shadow-emerald-500/20
             transition-all duration-300 hover:scale-[1.02]
             disabled:opacity-50 disabled:cursor-not-allowed"
>

        {loading ? (
          <Loader size={20} />
        ) : mode === "login" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </button>
    </motion.form>
  );
}
