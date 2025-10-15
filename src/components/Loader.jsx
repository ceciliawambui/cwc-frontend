import React from "react";

export default function Loader({ size = 36 }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="4"
        />
        <path
          d="M22 12a10 10 0 00-3.94-7.94"
          stroke="url(#g)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
