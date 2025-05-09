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
  const [isResending, setIsResending] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Get email from location state on component mount
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      console.warn("Email not found in location state for OTP verification.");
      setError(
        "Email address not provided. Please go back and try signing up again."
      );
    }
  }, [location.state]);

  /**
   * Handles changes in the OTP input field.
   */
  const handleOtpChange = useCallback(
    (event) => {
      const value = event.target.value.replace(/\D/g, "");
      if (value.length <= 6) {
        setOtp(value);
      }
      if (error) setError("");
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
      setError("");

      if (!email) {
        setError("Cannot verify OTP without an email address.");
        return;
      }
      if (!otp || otp.length < 6) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      setIsSubmitting(true);

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      console.log(`Attempting OTP verification for: ${email} with OTP: ${otp}`);

      cognitoUser.confirmRegistration(otp, true, (err, result) => {
        setIsSubmitting(false);
        if (err) {
          console.error("OTP verification error:", err);
          if (err.code === "CodeMismatchException") {
            setError(
              "Invalid verification code. Please check the code and try again."
            );
          } else if (err.code === "ExpiredCodeException") {
            setError(
              "Verification code has expired. Please request a new one."
            );
          } else if (err.code === "UserNotFoundException") {
            setError("User not found. Please sign up again.");
          } else {
            setError(err.message || "Failed to verify OTP. Please try again.");
          }
          return;
        }
        console.log("OTP verification successful:", result);
        setSnackbarMessage("Email verified successfully! Redirecting to login...");
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      });
    },
    [email, otp, navigate]
  );

  /**
   * Handles resending the OTP for account confirmation.
   */
  const handleResendOtp = useCallback(() => {
    if (!email) {
      setError("Cannot resend OTP without an email address.");
      return;
    }

    setIsResending(true);
    setError("");

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    console.log(`Attempting to resend OTP for: ${email}`);

    cognitoUser.resendConfirmationCode((err, result) => {
      setIsResending(false);
      if (err) {
        console.error("Resend OTP error:", err);
        if (err.code === "LimitExceededException") {
          setError(
            "Attempt limit exceeded. Please try again after some time."
          );
        } else if (err.code === "UserNotFoundException") {
          setError("User not found. Please sign up again.");
        } else {
          setError(err.message || "Failed to resend OTP. Please try again.");
        }
        return;
      }
      console.log("OTP resent successfully:", result);
      setSnackbarMessage("New OTP sent successfully!");
      setOpenSnackbar(true);
    });
  }, [email]);

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
    email,
    error,
    isSubmitting,
    isResending,
    openSnackbar,
    snackbarMessage,
    handleOtpChange,
    handleOtpSubmit,
    handleResendOtp,
    handleCloseSnackbar,
  };
};

export default useVerifyOtp;