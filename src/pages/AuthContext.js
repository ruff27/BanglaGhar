// src/pages/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from "react";

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps your app and makes auth available to any child component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // On initial load, check localStorage to see if we're already logged in
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");
    if (storedLoginStatus === "true" && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  // Login function
  const login = (username) => {
    // Mark as logged in
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", username);
    setIsLoggedIn(true);
    setUser(username);
  };

  // Logout function
  const logout = () => {
    // Remove login status
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  // Signup function
  const signup = (username, password) => {
    // Check if this user already exists in localStorage
    const existingUser = localStorage.getItem(`user:${username}`);
    if (existingUser) {
      // User with this username already exists
      return false;
    }

    // Otherwise, "register" them by storing credentials in localStorage
    const userData = { password }; // You can store additional fields if needed
    localStorage.setItem(`user:${username}`, JSON.stringify(userData));

    // Automatically log them in
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", username);
    setIsLoggedIn(true);
    setUser(username);

    return true;
  };

  // The context value that will be supplied to any descendants of this provider
  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    signup, // Make sure signup is exposed here
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
