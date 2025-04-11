import React, { createContext, useState, useEffect, useContext } from "react";
import {
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { userPool } from "../aws/CognitoConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [authTrigger, setAuthTrigger] = useState(0); // Added to force re-check

  // Function to check and update auth state
  const checkAuthState = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err) {
          console.error("Session error:", err);
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        if (session.isValid()) {
          currentUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error("Attributes error:", err);
              return;
            }
            const userAttributes = attributes.reduce((acc, attr) => {
              acc[attr.getName()] = attr.getValue();
              return acc;
            }, {});
            const userData = {
              name: userAttributes.name,
              email: userAttributes.email,
            };
            setUser(userData);
            setIsLoggedIn(true);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user", JSON.stringify(userData));
          });
        } else {
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user");
        }
      });
    } else {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
    }
  };

  // Check auth state on mount and when authTrigger changes
  useEffect(() => {
    checkAuthState();
  }, [authTrigger]);

  const updateAuthState = (loggedIn, userData) => {
    setIsLoggedIn(loggedIn);
    setUser(userData);
    if (loggedIn) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
    }
  };

  const signup = (useremail, username, password) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: "email", Value: useremail }),
        new CognitoUserAttribute({ Name: "name", Value: username }),
      ];

      userPool.signUp(useremail, password, attributeList, null, (err, result) => {
        if (err) {
          setError(err.message || "Signup failed");
          reject(err);
          return;
        }
        setError(null);
        resolve(result);
      });
    });
  };

  const login = (useremail, password) => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: useremail,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: useremail,
        Password: password,
      });

      user.authenticateUser(authDetails, {
        onSuccess: (session) => {
          user.getUserAttributes((err, attributes) => {
            if (err) {
              setError(err.message);
              reject(err);
              return;
            }
            const userAttributes = attributes.reduce((acc, attr) => {
              acc[attr.getName()] = attr.getValue();
              return acc;
            }, {});
            const userData = {
              name: userAttributes.name,
              email: userAttributes.email,
            };
            updateAuthState(true, userData);
            setError(null);
            setAuthTrigger((prev) => prev + 1); // Trigger re-check
            resolve(userData);
          });
        },
        onFailure: (err) => {
          setError(err.message || "Login failed");
          reject(err);
        },
      });
    });
  };

  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    updateAuthState(false, null);
    setAuthTrigger((prev) => prev + 1); // Trigger re-check
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