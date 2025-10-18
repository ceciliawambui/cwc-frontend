// /* eslint-disable no-unused-vars */


// import React from "react";
// import { motion } from "framer-motion";

// export default function AnimatedBackground() {
//   return (
//     <div className="absolute inset-0 -z-10 overflow-hidden">
//       {/* big soft blobs */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1, scale: [1, 1.05, 1] }}
//         transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
//         className="absolute w-[50vw] h-[50vw] max-w-[900px] max-h-[900px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-30 rounded-full blur-[120px] top-[-10vw] left-[-12vw] transform-gpu"
//       />
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1, scale: [1, 0.98, 1] }}
//         transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
//         className="absolute w-[40vw] h-[40vw] max-w-[700px] max-h-[700px] bg-gradient-to-tr from-cyan-400 via-indigo-400 to-emerald-300 opacity-25 rounded-full blur-[100px] bottom-[-12vw] right-[-10vw] transform-gpu"
//       />
//       {/* subtle grid overlay */}
//       <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent to-transparent" />
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
// import React from "react";
// import { motion } from "framer-motion";

// export default function AnimatedBackground() {
//   return (
//     <div className="absolute inset-0 -z-10 overflow-hidden">
//       {/* soft ambient glow (one side only) */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.5, scale: [1, 1.02, 1] }}
//         transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
//         className="absolute w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] blur-[120px] top-[-15vw] left-[-10vw]"
//       />

//       {/* subtle complementary glow (opposite corner) */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.4, scale: [1, 0.99, 1] }}
//         transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
//         className="absolute w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,transparent_70%)] blur-[100px] bottom-[-10vw] right-[-8vw]"
//       />

//       {/* optional soft noise texture overlay */}
//       <div className="absolute inset-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03]" />
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
// import React from "react";
// import { motion } from "framer-motion";

// export default function AnimatedBackground({ className = "" }) {
//   return (
//     <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
//       {/* Left ambient glow */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1, scale: [1, 1.02, 1] }}
//         transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
//         className="absolute w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full blur-[120px] top-[-15vw] left-[-10vw]"
//         style={{
//           background: "radial-gradient(circle at center, rgba(99,102,241,0.14) 0%, transparent 70%)",
//         }}
//       />

//       {/* Right subtle glow */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.9, scale: [1, 0.995, 1] }}
//         transition={{ repeat: Infinity, duration: 32, ease: "easeInOut" }}
//         className="absolute w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[100px] bottom-[-10vw] right-[-8vw]"
//         style={{
//           background: "radial-gradient(circle at center, rgba(56,189,248,0.10) 0%, transparent 70%)",
//         }}
//       />

//       {/* Very subtle noise overlay — create /public/noise.png or remove this div */}
//       <div className="absolute inset-0" style={{ backgroundImage: "url('/noise.png')", opacity: 0.02 }} />
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground({ className = "" }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme and update when class changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      {/* Left ambient glow */}
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

      {/* Right subtle glow */}
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

      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{ backgroundImage: "url('/noise.png')" }}
      />
    </div>
  );
}
