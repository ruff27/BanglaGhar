import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Snackbar,
  Avatar,
  styled,
  Button,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// Import the new hook and form component
import useSignup from "../features/auth/hooks/useSignup"; // Adjust path
import SignupForm from "../features/auth/components/SignupForm"; // Adjust path

// --- Styled Components (Copied from original - Page structure specific) ---
const SignupPaper = styled(Paper)(({ theme }) => ({
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
 * Signup Page Component
 * Renders the signup page structure, including the SignupForm component.
 * Handles displaying errors and success messages from the useSignup hook.
 */
const Signup = () => {
  const navigate = useNavigate();
  // Use the custom hook to get state and handlers
  const {
    email,
    username,
    password,
    confirmPass,
    error,
    isSubmitting,
    openSnackbar,
    passwordValidation, // Get validation state object
    isPasswordValid, // Get overall validity boolean
    handleEmailChange,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPassChange,
    handleSignupSubmit,
    handleCloseSnackbar,
  } = useSignup();

  const handleCancel = () => {
    navigate("/home"); // Navigate to the home page
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <SignupPaper elevation={3}>
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>

        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
        >
          Sign Up
        </Typography>

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

        {/* Render the SignupForm component */}
        <SignupForm
          email={email}
          username={username}
          password={password}
          confirmPass={confirmPass}
          passwordValidation = {passwordValidation}
          isPasswordValid={isPasswordValid} // Pass overall validity
          onEmailChange={handleEmailChange}
          onUsernameChange={handleUsernameChange}
          onPasswordChange={handlePasswordChange}
          onConfirmPassChange={handleConfirmPassChange}
          onSubmit={handleSignupSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Link to Login Page */}
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#2B7B8C", textDecoration: "none" }}
          >
            Log in
          </Link>
        </Typography>

        <Box
          sx={{
            width: "100%",
            mt: 3,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            // Use primary color for outline - more visible & professional than inherit grey
            color="primary"
            onClick={handleCancel}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Cancel & Go Home
          </Button>
        </Box>
      </SignupPaper>

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
          Successfully signed up! Please verify your email with OTP.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Signup;
