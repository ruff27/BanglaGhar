import React from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  CircularProgress, // Import CircularProgress for loading indicator
} from "@mui/material";

// --- Styled Components (Copied from original Login.js - specific to form button) ---
// You might move this to a shared button component later if used elsewhere
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
 * @param {string} [props.error] - Optional: Error message specifically for fields (not used here, page handles general error)
 */
const LoginForm = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  // error // Not passing field-specific errors currently
}) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
      {/* Email Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email" // Add id for accessibility
        label="Email"
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
        label="Password"
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
        {isSubmitting ? "Signing In..." : "Sign In"}
      </StyledButton>
    </Box>
  );
};

export default LoginForm;
