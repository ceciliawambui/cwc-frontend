import React from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import GlassCard from "../../components/GlassCard";
import ThemeToggle from "../../components/ThemeToggle";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center 
                 relative overflow-hidden transition-colors duration-700 ease-in-out"
    >
      {/* Animated floating background — transparent so global gradient shows */}
      <AnimatedBackground />

      {/* Theme toggle button */}
      <ThemeToggle />

      {/* Main content container */}
      <div className="container mx-auto px-6 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Left section: Hero / Brand */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent 
                           bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
              Knowledge Hub
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-lg">
              {subtitle ||
                "Explore easy-to-follow notes and interactive examples across modern technologies."}
            </p>

            {/* Topic badges */}
            <div className="hidden md:flex mt-8 gap-2 flex-wrap justify-center lg:justify-start">
              {["React", "Django", "UI/UX", "Data Science"].map((topic) => (
                <div
                  key={topic}
                  className="px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 
                             border border-white/10 text-sm backdrop-blur-sm transition-colors duration-500"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* Right section: Glass card for auth form */}
          <div className="flex-1">
            <GlassCard className="max-w-md mx-auto transition-colors duration-500">
              <h3 className="text-xl font-semibold mb-2">{title || "Welcome"}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {subtitle
                  ? ""
                  : "Sign in to manage content or create a free learner account."}
              </p>
              {children}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
