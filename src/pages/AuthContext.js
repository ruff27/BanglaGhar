// AuthContext.js

import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // On mount, check localStorage
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");
    if (storedLoginStatus === "true" && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  // New helper to update auth state
  const updateAuthState = (loggedIn, username) => {
    setIsLoggedIn(loggedIn);
    setUser(username);
  };

  // Existing signup function (if used by other parts)
  const signup = async (username, password) => {
    try {
      setError(null);
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", username);
        updateAuthState(true, username);
        return true;
      } else {
        setError(data.error || "Signup failed");
        return false;
      }
    } catch (err) {
      console.error("Signup request failed:", err);
      setError("Server error during signup");
      return false;
    }
  };

  // Existing login function (if used elsewhere)
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", username);
        updateAuthState(true, username);
        return true;
      } else {
        setError(data.error || "Login failed");
        return false;
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Server error during login");
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setError(null);
  };

  const value = {
    isLoggedIn,
    user,
    error,
    login,
    logout,
    signup,
    updateAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
