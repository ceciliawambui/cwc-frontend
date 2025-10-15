import React from "react";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import useAuth from "../../hooks/useAuth"

export default function LoginPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  if (user && user.role === "admin") {
    nav("/admin");
  }

  return (
    <AuthLayout title="Sign in">
      <AuthForm
        mode="login"
        onSuccess={() => {
          // redirect after tiny delay so toast shows
          setTimeout(() => nav("/admin"), 300);
        }}
      />
      <p className="mt-4 text-sm text-gray-300 text-center">
        New here?{" "}
        <a href="/register" className="text-indigo-300 hover:underline">
          Create an account
        </a>
      </p>
    </AuthLayout>
  );
}
