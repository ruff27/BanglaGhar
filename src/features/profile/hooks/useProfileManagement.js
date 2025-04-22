import { useState, useEffect, useCallback } from "react";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../../../aws/CognitoConfig"; // Adjust path as needed
import { useAuth } from "../../../context/AuthContext"; // Adjust path as needed
import axios from "axios"; // <<< ADDED for API calls

// Define the API base URL (should match AuthContext or be centralized)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * @hook useProfileManagement
 * Manages state and logic for the User Profile feature, including data fetching,
 * updates (name, picture, password), account deletion, and dialog states.
 */
const useProfileManagement = () => {
  // Get user context, including the JWT token (idToken) and potentially a refresh function
  const {
    user: contextUser,
    logout,
    isLoggedIn,
    idToken,
    checkAuthState,
  } = useAuth(); // <<< Added idToken and checkAuthState

  // --- State ---
  const [profileData, setProfileData] = useState(null); // Local copy for display/editing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false); // For async operations (updates, delete)
  const [dialogError, setDialogError] = useState(""); // For errors within dialogs

  // Dialog states
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form states for dialogs
  const [editNameValue, setEditNameValue] = useState(""); // Will hold displayName for editing
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // --- Fetching (Original Logic - gets Cognito attrs) ---
  // Keep the original fetch for now, as the previous attempt to remove it caused issues.
  // We will primarily *use* profileData.displayName later.
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

      // *** IMPORTANT: Merge with contextUser data to get displayName ***
      // Ensure profileData includes fields from both Cognito (like email_verified)
      // AND the backend profile (like displayName, approvalStatus)
      const mergedData = {
        ...userAttrs, // Cognito attributes first
        ...(contextUser || {}), // Backend profile data from context (overwrites 'name', adds 'displayName', etc.)
        // Ensure email consistency if needed
        email: userAttrs.email || contextUser?.email,
      };

      setProfileData(mergedData);
      // Initialize edit field with displayName from merged data
      setEditNameValue(mergedData.displayName || "");
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
    // Depend on contextUser as well now
  }, [isLoggedIn, contextUser]);

  useEffect(() => {
    // Fetch data when login status changes OR when contextUser potentially updates (e.g., after login)
    fetchProfileData();
  }, [fetchProfileData]); // fetchProfileData depends on isLoggedIn and contextUser

  // --- Dialog Open/Close ---
  const openEditNameDialog = useCallback(() => {
    // START MODIFICATION: Initialize with displayName
    setEditNameValue(profileData?.displayName || ""); // Use displayName from profileData
    // END MODIFICATION
    setDialogError("");
    setEditNameOpen(true);
  }, [profileData]); // Depend on profileData which holds the displayName

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

  // --- Helper for Cognito Actions (Unchanged - Used for Password/Delete/Picture) ---
  const performCognitoAction = useCallback(async (action) => {
    // ... (Your existing performCognitoAction code remains here) ...
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

  // --- Action Handlers ---

  // START MODIFICATION: handleUpdateName uses backend API now
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
    setError(null); // Clear page error

    try {
      // Call the backend PUT endpoint
      const response = await axios.put(
        `${API_BASE_URL}/user-profiles/me`, // Use your API endpoint
        { displayName: editNameValue.trim() }, // Send only the displayName
        {
          headers: {
            Authorization: `Bearer ${idToken}`, // Send the JWT token
            "Content-Type": "application/json",
          },
        }
      );

      // --- Success ---
      console.log("Profile updated via API:", response.data);

      // Update local state FIRST for immediate UI feedback on the profile page itself
      setProfileData((prev) => ({
        ...prev,
        displayName: response.data.displayName,
      }));

      // THEN, trigger AuthContext to refresh its global user object.
      // This will update other components like the Navbar.
      if (checkAuthState) {
        console.log("Calling checkAuthState to refresh context...");
        checkAuthState(); // Force AuthContext to refetch profile
      }

      // Optionally, trigger context refresh if needed elsewhere immediately
      // if (checkAuthState) {
      //     checkAuthState(); // Force AuthContext to refetch everything
      // }

      closeEditNameDialog();
      // Consider showing a success snackbar via context or props
    } catch (err) {
      console.error("Error updating profile via API:", err.response || err);
      const apiErrorMessage =
        err.response?.data?.message || "Failed to update profile name.";
      setDialogError(apiErrorMessage); // Show error in the dialog
      setError(apiErrorMessage); // Optionally show error on the page too
    } finally {
      setIsUpdating(false);
    }
  }, [
    editNameValue,
    idToken, // Need token for API call
    closeEditNameDialog,
    checkAuthState, // Add if using context refresh
  ]);
  // END MODIFICATION

  const handleChangePassword = useCallback(async () => {
    // ... (Your existing change password logic using performCognitoAction remains here) ...
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
      // ... (Your existing update picture logic using performCognitoAction remains here) ...
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
        // Optionally trigger context refresh if picture URL needs to be globally updated
        // if (checkAuthState) { checkAuthState(); }
      }
    },
    [performCognitoAction /*, checkAuthState*/] // Add dependency if using refresh
  );

  return {
    // Data & State
    profileData, // Contains merged data including displayName
    loading,
    error,
    isUpdating,
    dialogError,
    // Dialog States
    editNameOpen,
    passwordOpen,
    deleteOpen,
    // Form Values
    editNameValue, // Corresponds to displayName now
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
    handleUpdateName, // Updated to use backend API
    handleChangePassword, // Unchanged
    handleDeleteAccount, // Unchanged
    handleUpdatePicture, // Unchanged (still uses Cognito)
  };
};

export default useProfileManagement;
