// src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios"; // Import axios
import {
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { userPool } from "../aws/CognitoConfig";

// Define the API base URL (adjust if needed, use environment variables ideally)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Will store merged Cognito + Profile data
  const [idToken, setIdToken] = useState(null); // Store the JWT token
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initial check
  const [error, setError] = useState(null);
  const [authTrigger, setAuthTrigger] = useState(0); // Keep to trigger re-check

  // --- Helper Function to Fetch User Profile ---
  const fetchAndSetUserProfile = useCallback(
    async (cognitoUserAttributes, token) => {
      if (!token) {
        console.error("Profile Fetch Error: No token provided.");
        // Keep Cognito attributes but indicate profile couldn't be fetched
        setUser(cognitoUserAttributes);
        return;
      }
      console.log("Attempting to fetch user profile from backend...");
      try {
        const response = await axios.get(`${API_BASE_URL}/user-profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userProfileData = response.data;
        console.log("Fetched User Profile Data:", userProfileData);

        // Merge Cognito attributes and backend profile data
        const mergedUserData = {
          ...cognitoUserAttributes, // (e.g., name, email from Cognito)
          ...userProfileData, // (e.g., approvalStatus, govtIdUrl, isAdmin from MongoDB)
          // Ensure key fields like email aren't overwritten if they exist in both
          email: cognitoUserAttributes.email || userProfileData.email, // Prioritize Cognito email
          cognitoSub: cognitoUserAttributes.sub || userProfileData.cognitoSub,
        };

        setUser(mergedUserData);
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        // Store merged data - careful about size if profile grows
        localStorage.setItem("user", JSON.stringify(mergedUserData));
        localStorage.setItem("idToken", token); // Store token
      } catch (err) {
        console.error(
          "Error fetching user profile:",
          err.response?.data || err.message
        );
        setError(
          `Failed to load user profile: ${
            err.response?.data?.message || err.message
          }`
        );
        // If profile fetch fails, still set user with Cognito data but mark as not fully loaded?
        // Or potentially log out if profile is critical? For now, just set Cognito data.
        setUser(cognitoUserAttributes);
        setIsLoggedIn(true); // Still logged into Cognito
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(cognitoUserAttributes));
        localStorage.removeItem("idToken"); // Remove token if profile fetch failed
      }
    },
    []
  ); // No dependencies needed here as args are passed

  // --- Check Auth State (Modified) ---
  const checkAuthState = useCallback(() => {
    console.log("Checking auth state...");
    setIsLoading(true);
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession(async (err, session) => {
        // Make async
        if (err || !session?.isValid()) {
          console.log(
            "Session error or invalid:",
            err?.message || "Invalid session"
          );
          setIsLoggedIn(false);
          setUser(null);
          setIdToken(null);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user");
          localStorage.removeItem("idToken");
          setIsLoading(false);
          return;
        }

        // Session is valid, get attributes and token
        const token = session.getIdToken().getJwtToken();
        setIdToken(token);

        currentUser.getUserAttributes(async (attrErr, attributes) => {
          // Make async
          if (attrErr) {
            console.error("Attributes error:", attrErr);
            // Decide how to handle - log out? Show error?
            setError(`Failed to get user attributes: ${attrErr.message}`);
            setIsLoggedIn(false); // Log out if attributes fail
            setUser(null);
            setIdToken(null);
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("user");
            localStorage.removeItem("idToken");
            setIsLoading(false);
            return;
          }

          const userAttributes = attributes.reduce((acc, attr) => {
            acc[attr.getName()] = attr.getValue();
            return acc;
          }, {});
          const cognitoData = {
            name: userAttributes.name,
            email: userAttributes.email,
            sub: userAttributes.sub,
            // Add sub if needed: sub: userAttributes.sub
          };

          // Now fetch the backend profile
          await fetchAndSetUserProfile(cognitoData, token);
          setIsLoading(false);
        });
      });
    } else {
      console.log("No current user found.");
      setIsLoggedIn(false);
      setUser(null);
      setIdToken(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      localStorage.removeItem("idToken");
      setIsLoading(false);
    }
  }, [fetchAndSetUserProfile]); // Add dependency

  // Check auth state on mount and when authTrigger changes
  useEffect(() => {
    // Attempt to load from localStorage first for faster UI feedback
    const storedLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("idToken");

    if (storedLoggedIn && storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIdToken(storedToken);
        setIsLoggedIn(true);
        console.log("Restored session from localStorage.");
      } catch (e) {
        console.error("Failed to parse stored user data.");
        localStorage.clear(); // Clear invalid storage
      }
    }
    // Always validate with Cognito eventually
    checkAuthState();
  }, [authTrigger, checkAuthState]); // Include checkAuthState dependency

  // --- Login (Modified) ---
  const login = (useremail, password) => {
    return new Promise((resolve, reject) => {
      const userCognito = new CognitoUser({
        Username: useremail,
        Pool: userPool,
      });
      const authDetails = new AuthenticationDetails({
        Username: useremail,
        Password: password,
      });

      userCognito.authenticateUser(authDetails, {
        onSuccess: async (session) => {
          // Make async
          console.log("Cognito login success");
          setError(null);
          const token = session.getIdToken().getJwtToken();
          setIdToken(token);

          userCognito.getUserAttributes(async (err, attributes) => {
            // Make async
            if (err) {
              setError(err.message);
              setIdToken(null); // Clear token on error
              reject(err);
              return;
            }
            const userAttributes = attributes.reduce((acc, attr) => {
              acc[attr.getName()] = attr.getValue();
              return acc;
            }, {});
            const cognitoData = {
              name: userAttributes.name,
              email: userAttributes.email,
              sub: userAttributes.sub,
            };

            // Fetch profile and update state
            await fetchAndSetUserProfile(cognitoData, token);
            setAuthTrigger((prev) => prev + 1); // Trigger re-check/update if needed
            resolve(user); // Resolve with the final merged user state
          });
        },
        onFailure: (err) => {
          console.error("Cognito login failure:", err);
          setError(err.message || "Login failed");
          setIsLoggedIn(false);
          setUser(null);
          setIdToken(null);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user");
          localStorage.removeItem("idToken");
          reject(err);
        },
        // Added newPasswordRequired callback (good practice)
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log("New password required");
          // Remove irrelevant attributes
          delete userAttributes.email_verified;
          // Pass user attributes and required attributes to a dedicated component/page
          // navigate('/new-password', { state: { userAttributes, requiredAttributes } });
          setError("New password required. Please complete the process."); // Inform user
          reject(new Error("New password required.")); // Reject promise
        },
      });
    });
  };

  // --- Signup (Remains largely the same, profile created on first login) ---
  const signup = (useremail, username, password) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: "email", Value: useremail }),
        new CognitoUserAttribute({ Name: "name", Value: username }),
      ];

      userPool.signUp(
        useremail,
        password,
        attributeList,
        null,
        (err, result) => {
          if (err) {
            setError(err.message || "Signup failed");
            reject(err);
            return;
          }
          setError(null);
          resolve(result);
        }
      );
    });
  };

  // --- Logout (Modified) ---
  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    // Clear all auth state
    setIsLoggedIn(false);
    setUser(null);
    setIdToken(null);
    setError(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("idToken");
    setAuthTrigger((prev) => prev + 1); // Trigger re-check if needed
    console.log("User logged out.");
  };

  // --- Update Auth State (Removed - merged into fetchAndSetUserProfile) ---
  // const updateAuthState = (loggedIn, userData) => { ... } // Removed

  const value = {
    isLoggedIn,
    user, // This now contains merged data including approvalStatus etc.
    idToken, // Provide the token if needed elsewhere
    isLoading, // Provide loading state
    error,
    login,
    logout,
    signup,
    checkAuthState, // Keep this for manual checks if needed
    // updateAuthState, // Removed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
