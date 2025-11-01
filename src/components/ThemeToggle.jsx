// import React, { useEffect, useState } from "react";
// import { Moon, Sun } from "lucide-react";

// export default function ThemeToggle({ className = "" }) {
//   const [dark, setDark] = useState(() => {
//     try {
//       const stored = localStorage.getItem("theme");
//       if (stored) return stored === "dark";
//       return (
//         window.matchMedia &&
//         window.matchMedia("(prefers-color-scheme: dark)").matches
//       );
//     } catch {
//       return false;
//     }
//   });

//   // Sync state to <html> class & localStorage
//   useEffect(() => {
//     const root = document.documentElement;
//     if (dark) {
//       root.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       root.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   }, [dark]);

//   return (
//     <button
//       onClick={() => setDark((v) => !v)}
//       aria-label="Toggle theme"
//       title={dark ? "Switch to light mode" : "Switch to dark mode"}
//       className={`p-2 rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg
//                  bg-gradient-to-r from-indigo-500 to-pink-500 text-white ${className}`}
//     >
//       {dark ? (
//         <Sun size={18} className="text-yellow-300" />
//       ) : (
//         <Moon size={18} className="text-gray-200" />
//       )}
//     </button>
//   );
// }
// import React from "react";
// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "../context/ThemeContext";

// export default function ThemeToggle() {
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <button
//       onClick={toggleTheme}
//       className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 
//                  hover:bg-gray-300 dark:hover:bg-gray-700 
//                  transition-all duration-300 ease-in-out"
//       aria-label="Toggle theme"
//     >
//       {theme === "dark" ? (
//         <Sun className="w-5 h-5 text-yellow-400" />
//       ) : (
//         <Moon className="w-5 h-5 text-gray-700" />
//       )}
//     </button>
//   );
// }

// src/components/ThemeToggle.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-all shadow-md"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="text-yellow-400 w-5 h-5" />
      ) : (
        <Moon className="text-gray-700 w-5 h-5" />
      )}
    </button>
  );
}


