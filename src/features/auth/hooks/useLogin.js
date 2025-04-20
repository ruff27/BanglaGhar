import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Correct the import path for AuthContext
import { useAuth } from "../../../context/AuthContext"; // Corrected path

/**
 * @hook useLogin
 * Handles the state and logic for the user login process.
 * @returns {object} - Login state, handlers, and form data.
 */
const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for feedback and loading
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // For success message

  /**
   * Handles changes in the email input field.
   */
  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);
      if (error) setError(""); // Clear error on input change
    },
    [error]
  );

  /**
   * Handles changes in the password input field.
   */
  const handlePasswordChange = useCallback(
    (event) => {
      setPassword(event.target.value);
      if (error) setError(""); // Clear error on input change
    },
    [error]
  );

  /**
   * Handles the login form submission.
   * Performs basic validation and calls the login function from AuthContext.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleLoginSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(""); // Clear previous errors

      // Basic validation
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      // Simple email format check (consider a more robust library if needed)
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setIsSubmitting(true); // Set loading state

      try {
        console.log(`Attempting login for: ${email}`); // Debug log
        await login(email, password); // Call login from AuthContext
        console.log(`Login successful for: ${email}`); // Debug log
        setOpenSnackbar(true); // Show success message
        // Navigate after a short delay to allow snackbar visibility
        setTimeout(() => {
          navigate("/"); // Navigate to home page or dashboard
        }, 1500);
      } catch (err) {
        console.error("Login error:", err); // Log the actual error
        // Provide user-friendly error messages
        const message =
          err.message ||
          "Login failed. Please check your credentials and try again.";
        // Customize messages based on common Cognito errors if needed
        if (message.includes("UserNotFoundException")) {
          setError("No account found with this email.");
        } else if (message.includes("NotAuthorizedException")) {
          setError("Incorrect email or password.");
        } else if (message.includes("UserNotConfirmedException")) {
          setError(
            "Account not verified. Please check your email for verification instructions or sign up again."
          );
        } else {
          setError(message);
        }
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
    },
    [email, password, login, navigate]
  ); // Dependencies

  /**
   * Handles closing the success snackbar.
   */
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  }, []);

  // Return all necessary state and handlers
  return {
    email,
    password,
    error,
    isSubmitting,
    openSnackbar,
    handleEmailChange,
    handlePasswordChange,
    handleLoginSubmit,
    handleCloseSnackbar,
  };
};

export default useLogin;
