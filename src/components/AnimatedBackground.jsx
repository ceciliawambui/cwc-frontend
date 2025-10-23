/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground({ className = "" }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
        className="absolute w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full blur-[120px] top-[-15vw] left-[-10vw]"
        style={{
          background: isDark
            ? "radial-gradient(circle at center, rgba(99,102,241,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(99,102,241,0.14) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9, scale: [1, 0.995, 1] }}
        transition={{ repeat: Infinity, duration: 32, ease: "easeInOut" }}
        className="absolute w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[100px] bottom-[-10vw] right-[-8vw]"
        style={{
          background: isDark
            ? "radial-gradient(circle at center, rgba(37,99,235,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(56,189,248,0.10) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{ backgroundImage: "url('/noise.png')" }}
      />
    </div>
  );
}
