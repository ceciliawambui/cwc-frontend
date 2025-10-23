import React from "react";

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700 w-full"
        ></div>
      ))}
    </div>
  );
}
