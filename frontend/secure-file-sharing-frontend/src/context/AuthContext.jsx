import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./authContextCreate";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Verify token validity on app load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("authUser");
      
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get("http://localhost:5000/api/auth/verify", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const verifiedUser = response.data?.user || (storedUser ? JSON.parse(storedUser) : null);
        setIsLoggedIn(true);
        setUser(verifiedUser);
        if (verifiedUser) {
          localStorage.setItem("authUser", JSON.stringify(verifiedUser));
        }
      } catch {
        // Token is invalid or expired, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Listen for storage changes (logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("authUser");
      setIsLoggedIn(!!token);
      setUser(storedUser ? JSON.parse(storedUser) : null);
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
