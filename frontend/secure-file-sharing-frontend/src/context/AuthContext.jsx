import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextCreate";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Restore auth state from localStorage on app load.
  // Do not clear on new tabs, because localStorage is shared across tabs.
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("authUser");

    setIsLoggedIn(!!token);
    try {
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      localStorage.removeItem("authUser");
      setUser(null);
    }

    setLoading(false);
  }, []);

  // Listen for storage changes (logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("authUser");
      setIsLoggedIn(!!token);
      try {
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        localStorage.removeItem("authUser");
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const login = useCallback((token, nextUser = null) => {
    localStorage.setItem("token", token);
    if (nextUser) {
      localStorage.setItem("authUser", JSON.stringify(nextUser));
    }
    setIsLoggedIn(true);
    setUser(nextUser);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem("authUser", JSON.stringify(nextUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, user, logout, login, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
