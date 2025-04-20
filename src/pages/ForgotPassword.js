import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Snackbar,
  Avatar,
  styled,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// Import the new hook and form components
import useForgotPassword from "../features/auth/hooks/useForgotPassword"; // Adjust path
import ForgotPasswordStep1Form from "../features/auth/components/ForgotPasswordStep1Form"; // Adjust path
import ForgotPasswordStep2Form from "../features/auth/components/ForgotPasswordStep2Form"; // Adjust path

// --- Styled Components (Copied from original - Page structure specific) ---
const ForgotPasswordPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 8px 24px rgba(43, 123, 140, 0.12)",
  borderRadius: "16px",
  padding: theme.spacing(4),
  marginTop: theme.spacing(8),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  width: 56,
  height: 56,
}));

// --- Main Page Component ---

/**
 * ForgotPassword Page Component
 * Renders the multi-step password reset flow.
 * Uses the useForgotPassword hook and renders the appropriate step form.
 */
const ForgotPassword = () => {
  // Use the custom hook
  const {
    step,
    email,
    otp,
    newPassword,
    confirmPassword,
    error,
    isSubmitting,
    openSnackbar,
    passwordValidation,
    isPasswordValid,
    handleEmailChange,
    handleOtpChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSendCodeSubmit,
    handleResetPasswordSubmit,
    handleCloseSnackbar,
  } = useForgotPassword();

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <ForgotPasswordPaper elevation={3}>
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>

        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
        >
          {/* Title changes based on the current step */}
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </Typography>

        {/* Display instructions based on step */}
        {step === 1 && (
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            Enter your email address below and we'll send you a code to reset
            your password.
          </Typography>
        )}
        {step === 2 && (
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            Enter the verification code sent to{" "}
            <Box component="strong" sx={{ fontWeight: "medium" }}>
              {email}
            </Box>{" "}
            and set a new password.
          </Typography>
        )}

        {/* Display general error messages */}
        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 2, borderRadius: "8px" }}
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}

        {/* Render the correct form based on the step */}
        {step === 1 && (
          <ForgotPasswordStep1Form
            email={email}
            onEmailChange={handleEmailChange}
            onSubmit={handleSendCodeSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 2 && (
          <ForgotPasswordStep2Form
            otp={otp}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            passwordValidation={passwordValidation}
            isPasswordValid={isPasswordValid}
            onOtpChange={handleOtpChange}
            onNewPasswordChange={handleNewPasswordChange}
            onConfirmPasswordChange={handleConfirmPasswordChange}
            onSubmit={handleResetPasswordSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Link back to Login */}
        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link
            to="/login"
            style={{ color: "#2B7B8C", textDecoration: "none" }}
          >
            Back to Sign In
          </Link>
        </Typography>
      </ForgotPasswordPaper>

      {/* Snackbar for success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          Password reset successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;
