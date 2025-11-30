import React from "react";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();
  return (
    <AuthLayout title="Join the DevHaven">
      <AuthForm
        mode="register"
        onSuccess={() => setTimeout(() => nav("/login"), 800)}
      />
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <a href="https://devhaven.onrender.com/login" className="text-indigo-500 hover:underline">
          Sign in
        </a>
      </p>
    </AuthLayout>
  );
}
