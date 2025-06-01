import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { userPool } from "../../../aws/CognitoConfig";

/**
 * @hook useChangePassword
 * Handles the state and logic for changing a user's password when required by Cognito.
 * @returns {object} - Form state, handlers, and feedback.
 */
const useChangePassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State for form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for feedback and loading
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Retrieve email and temporary password from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingChangePasswordEmail");
    const storedTempPassword = localStorage.getItem("pendingChangePasswordTempPassword");
    if (storedEmail && storedTempPassword) {
      setEmail(storedEmail);
      setTemporaryPassword(storedTempPassword);
      console.log("Retrieved from localStorage:", { storedEmail, storedTempPassword });
    } else {
      setError("Missing email or temporary password. Please try logging in again.");
      navigate("/login");
    }
  }, [navigate]);

  /**
   * Handles changes in the name input field.
   */
  const handleNameChange = useCallback((event) => {
    const value = event.target.value;
    setName(value);
    console.log("Name input changed to:", value);
    if (error) setError("");
  }, [error]);

  /**
   * Handles changes in the temporary password input field.
   */
  const handleTemporaryPasswordChange = useCallback((event) => {
    const value = event.target.value;
    setTemporaryPassword(value);
    console.log("Temporary password input changed to:", value);
    if (error) setError("");
  }, [error]);

  /**
   * Handles changes in the new password input field.
   */
  const handleNewPasswordChange = useCallback((event) => {
    const value = event.target.value;
    setNewPassword(value);
    console.log("New password input changed to:", value);
    if (error) setError("");
  }, [error]);

  /**
   * Handles changes in the confirm password input field.
   */
  const handleConfirmPasswordChange = useCallback((event) => {
    const value = event.target.value;
    setConfirmPassword(value);
    console.log("Confirm password input changed to:", value);
    if (error) setError("");
  }, [error]);

  /**
   * Handles the change password form submission.
   * Validates inputs, re-authenticates to get a session, and completes the new password challenge.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleChangePasswordSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      console.log("Form submitted with values:", {
        name,
        temporaryPassword,
        newPassword,
        confirmPassword,
      });

      if (!name) {
        setError("Please enter your name.");
        return;
      }
      if (!temporaryPassword) {
        setError("Please enter your temporary password.");
        return;
      }
      if (!newPassword) {
        setError("Please enter a new password.");
        return;
      }
      if (!confirmPassword) {
        setError("Please confirm your new password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (name.trim().length === 0) {
        setError("Name cannot be empty.");
        return;
      }

      setIsSubmitting(true);

      try {
        console.log("Creating CognitoUser for:", email);
        const cognitoUser = new CognitoUser({
          Username: email,
          Pool: userPool,
        });

        console.log("Authenticating user with temporary password...");
        const authenticationDetails = new AuthenticationDetails({
          Username: email,
          Password: temporaryPassword,
        });

        await new Promise((resolve, reject) => {
          cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: () => {
              reject(new Error("Unexpected success during temporary password authentication."));
            },
            onFailure: (err) => {
              console.error("Authentication failure:", err);
              if (err.code === "NotAuthorizedException") {
                reject(new Error("Incorrect temporary password."));
              } else {
                reject(err);
              }
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
              console.log("newPasswordRequired triggered, proceeding with new password...");
              resolve();
            },
          });
        });

        console.log("Attempting to complete new password challenge...");
        const userAttributes = {
          name: name.trim(),
        };

        await new Promise((resolve, reject) => {
          cognitoUser.completeNewPasswordChallenge(
            newPassword,
            userAttributes,
            {
              onSuccess: async () => {
                console.log("Password changed successfully");
                localStorage.removeItem("pendingChangePasswordEmail");
                localStorage.removeItem("pendingChangePasswordTempPassword");
                await login(email, newPassword);
                setOpenSnackbar(true);
                setTimeout(() => {
                  navigate("/");
                }, 1500);
                resolve();
              },
              onFailure: (err) => {
                console.error("Password change failed:", err);
                if (err.code === "InvalidPasswordException") {
                  reject(
                    new Error(
                      "Password does not meet requirements. Must include uppercase, lowercase, numbers, and special characters."
                    )
                  );
                } else if (err.code === "NotAuthorizedException") {
                  reject(
                    new Error(
                      "Session expired or invalid. Please try logging in again."
                    )
                  );
                } else {
                  reject(err);
                }
              },
            }
          );
        });
      } catch (err) {
        console.error("Change password error:", err);
        const message =
          err.message || "Failed to change password. Please try again.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, name, temporaryPassword, newPassword, confirmPassword, login, navigate]
  );


  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  }, []);

  const hookReturn = {
    email,
    name,
    temporaryPassword,
    newPassword,
    confirmPassword,
    error,
    isSubmitting,
    openSnackbar,
    handleNameChange,
    handleTemporaryPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleChangePasswordSubmit,
    handleCloseSnackbar,
  };

  console.log("useChangePassword returning:", hookReturn);
  return hookReturn;
};

export default useChangePassword;