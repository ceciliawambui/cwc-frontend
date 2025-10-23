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
    const res = await api.loginRequest({ email, password });
    const { access, refresh, user } = res.data;

    if (!user) throw new Error("User object not returned from API");

    setAuth({ access, refresh });
    setUser(user);

    return res.data;
  };

  const logout = () => {
    setAuth(null);
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
  };

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
    }, 1000 * 60 * 4); 

    return () => clearInterval(interval);
  }, [auth?.refresh]);

  const value = useMemo(() => ({ auth, user, login, logout }), [auth, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
export default AuthContext;
