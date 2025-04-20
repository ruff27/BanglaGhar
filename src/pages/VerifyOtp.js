import React from "react";
// Removed Link as there are no direct links on this page in the original
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

// Import the new hook and form component
import useVerifyOtp from "../features/auth/hooks/useVerifyOtp"; // Adjust path
import VerifyOtpForm from "../features/auth/components/VerifyOtpForm"; // Adjust path

// --- Styled Components (Copied from original - Page structure specific) ---
const VerifyOtpPaper = styled(Paper)(({ theme }) => ({
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
 * VerifyOtp Page Component
 * Renders the OTP verification page structure.
 * Handles displaying email, errors, and success messages from the useVerifyOtp hook.
 */
const VerifyOtp = () => {
  // Use the custom hook to get state and handlers
  const {
    otp,
    email, // Get email from hook to display
    error,
    isSubmitting,
    openSnackbar,
    handleOtpChange,
    handleOtpSubmit,
    handleCloseSnackbar,
  } = useVerifyOtp();

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <VerifyOtpPaper elevation={3}>
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>

        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
        >
          Verify Your Email
        </Typography>

        {/* Display the email the OTP was sent to */}
        {email ? (
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            An OTP has been sent to{" "}
            <Box component="strong" sx={{ fontWeight: "medium" }}>
              {email}
            </Box>
            . Please enter it below.
          </Typography>
        ) : (
          <Typography
            variant="body1"
            color="error"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Loading email address... If this persists, please go back.
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

        {/* Render the VerifyOtpForm component only if email is present */}
        {email && (
          <VerifyOtpForm
            otp={otp}
            onOtpChange={handleOtpChange}
            onSubmit={handleOtpSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Optionally add a Resend OTP button here if needed */}
        {/* <Button disabled={isSubmitting}>Resend OTP</Button> */}
      </VerifyOtpPaper>

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
          Email verified successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VerifyOtp;
