// // import { useEffect, useState } from "react";
// // import { Moon, Sun } from "lucide-react";

// // export default function ThemeToggle() {
// //   const [dark, setDark] = useState(() =>
// //     document.documentElement.classList.contains("dark")
// //   );

// //   useEffect(() => {
// //     if (dark) {
// //       document.documentElement.classList.add("dark");
// //     } else {
// //       document.documentElement.classList.remove("dark");
// //     }
// //   }, [dark]);

// //   return (
// //     <button
// //       onClick={() => setDark(!dark)}
// //       className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md hover:scale-105 transition"
// //       aria-label="Toggle theme"
// //     >
// //       {dark ? <Sun size={20} /> : <Moon size={20} />}
// //     </button>
// //   );
// // }
// import React, { useEffect, useState } from "react";
// import { Moon, Sun } from "lucide-react";

// export default function ThemeToggle({ className = "" }) {
//   const [dark, setDark] = useState(() => {
//     try {
//       const stored = localStorage.getItem("theme");
//       if (stored) return stored === "dark";
//       return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
//     } catch {
//       return false;
//     }
//   });

//   // apply initial theme once
//   useEffect(() => {
//     const root = document.documentElement;
//     if (dark) root.classList.add("dark");
//     else root.classList.remove("dark");
//   }, []); // run once to reflect initial state (state already read from localStorage)

//   // sync on toggle
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
//       // className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md hover:scale-105 transition ${className}"
//       className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-transform hover:scale-105 ${className}`}
//       title={dark ? "Switch to light" : "Switch to dark"}
//     >
//       {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
//     </button>
//   );
// }

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  // Sync state to <html> class & localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((v) => !v)}
      aria-label="Toggle theme"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg
                 bg-gradient-to-r from-indigo-500 to-pink-500 text-white ${className}`}
    >
      {dark ? (
        <Sun size={18} className="text-yellow-300" />
      ) : (
        <Moon size={18} className="text-gray-200" />
      )}
    </button>
  );
}

