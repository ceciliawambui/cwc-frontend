import React from "react";
import clsx from "clsx";

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

