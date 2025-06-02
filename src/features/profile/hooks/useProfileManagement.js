import { useState, useEffect, useCallback } from "react";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../../../aws/CognitoConfig"; 
import { useAuth } from "../../../context/AuthContext";
import axios from "axios"; // <<< ADDED for API calls

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * @hook useProfileManagement
 * Manages state and logic for the User Profile feature, including data fetching,
 * updates (name, picture, password), account deletion, and dialog states.
 */
const useProfileManagement = () => {
  const {
    user: contextUser,
    logout,
    isLoggedIn,
    idToken,
    checkAuthState,
  } = useAuth();

  // --- State ---
  const [profileData, setProfileData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false); 
  const [dialogError, setDialogError] = useState(""); 

  // Dialog states
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form states for dialogs
  const [editNameValue, setEditNameValue] = useState(""); 
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fetchProfileData = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      setProfileData(null);
      return;
    }
    setLoading(true);
    setError(null);
    const currentUser = userPool.getCurrentUser();

    if (!currentUser) {
      setError("No active user session found.");
      setLoading(false);
      return;
    }

    try {
      // Get session
      await new Promise((resolve, reject) => {
        currentUser.getSession((err, session) => {
          if (err) return reject(err);
          if (!session?.isValid()) return reject(new Error("Session invalid."));
          resolve(session);
        });
      });

      // Get attributes from Cognito
      const attributes = await new Promise((resolve, reject) => {
        currentUser.getUserAttributes((err, attributes) =>
          err ? reject(err) : resolve(attributes)
        );
      });

      const userAttrs = attributes.reduce((acc, attr) => {
        acc[attr.getName()] = attr.getValue();
        return acc;
      }, {});

      console.log("Profile Hook: Fetched Cognito Attributes:", userAttrs);

      console.log(
        "HOOK: Context User Before Merge:",
        JSON.stringify(contextUser, null, 2)
      );
      console.log(
        "HOOK: Cognito Attrs Before Merge:",
        JSON.stringify(userAttrs, null, 2)
      );
      const mergedData = {
        ...userAttrs, 
        ...(contextUser || {}), 
        email: userAttrs.email || contextUser?.email,
      };

      setProfileData(mergedData);
      setEditNameValue(mergedData.displayName || mergedData.name || "");
    } catch (err) {
      console.error("Profile Hook Fetch Error:", err);
      setError(
        `Failed to load profile data: ${
          err?.message || "Unknown error"
        }. Please try logging in again.`
      );
      setProfileData(null); 
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, contextUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const openEditNameDialog = useCallback(() => {
    setEditNameValue(profileData?.displayName || profileData?.name || "");
    setDialogError("");
    setEditNameOpen(true);
  }, [profileData]);

  const closeEditNameDialog = useCallback(() => setEditNameOpen(false), []);
  const openPasswordDialog = useCallback(() => {
    /* ... unchanged ... */ setOldPassword("");
    setNewPassword("");
    setDialogError("");
    setPasswordOpen(true);
  }, []);
  const closePasswordDialog = useCallback(() => setPasswordOpen(false), []);
  const openDeleteDialog = useCallback(() => {
    /* ... unchanged ... */ setDialogError("");
    setDeleteOpen(true);
  }, []);
  const closeDeleteDialog = useCallback(() => setDeleteOpen(false), []);

  const performCognitoAction = useCallback(async (action) => {
    setIsUpdating(true);
    setDialogError("");
    setError(null);
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      const errMsg = "Not signed in.";
      setError(errMsg);
      setDialogError(errMsg);
      setIsUpdating(false);
      return false;
    }
    try {
      await new Promise((resolve, reject) => {
        currentUser.getSession((err, session) =>
          err || !session?.isValid()
            ? reject(err || new Error("Session invalid."))
            : resolve(session)
        );
      });
      await action(currentUser);
      return true;
    } catch (err) {
      console.error("Cognito Action Error:", err);
      const errMsg = `Operation failed: ${err.message || "Unknown error"}`;
      setError(errMsg);
      setDialogError(errMsg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);
  const handleUpdateName = useCallback(async () => {
    if (!editNameValue.trim()) {
      setDialogError("Display name cannot be empty.");
      return;
    }
    if (!idToken) {
      setDialogError("Authentication error. Please log in again.");
      return;
    }

    setIsUpdating(true);
    setDialogError("");
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/user-profiles/me`, 
        { displayName: editNameValue.trim() }, 
        {
          headers: {
            Authorization: `Bearer ${idToken}`, 
            "Content-Type": "application/json",
          },
        }
      );

      const updatedDisplayName =
        response.data.userProfile?.displayName || editNameValue.trim(); 

      setProfileData((prev) => ({
        ...prev,
        displayName: updatedDisplayName, 
      }));

      if (checkAuthState) {
        await checkAuthState();
      }

      closeEditNameDialog();
    } catch (err) {
      console.error("Error updating profile via API:", err.response || err);
      const apiErrorMessage =
        err.response?.data?.message || "Failed to update profile name.";
      setDialogError(apiErrorMessage);
      setError(apiErrorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [
    editNameValue,
    idToken, 
    closeEditNameDialog,
    checkAuthState,
  ]);
  

  const handleChangePassword = useCallback(async () => {
    if (!oldPassword || !newPassword) {
      setDialogError("Please enter both current and new passwords.");
      return;
    }
    const success = await performCognitoAction(async (currentUser) => {
      await new Promise((resolve, reject) => {
        currentUser.changePassword(oldPassword, newPassword, (err, result) =>
          err ? reject(err) : resolve(result)
        );
      });
    });
    if (success) {
      closePasswordDialog(); /* Optionally trigger success snackbar */
    }
  }, [oldPassword, newPassword, performCognitoAction, closePasswordDialog]);

  const handleDeleteAccount = useCallback(async () => {
    // ... (Your existing delete account logic using performCognitoAction remains here) ...
    const success = await performCognitoAction(async (currentUser) => {
      await new Promise((resolve, reject) => {
        currentUser.deleteUser((err, result) =>
          err ? reject(err) : resolve(result)
        );
      });
    });
    if (success) {
      closeDeleteDialog();
      logout();
    }
  }, [performCognitoAction, checkAuthState, closeDeleteDialog, logout]);

  const handleUpdatePicture = useCallback(
    async (base64String) => {

      if (!base64String || !base64String.startsWith("data:image")) {
        setError("Invalid image data format.");
        return;
      }
      const success = await performCognitoAction(async (currentUser) => {
        const attributeList = [
          new CognitoUserAttribute({ Name: "picture", Value: base64String }),
        ];
        await new Promise((resolve, reject) => {
          currentUser.updateAttributes(attributeList, (err, result) =>
            err ? reject(err) : resolve(result)
          );
        });
      });
      if (success) {
        setProfileData((prev) => ({ ...prev, picture: base64String }));
      }
    },
    [performCognitoAction /*, checkAuthState*/] // Add dependency if using refresh
  );

  return {
    profileData, 
    loading,
    error,
    isUpdating,
    dialogError,
    // Dialog States
    editNameOpen,
    passwordOpen,
    deleteOpen,
    // Form Values
    editNameValue, 
    oldPassword,
    newPassword,
    // Form Setters
    setEditNameValue,
    setOldPassword,
    setNewPassword,
    // Dialog Open/Close
    openEditNameDialog,
    closeEditNameDialog,
    openPasswordDialog,
    closePasswordDialog,
    openDeleteDialog,
    closeDeleteDialog,
    // Actions
    handleUpdateName, 
    handleChangePassword, 
    handleDeleteAccount, 
    handleUpdatePicture, 
  };
};

export default useProfileManagement;
