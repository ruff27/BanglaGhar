import React from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  CircularProgress, // Import CircularProgress for loading indicator
} from "@mui/material";
import { useTranslation } from "react-i18next"; // Import useTranslation

// --- Styled Components (Copied from original Login.js - specific to form button) ---
const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2), // Keep original spacing
  padding: theme.spacing(1.5),
  borderRadius: "8px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  boxShadow: "0 4px 10px rgba(43, 123, 140, 0.2)",
  "&:hover": {
    backgroundColor: "#236C7D", // Darker shade on hover
    boxShadow: "0 6px 14px rgba(43, 123, 140, 0.3)",
    transform: "translateY(-2px)", // Slight lift effect
  },
  "&:disabled": {
    // Style for disabled state
    backgroundColor: theme.palette.action.disabledBackground,
    boxShadow: "none",
    color: theme.palette.action.disabled,
    cursor: "not-allowed",
  },
}));

/**
 * LoginForm Component
 * Renders the email and password fields, and the submit button for the login form.
 * @param {object} props - Component props
 * @param {string} props.email - Current value of the email field
 * @param {string} props.password - Current value of the password field
 * @param {function} props.onEmailChange - Handler for email input changes
 * @param {function} props.onPasswordChange - Handler for password input changes
 * @param {function} props.onSubmit - Handler for form submission
 * @param {boolean} props.isSubmitting - Indicates if the form is currently submitting
 */
const LoginForm = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
      {/* Email Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email" // Add id for accessibility
        label={t("email")} // Applied translation
        name="email" // Add name attribute
        autoComplete="email" // Enable browser autofill
        autoFocus // Keep autofocus on email
        variant="outlined"
        value={email}
        onChange={onEmailChange}
        disabled={isSubmitting} // Disable field during submission
        sx={{ mb: 2 }}
        // Add aria-describedby if linking error messages
      />
      {/* Password Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="password" // Add id
        label={t("password")} // Applied translation
        name="password" // Add name attribute
        type="password"
        autoComplete="current-password" // Enable browser autofill
        variant="outlined"
        value={password}
        onChange={onPasswordChange}
        disabled={isSubmitting} // Disable field during submission
        sx={{ mb: 2 }}
        // Add aria-describedby if linking error messages
      />

      {/* Submit Button */}
      <StyledButton
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting} // Disable button when submitting
        startIcon={
          isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
        } // Show loader
      >
        {/* Applied translation */}
        {isSubmitting ? t("sending") : t("sign_in")}
      </StyledButton>
    </Box>
  );
};

export default LoginForm;
