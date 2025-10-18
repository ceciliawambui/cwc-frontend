/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "../../components/AnimatedBackground";
import GlassCard from "../../components/GlassCard";
import ThemeToggle from "../../components/ThemeToggle";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden
                 transition-colors duration-700 ease-in-out"
    >
      {/* === Floating background animation === */}
      <AnimatedBackground />

      {/* === Theme Toggle (global) === */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* === Main container === */}
      <div className="container mx-auto px-6 z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          {/* === Left: Hero section === */}
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            {/* <h1
              className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r  mb-4
                         from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
            >
              Knowledge Hub
            </h1> */}
            <h1 className="text-5xl sm:text-6xl font-extrabold gradient-text mb-4">
              Knowledge Hub
            </h1>

            <p
              className="max-w-lg mx-auto lg:mx-0 leading-relaxed transition-colors"
            >
              {subtitle ||
                "Explore structured tutorials, notes, and visual examples across modern technologies."}
            </p>



            {/* === Animated topic badges === */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden md:flex mt-8 gap-3 flex-wrap justify-center lg:justify-start"
            >
              {["React", "Django", "UI/UX", "Data Science", "DevOps"].map((topic) => (
                <div
                  key={topic}
                  className="px-4 py-2 rounded-full 
                 bg-white/70 dark:bg-white/10 
                 border border-white/30 dark:border-white/20
                 text-sm font-medium 
                 text-gray-900 dark:text-white
                 shadow-sm backdrop-blur-md 
                 hover:scale-105 hover:bg-white/90 dark:hover:bg-white/20
                 transition-all duration-300"
                >
                  {topic}
                </div>
              ))}
            </motion.div>


          </motion.div>

          {/* === Right: Auth Card === */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex-1 w-full"
          >
            <GlassCard className="max-w-md mx-auto p-8 transition-colors duration-500">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {title || "Welcome"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {subtitle ||
                  "Sign in to manage content or create your learner account."}
              </p>
              {children}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
