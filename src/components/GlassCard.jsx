import React from "react";
import clsx from "clsx";

/**
 * Reusable glass wrapper
 * props:
 *  - className: extra classes
 *  - children
 */
export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={clsx(
        "relative w-full max-w-md mx-auto p-8 rounded-3xl border border-white/12 bg-white/6 dark:bg-black/30 backdrop-blur-md shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
