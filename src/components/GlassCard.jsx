// import React from "react";
// import clsx from "clsx";

// export default function GlassCard({ children, className = "" }) {
//   return (
//     <div
//       className={clsx(
//         "relative w-full max-w-md mx-auto p-8 rounded-3xl border border-white/12",
//         "bg-white/8 dark:bg-black/30 backdrop-blur-md shadow-lg",
//         "hover:bg-white/12 dark:hover:bg-black/40 transition-all duration-500",
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// }


import React from "react";
import clsx from "clsx";

/**
 * A reusable glass-style card component with proper
 * dark/light blending and inherited text color.
 */
export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={clsx(
        "glass-effect relative w-full max-w-md mx-auto p-8 rounded-3xl",
        "transition-all duration-500 border border-white/10 dark:border-white/10",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10",
        className
      )}
    >
      {children}
    </div>
  );
}

