import { useState, useEffect, useCallback } from "react";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../../../aws/CognitoConfig"; // Adjust path as needed
import { useAuth } from "../../../context/AuthContext"; // Adjust path as needed

/**
 * @hook useProfileManagement
 * Manages state and logic for the User Profile feature, including data fetching,
 * updates (name, picture, password), account deletion, and dialog states.
 */
const useProfileManagement = () => {
  const { user: contextUser, logout, isLoggedIn, updateAuthState } = useAuth();

  // --- State ---
  const [profileData, setProfileData] = useState(null); // { name, email, sub, email_verified, picture }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For page-level errors (e.g., initial fetch)
  const [isUpdating, setIsUpdating] = useState(false); // For async operations (updates, delete)
  const [dialogError, setDialogError] = useState(""); // For errors within dialogs

  // Dialog states
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form states for dialogs
  const [editNameValue, setEditNameValue] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // Removed profilePic state from here, handled directly in update function

  // --- Fetching ---
  const fetchProfileData = useCallback(async () => {
    if (!isLoggedIn) {
      // setError("Please log in to view profile."); // Let page handle this via isLoggedIn check
      setLoading(false);
      setProfileData(null); // Ensure data is cleared if logged out
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
      // Promisify getSession
      const session = await new Promise((resolve, reject) => {
        currentUser.getSession((err, session) => {
          if (err) return reject(err);
          if (!session?.isValid()) return reject(new Error("Session invalid."));
          resolve(session);
        });
      });

      // Promisify getUserAttributes
      const attributes = await new Promise((resolve, reject) => {
        currentUser.getUserAttributes((err, attributes) =>
          err ? reject(err) : resolve(attributes)
        );
      });

      const userAttrs = attributes.reduce((acc, attr) => {
        acc[attr.getName()] = attr.getValue();
        return acc;
      }, {});

      console.log("Profile Hook: Fetched Attributes:", userAttrs);
      setProfileData(userAttrs);
      setEditNameValue(userAttrs.name || ""); // Initialize edit field
    } catch (err) {
      console.error("Profile Hook Fetch Error:", err);
      setError(
        `Failed to load profile data: ${
          err?.message || "Unknown error"
        }. Please try logging in again.`
      );
      setProfileData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]); // Re-fetch if isLoggedIn changes

  // --- Dialog Open/Close ---
  const openEditNameDialog = useCallback(() => {
    setEditNameValue(profileData?.name || "");
    setDialogError("");
    setEditNameOpen(true);
  }, [profileData]);
  const closeEditNameDialog = useCallback(() => setEditNameOpen(false), []);
  const openPasswordDialog = useCallback(() => {
    setOldPassword("");
    setNewPassword("");
    setDialogError("");
    setPasswordOpen(true);
  }, []);
  const closePasswordDialog = useCallback(() => setPasswordOpen(false), []);
  const openDeleteDialog = useCallback(() => {
    setDialogError("");
    setDeleteOpen(true);
  }, []);
  const closeDeleteDialog = useCallback(() => setDeleteOpen(false), []);

  // --- Helper for Cognito Actions ---
  const performCognitoAction = useCallback(async (action) => {
    setIsUpdating(true);
    setDialogError(""); // Clear previous dialog errors
    setError(null); // Clear previous page errors
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      const errMsg = "Not signed in.";
      setError(errMsg); // Show error on page
      setDialogError(errMsg); // Also show in dialog if open
      setIsUpdating(false);
      return false; // Indicate failure
    }

    try {
      const session = await new Promise((resolve, reject) => {
        currentUser.getSession((err, session) =>
          err || !session?.isValid()
            ? reject(err || new Error("Session invalid."))
            : resolve(session)
        );
      });
      await action(currentUser); // Execute the specific Cognito action
      return true; // Indicate success
    } catch (err) {
      console.error("Cognito Action Error:", err);
      const errMsg = `Operation failed: ${err.message || "Unknown error"}`;
      setError(errMsg); // Show error on page
      setDialogError(errMsg); // Show error in dialog
      return false; // Indicate failure
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // --- Action Handlers ---
  const handleUpdateName = useCallback(async () => {
    if (!editNameValue.trim()) {
      setDialogError("Name cannot be empty.");
      return;
    }

    const success = await performCognitoAction(async (currentUser) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: "name", Value: editNameValue }),
      ];
      await new Promise((resolve, reject) => {
        currentUser.updateAttributes(attributeList, (err, result) =>
          err ? reject(err) : resolve(result)
        );
      });
    });

    if (success) {
      setProfileData((prev) => ({ ...prev, name: editNameValue }));
      if (updateAuthState && contextUser) {
        updateAuthState(true, { ...contextUser, name: editNameValue });
      }
      closeEditNameDialog();
    }
  }, [
    editNameValue,
    performCognitoAction,
    closeEditNameDialog,
    updateAuthState,
    contextUser,
  ]);

  const handleChangePassword = useCallback(async () => {
    if (!oldPassword || !newPassword) {
      setDialogError("Please enter both current and new passwords.");
      return;
    }
    // Add password complexity validation here if desired

    const success = await performCognitoAction(async (currentUser) => {
      await new Promise((resolve, reject) => {
        currentUser.changePassword(oldPassword, newPassword, (err, result) =>
          err ? reject(err) : resolve(result)
        );
      });
    });

    if (success) {
      closePasswordDialog();
      // Optionally trigger a success snackbar from the page component
    }
  }, [oldPassword, newPassword, performCognitoAction, closePasswordDialog]);

  const handleDeleteAccount = useCallback(async () => {
    const success = await performCognitoAction(async (currentUser) => {
      await new Promise((resolve, reject) => {
        currentUser.deleteUser((err, result) =>
          err ? reject(err) : resolve(result)
        );
      });
    });

    if (success) {
      closeDeleteDialog();
      logout(); // Logout after successful deletion
    }
  }, [performCognitoAction, closeDeleteDialog, logout]);

  const handleUpdatePicture = useCallback(
    async (base64String) => {
      if (!base64String || !base64String.startsWith("data:image")) {
        setError("Invalid image data format."); // Show error on main page
        return;
      }
      // Add size check here if needed before calling performCognitoAction

      const success = await performCognitoAction(async (currentUser) => {
        // Ensure 'picture' is the correct attribute name in your Cognito User Pool
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
        // Optionally trigger a success snackbar from the page component
      } else {
        // Error is already set by performCognitoAction
      }
    },
    [performCognitoAction]
  );

  return {
    // Data & State
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
