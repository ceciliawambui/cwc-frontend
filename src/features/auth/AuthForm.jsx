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

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      
        const loggedUser = JSON.parse(localStorage.getItem("user")); 
        toast.success("Welcome back!");
      
        if (loggedUser?.role === "admin" || loggedUser?.is_admin) {
          nav("https://devhaven.onrender.com/admin");
        } else {
          nav("https://devhaven.onrender.com/dashboard");
        }

        onSuccess?.(loggedUser);
      } else {
        if (form.password !== form.confirm_password) {
          toast.error("Passwords do not match");
          return;
        }

        const payload = {
          username: form.email,
          email: form.email,
          password: form.password,
        };

        const { registerRequest } = await import("./api");
        await registerRequest(payload);

        toast.success("Account created successfully!");
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Something went wrong.");
      console.error(err);
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
          className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                     bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-400
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition"
        />
      )}

      <input
        type="email"
        name="email"
        placeholder="Email address"
        value={form.email}
        onChange={onChange}
        className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                   bg-white/70 dark:bg-gray-900/60 focus:ring-2 focus:ring-indigo-400
                   text-gray-900 dark:text-gray-100 placeholder-gray-500 transition"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={onChange}
        className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                   bg-white/70 dark:bg-gray-900/60 focus:ring-2 focus:ring-indigo-400
                   text-gray-900 dark:text-gray-100 placeholder-gray-500 transition"
      />

      {mode === "register" && (
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm password"
          value={form.confirm_password}
          onChange={onChange}
          className="w-full py-3 px-4 rounded-xl border border-gray-300/50 dark:border-gray-700/50 
                     bg-white/70 dark:bg-gray-900/60 focus:ring-2 focus:ring-indigo-400
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 transition"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-xl font-semibold text-white text-lg 
                   bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg hover:opacity-90 transition-all"
      >
        {loading ? <Loader size={20} /> : mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </motion.form>
  );
}
