import React, { createContext, useEffect, useState, useMemo } from "react";
import * as api from "../features/auth/api";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth")) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  // Sync auth and user to localStorage
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

  const login = async (email, password) => {
    try {
      // console.log("Attempting login with:", { email, password: "****" });
      
      const res = await api.loginRequest({ email, password });
      const { access, refresh, user: userData } = res.data;

      if (!userData) {
        throw new Error("User object not returned from API");
      }

      // console.log("Login successful, user data:", userData);

      setAuth({ access, refresh });
      setUser(userData);

      return res.data;
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    setAuth(null);
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Auto-refresh token every 4 minutes
  useEffect(() => {
    if (!auth?.refresh) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.refreshRequest();
        
        // Update only the access token, keep the refresh token
        setAuth((prev) => ({ 
          ...prev, 
          access: res.data.access 
        }));
        
        console.log("Token refreshed successfully");
      } catch (err) {
        console.error("Token refresh failed:", err);
        logout();
      }
    }, 1000 * 60 * 4); // 4 minutes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.refresh]);

  const value = useMemo(
    () => ({ 
      auth, 
      user, 
      login, 
      logout,
      isAuthenticated: !!auth?.access && !!user,
      isAdmin: user?.is_admin || user?.is_staff || user?.role === "admin",
    }), 
    [auth, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
export default AuthContext;