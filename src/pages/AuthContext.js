// AuthContext.js

import React, { createContext, useState, useEffect, useContext } from "react";

// Create the context
const AuthContext = createContext();

// Custom hook for easy usage
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // store the username or user object
  const [error, setError] = useState(null); // store any auth error messages

  // On mount, check localStorage to see if user is "already" logged in
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedUser = localStorage.getItem("user");
    if (storedLoginStatus === "true" && storedUser) {
      setIsLoggedIn(true);
      setUser(storedUser);
    }
  }, []);

  // Sign up function: calls our backend /api/signup
  const signup = async (username, password) => {
    try {
      setError(null); // clear previous errors

      const response = await fetch("http://localhost:5001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // success
        // Optionally, automatically log the user in:
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", username);
        setIsLoggedIn(true);
        setUser(username);
        return true;
      } else {
        // server responded with an error
        setError(data.error || "Signup failed");
        return false;
      }
    } catch (err) {
      console.error("Signup request failed:", err);
      setError("Server error during signup");
      return false;
    }
  };

  // Login function: calls our backend /api/login
  const login = async (username, password) => {
    try {
      setError(null);

      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // success
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", username);
        setIsLoggedIn(true);
        setUser(username);
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

  // Logout function: clears localStorage and state
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
