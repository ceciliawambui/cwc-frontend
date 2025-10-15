import React from "react";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();
  return (
    
    <AuthLayout title="Create Account" subtitle="Join the knowledge hub">
        
      <AuthForm
        mode="register"
        onSuccess={() => {
          // after success, navigate to verify or login
          setTimeout(() => nav("/login"), 800);
        }}
      />
      <p className="mt-4 text-sm text-gray-300 text-center">
        Already have an account?{" "}
        <a href="/login" className="text-indigo-300 hover:underline">
          Sign in
        </a>
      </p>
    </AuthLayout>
  );
}
