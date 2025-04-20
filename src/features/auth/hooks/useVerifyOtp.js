import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../../../aws/CognitoConfig"; // Adjust path as needed

/**
 * @hook useVerifyOtp
 * Handles the state and logic for the OTP verification process.
 * @returns {object} - OTP state, handlers, email, and feedback status.
 */
const useVerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for OTP input
  const [otp, setOtp] = useState("");
  // State for email passed from signup/forgot password
  const [email, setEmail] = useState("");
  // State for feedback and loading
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // For success message

  // Get email from location state on component mount
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Handle case where email is missing (e.g., direct navigation)
      console.warn("Email not found in location state for OTP verification.");
      setError(
        "Email address not provided. Please go back and try signing up again."
      );
      // Optionally navigate back or show a more prominent error
      // navigate('/signup');
    }
  }, [location.state]); // Re-run if location state changes (though unlikely needed)

  /**
   * Handles changes in the OTP input field.
   */
  const handleOtpChange = useCallback(
    (event) => {
      // Allow only digits and limit length if desired (e.g., 6 digits)
      const value = event.target.value.replace(/\D/g, ""); // Remove non-digits
      if (value.length <= 6) {
        // Example length limit
        setOtp(value);
      }
      if (error) setError(""); // Clear error on input change
    },
    [error]
  );

  /**
   * Handles the OTP submission for account confirmation.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleOtpSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setError(""); // Clear previous errors

      if (!email) {
        setError("Cannot verify OTP without an email address.");
        return;
      }
      if (!otp || otp.length < 6) {
        // Check if OTP seems valid (e.g., length)
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      setIsSubmitting(true);

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      console.log(`Attempting OTP verification for: ${email} with OTP: ${otp}`); // Debug log

      // Assuming this is for confirming registration after signup
      cognitoUser.confirmRegistration(otp, true, (err, result) => {
        setIsSubmitting(false); // Reset loading state regardless of outcome
        if (err) {
          console.error("OTP verification error:", err);
          // Provide user-friendly messages
          if (err.code === "CodeMismatchException") {
            setError(
              "Invalid verification code. Please check the code and try again."
            );
          } else if (err.code === "ExpiredCodeException") {
            setError(
              "Verification code has expired. Please request a new one."
            );
            // Optionally add a resend OTP button/logic here
          } else if (err.code === "UserNotFoundException") {
            setError("User not found. Please sign up again."); // Should ideally not happen if email comes from signup
          } else {
            setError(err.message || "Failed to verify OTP. Please try again.");
          }
          return;
        }
        // Success
        console.log("OTP verification successful:", result);
        setOpenSnackbar(true); // Show success message
        // Navigate to login after delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      });
    },
    [email, otp, navigate]
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
    otp,
    email, // Return email to display on the page
    error,
    isSubmitting,
    openSnackbar,
    handleOtpChange,
    handleOtpSubmit,
    handleCloseSnackbar,
  };
};

export default useVerifyOtp;
