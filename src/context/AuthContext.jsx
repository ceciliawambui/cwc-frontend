// // src/context/AuthContext.jsx
// import React, { createContext, useEffect, useState, useMemo } from "react";
// import * as api from "../features/auth/api";
// import { jwtDecode } from "jwt-decode";

// // Create Context
// const AuthContext = createContext(null);

// // Provider
// function AuthProvider({ children }) {
//   const [auth, setAuth] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("auth")) || null;
//     } catch {
//       return null;
//     }
//   });

//   const [user, setUser] = useState(() => {
//     if (!auth?.access) return null;
//     try {
//       return jwtDecode(auth.access);
//     } catch {
//       return null;
//     }
//   });

//   useEffect(() => {
//     if (auth?.access) {
//       localStorage.setItem("auth", JSON.stringify(auth));
//       try {
//         setUser(jwtDecode(auth.access));
//       } catch {
//         setUser(null);
//       }
//     } else {
//       localStorage.removeItem("auth");
//       setUser(null);
//     }
//   }, [auth]);

//   const login = async (email, password) => {
//     const res = await api.loginRequest({ email, password });
//     setAuth(res.data);
//     return res.data;
//   };

//   const logout = () => {
//     setAuth(null);
//     setUser(null);
//   };

//   // Auto refresh
//   useEffect(() => {
//     let iv;
//     if (auth?.refresh) {
//       iv = setInterval(async () => {
//         try {
//           const r = await api.refreshRequest(auth.refresh);
//           setAuth((prev) => ({ ...prev, access: r.data.access }));
//         } catch {
//           setAuth(null);
//         }
//       }, 1000 * 60 * 4);
//     }
//     return () => clearInterval(iv);
//   }, [auth?.refresh]);

//   // Memoize to prevent re-renders
//   const value = useMemo(() => ({ auth, user, login, logout }), [auth, user]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export { AuthProvider };
// export default AuthContext;

// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useMemo } from "react";
import * as api from "../features/auth/api"; // your login/refresh API calls

// Create Context
const AuthContext = createContext(null);

// Provider
function AuthProvider({ children }) {
  // Load auth from localStorage
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth")) || null;
    } catch {
      return null;
    }
  });

  // Load user from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  // Sync auth & user to localStorage
  useEffect(() => {
    if (auth?.access) {
      localStorage.setItem("auth", JSON.stringify(auth));
      if (user) localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, [auth, user]);

  // Login function
  const login = async (email, password) => {
    const res = await api.loginRequest({ email, password });
    const { access, refresh, user } = res.data;

    if (!user) throw new Error("User object not returned from API");

    // Set state and localStorage
    setAuth({ access, refresh });
    setUser(user);

    return res.data;
  };

  // Logout function
  const logout = () => {
    setAuth(null);
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
  };

  // Auto-refresh access token every 4 minutes
  useEffect(() => {
    if (!auth?.refresh) return;

    const interval = setInterval(async () => {
      try {
        const r = await api.refreshRequest(auth.refresh);
        setAuth((prev) => ({ ...prev, access: r.data.access }));
      } catch (err) {
        console.error("Token refresh failed", err);
        logout();
      }
    }, 1000 * 60 * 4); // 4 minutes

    return () => clearInterval(interval);
  }, [auth?.refresh]);

  // Memoize context value
  const value = useMemo(() => ({ auth, user, login, logout }), [auth, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
export default AuthContext;
