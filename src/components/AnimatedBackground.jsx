/* eslint-disable no-unused-vars */


import React from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* big soft blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        className="absolute w-[50vw] h-[50vw] max-w-[900px] max-h-[900px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-30 rounded-full blur-[120px] top-[-10vw] left-[-12vw] transform-gpu"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 0.98, 1] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        className="absolute w-[40vw] h-[40vw] max-w-[700px] max-h-[700px] bg-gradient-to-tr from-cyan-400 via-indigo-400 to-emerald-300 opacity-25 rounded-full blur-[100px] bottom-[-12vw] right-[-10vw] transform-gpu"
      />
      {/* subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-transparent" />
    </div>
  );
}
