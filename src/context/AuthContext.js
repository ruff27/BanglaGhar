import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import {
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { userPool } from "../aws/CognitoConfig";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Will store merged Cognito + Profile data
  const [idToken, setIdToken] = useState(null); // Store the JWT token
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authTrigger, setAuthTrigger] = useState(0);

  const fetchAndSetUserProfile = useCallback(
    async (cognitoUserAttributes, token) => {
      if (!token) {
        console.error("Profile Fetch Error: No token provided.");
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

        const mergedUserData = {
          ...cognitoUserAttributes,
          ...userProfileData,
          email: cognitoUserAttributes.email || userProfileData.email,
          cognitoSub: cognitoUserAttributes.sub || userProfileData.cognitoSub,
        };

        setUser(mergedUserData);
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(mergedUserData));
        localStorage.setItem("idToken", token);
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
        setUser(cognitoUserAttributes);
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(cognitoUserAttributes));
        localStorage.removeItem("idToken");
      }
    },
    []
  );

  const checkAuthState = useCallback(() => {
    console.log("Checking auth state...");
    setIsLoading(true);
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession(async (err, session) => {
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

        const token = session.getIdToken().getJwtToken();
        setIdToken(token);

        currentUser.getUserAttributes(async (attrErr, attributes) => {
          if (attrErr) {
            console.error("Attributes error:", attrErr);
            setError(`Failed to get user attributes: ${attrErr.message}`);
            setIsLoggedIn(false);
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
          };

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
  }, [fetchAndSetUserProfile]);

  useEffect(() => {
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
        localStorage.clear();
      }
    }
    checkAuthState();
  }, [authTrigger, checkAuthState]);

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
          console.log("Cognito login success");
          setError(null);
          const token = session.getIdToken().getJwtToken();
          setIdToken(token);

          userCognito.getUserAttributes(async (err, attributes) => {
            if (err) {
              setError(err.message);
              setIdToken(null);
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

            await fetchAndSetUserProfile(cognitoData, token);
            setAuthTrigger((prev) => prev + 1);
            resolve(user);
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
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log("New password required");
          delete userAttributes.email_verified;
          setError("New password required. Please complete the process.");
          reject(new Error("New password required."));
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

  const value = {
    isLoggedIn,
    user,
    idToken,
    isLoading,
    error,
    login,
    logout,
    signup,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
