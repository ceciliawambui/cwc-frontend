/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from "./InputField";
import { toast } from "react-hot-toast";
// import { useAuth } from "../../context/AuthContext";
import useAuth from "../../hooks/useAuth"
import Loader from "../../components/Loader";

/**
 * mode: 'login' | 'register'
 * onSuccess: optional callback
 */
export default function AuthForm({ mode = "login", onSuccess }) {
  const { login } = useAuth();
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
        await login(form.email, form.password);
        toast.success("Logged in");
        onSuccess?.();
      } else {
        // register flow: call backend register
        const payload = {
          username: form.email,
          email: form.email,
          password: form.password,
        };
        // If your backend requires name/role, add them accordingly.
        const { registerRequest } = await import("./api");
        await registerRequest(payload);
        toast.success("Account created — check email if verification enabled");
        onSuccess?.();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {mode === "register" && (
        <InputField
          id="name"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Full name"
        />
      )}

      <InputField
        id="email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="Email address"
        autoFocus
      />

      <InputField
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        placeholder="Password"
      />

      {mode === "register" && (
        <InputField
          id="confirm"
          name="confirm_password"
          type="password"
          value={form.confirm_password}
          onChange={onChange}
          placeholder="Confirm password"
        />
      )}

      <div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg"
          disabled={loading}
        >
          {loading ? <Loader size={20} /> : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </motion.form>
  );
}
