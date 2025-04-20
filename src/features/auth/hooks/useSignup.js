import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed

/**
 * @hook useSignup
 * Handles the state and logic for the user signup process.
 * @returns {object} - Signup state, handlers, form data, and validation status.
 */
const useSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth(); // Get signup function from context

  // Form fields state
  const [email, setEmail] = useState(""); // Renamed from useremail for consistency
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Feedback and loading state
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasNumber: false,
    hasSpecial: false,
    hasUppercase: false,
    hasLowercase: false,
    hasMinLength: false,
  });

  /**
   * Validates the password based on Cognito requirements.
   * @param {string} pwd - The password string to validate.
   */
  const validatePassword = useCallback((pwd) => {
    setPasswordValidation({
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd), // Match Cognito special chars
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasMinLength: pwd.length >= 8,
    });
  }, []);

  /**
   * Checks if all password requirements are met.
   * @returns {boolean} - True if the password is valid, false otherwise.
   */
  const isPasswordValid = useCallback(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  // --- Input Change Handlers ---
  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);
      if (error) setError("");
    },
    [error]
  );

  const handleUsernameChange = useCallback(
    (event) => {
      setUsername(event.target.value);
      if (error) setError("");
    },
    [error]
  );

  const handlePasswordChange = useCallback(
    (event) => {
      const newPassword = event.target.value;
      setPassword(newPassword);
      validatePassword(newPassword); // Validate on change
      if (error) setError("");
    },
    [error, validatePassword]
  );

  const handleConfirmPassChange = useCallback(
    (event) => {
      setConfirmPass(event.target.value);
      if (error) setError("");
    },
    [error]
  );

  /**
   * Handles the signup form submission.
   * Performs validation and calls the signup function from AuthContext.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSignupSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(""); // Clear previous errors

      // --- Validation ---
      if (!email || !username || !password || !confirmPass) {
        setError("Please fill in all required fields.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!isPasswordValid()) {
        setError("Password does not meet all requirements.");
        return;
      }
      if (password !== confirmPass) {
        setError("Passwords do not match.");
        return;
      }
      // --- End Validation ---

      setIsSubmitting(true);

      try {
        console.log(`Attempting signup for: ${email}, username: ${username}`); // Debug log
        await signup(email, username, password); // Call signup from AuthContext
        console.log(`Signup successful for: ${email}`); // Debug log
        setOpenSnackbar(true); // Show success message
        // Navigate to OTP verification page after delay
        setTimeout(() => {
          // Pass email to OTP page for verification lookup
          navigate("/verify-otp", { state: { email: email } });
        }, 1500);
      } catch (err) {
        console.error("Signup error:", err); // Log actual error
        // Provide user-friendly error messages
        const message = err.message || "Signup failed. Please try again.";
        if (message.includes("UsernameExistsException")) {
          setError("An account with this email already exists.");
        } else if (message.includes("InvalidPasswordException")) {
          setError(
            "Password does not meet requirements. Check criteria below."
          );
          // Re-validate to ensure UI hints are correct (though isPasswordValid should prevent this)
          validatePassword(password);
        } else {
          setError(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      email,
      username,
      password,
      confirmPass,
      isPasswordValid,
      signup,
      navigate,
      validatePassword,
    ]
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

  // Return state and handlers needed by the component
  return {
    email,
    username,
    password,
    confirmPass,
    error,
    isSubmitting,
    openSnackbar,
    passwordValidation, // Pass validation state for UI feedback
    isPasswordValid: isPasswordValid(), // Pass the result of the check
    handleEmailChange,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPassChange,
    handleSignupSubmit,
    handleCloseSnackbar,
  };
};

export default useSignup;
