import React from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  Typography, // Import Typography for helper text
  CircularProgress, // Import CircularProgress
  List, // Import List components for validation feedback
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Icon for valid criteria
import CancelIcon from "@mui/icons-material/Cancel"; // Icon for invalid criteria
import { useTranslation } from "react-i18next"; // Import useTranslation

// --- Styled Components (Copied from original Signup.js - specific to form button) ---
const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: "8px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  boxShadow: "0 4px 10px rgba(43, 123, 140, 0.2)",
  "&:hover": {
    backgroundColor: "#236C7D",
    boxShadow: "0 6px 14px rgba(43, 123, 140, 0.3)",
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    // Style for disabled state
    backgroundColor: theme.palette.action.disabledBackground,
    boxShadow: "none",
    color: theme.palette.action.disabled,
    cursor: "not-allowed",
  },
}));

// Helper component for displaying password validation criteria
// Note: Criteria labels are kept hardcoded as no direct individual keys were found in en.json
const PasswordCriteria = ({ validation }) => {
  const criteria = [
    { label: "At least 8 characters", valid: validation.hasMinLength }, // Kept hardcoded
    { label: "Contains a number", valid: validation.hasNumber }, // Kept hardcoded
    {
      label: "Contains a special character (!@#$...etc)", // Kept hardcoded
      valid: validation.hasSpecial,
    },
    { label: "Contains an uppercase letter", valid: validation.hasUppercase }, // Kept hardcoded
    { label: "Contains a lowercase letter", valid: validation.hasLowercase }, // Kept hardcoded
  ];

  return (
    <List dense sx={{ p: 0, mt: 1, mb: 1 }}>
      {criteria.map((item) => (
        <ListItem key={item.label} disableGutters sx={{ py: 0.2 }}>
          <ListItemIcon sx={{ minWidth: "28px" }}>
            {item.valid ? (
              <CheckCircleIcon fontSize="small" color="success" />
            ) : (
              <CancelIcon fontSize="small" color="error" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              variant: "caption",
              color: item.valid ? "text.secondary" : "error", // Highlight invalid criteria
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};

/**
 * SignupForm Component
 * Renders the fields and button for the signup form.
 * @param {object} props - Component props including form data, handlers, validation state, and submission status.
 */
const SignupForm = ({
  email,
  username,
  password,
  confirmPass,
  passwordValidation, // Receive validation state object
  isPasswordValid, // Receive boolean if overall password is valid
  onEmailChange,
  onUsernameChange,
  onPasswordChange,
  onConfirmPassChange,
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
        id="email"
        label={t("email")} // Applied translation
        name="email"
        autoComplete="email"
        autoFocus
        variant="outlined"
        value={email}
        onChange={onEmailChange}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      />
      {/* Username Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label={t("name")} // Applied translation (using 'name' key)
        name="username"
        autoComplete="name"
        variant="outlined"
        value={username}
        onChange={onUsernameChange}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      />
      {/* Password Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="password"
        label={t("password")} // Applied translation
        name="password"
        type="password"
        autoComplete="new-password" // Hint for password managers
        variant="outlined"
        value={password}
        onChange={onPasswordChange}
        disabled={isSubmitting}
        sx={{ mb: 0 }} // Reduced bottom margin as criteria list follows
        InputProps={{
          "aria-describedby": "password-criteria", // Accessibility link
        }}
      />
      {/* Password Criteria Display */}
      <Box id="password-criteria" sx={{ width: "100%" }}>
        <PasswordCriteria validation={passwordValidation} />
      </Box>

      {/* Confirm Password Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="confirmPassword"
        label={t("confirm_password")} // Applied translation
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        variant="outlined"
        value={confirmPass}
        onChange={onConfirmPassChange}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      />

      {/* Submit Button */}
      <StyledButton
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting} // Disable during submission
        startIcon={
          isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        {/* Applied translation */}
        {isSubmitting ? t("sending") : t("sign_up")}
      </StyledButton>
    </Box>
  );
};

export default SignupForm;
