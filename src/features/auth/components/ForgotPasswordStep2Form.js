import React from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next"; // Import useTranslation

// --- Styled Components (Copied from original - specific to form button) ---
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
              color: item.valid ? "text.secondary" : "error",
            }}
          />
        </ListItem>
      ))}
    </List>
  );
};

/**
 * ForgotPasswordStep2Form Component
 * Renders the OTP, new password, and confirm password fields for password reset.
 * @param {object} props - Component props including form data, handlers, validation state, and submission status.
 */
const ForgotPasswordStep2Form = ({
  otp,
  newPassword,
  confirmPassword,
  passwordValidation,
  isPasswordValid, // Use this if needed for overall validation display
  onOtpChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
      {/* OTP Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="otp-reset" // Unique id
        label={t("verification_code")} // Applied translation
        name="otp"
        variant="outlined"
        value={otp}
        onChange={onOtpChange}
        disabled={isSubmitting}
        inputProps={{
          maxLength: 6,
          inputMode: "numeric",
          pattern: "[0-9]*",
          autoComplete: "one-time-code",
        }}
        sx={{ mb: 2 }}
      />
      {/* New Password Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="newPassword-reset" // Unique id
        label={t("new_password")} // Applied translation
        name="newPassword"
        type="password"
        autoComplete="new-password"
        variant="outlined"
        value={newPassword}
        onChange={onNewPasswordChange}
        disabled={isSubmitting}
        sx={{ mb: 0 }} // Reduce margin before criteria list
        InputProps={{ "aria-describedby": "password-criteria-reset" }}
      />
      {/* Password Criteria Display */}
      <Box id="password-criteria-reset" sx={{ width: "100%" }}>
        <PasswordCriteria validation={passwordValidation} />
      </Box>

      {/* Confirm Password Field */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="confirmPassword-reset" // Unique id
        label={t("confirm_password")} // Applied translation
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        variant="outlined"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      />

      {/* Submit Button */}
      <StyledButton
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        startIcon={
          isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        {/* Applied translation */}
        {isSubmitting ? t("sending") : t("reset_password")}
      </StyledButton>
    </Box>
  );
};

export default ForgotPasswordStep2Form;
