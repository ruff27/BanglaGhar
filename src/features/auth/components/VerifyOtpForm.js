import React from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next"; // Import useTranslation

// --- Styled Components (Copied from original VerifyOtp.js - specific to form button) ---
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

/**
 * VerifyOtpForm Component
 * Renders the OTP input field and submit button.
 * @param {object} props - Component props
 * @param {string} props.otp - Current value of the OTP field
 * @param {function} props.onOtpChange - Handler for OTP input changes
 * @param {function} props.onSubmit - Handler for form submission
 * @param {boolean} props.isSubmitting - Indicates if the form is currently submitting
 */
const VerifyOtpForm = ({ otp, onOtpChange, onSubmit, isSubmitting }) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="otp" // Add id
        label={t("enter_otp")} // Applied translation
        name="otp" // Add name
        variant="outlined"
        value={otp}
        onChange={onOtpChange}
        disabled={isSubmitting}
        inputProps={{
          maxLength: 6, // Enforce max length visually
          inputMode: "numeric", // Hint for numeric keyboard on mobile
          pattern: "[0-9]*", // Pattern for numeric input
          autoComplete: "one-time-code", // Hint for OTP autofill
        }}
        sx={{ mb: 2 }}
      />

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
        {isSubmitting ? t("sending") : t("verify_otp")}
      </StyledButton>
    </Box>
  );
};

export default VerifyOtpForm;
