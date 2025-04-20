import React from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  CircularProgress,
} from "@mui/material";

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

/**
 * ForgotPasswordStep1Form Component
 * Renders the email input field and button for the first step of password reset.
 * @param {object} props - Component props
 * @param {string} props.email - Current value of the email field
 * @param {function} props.onEmailChange - Handler for email input changes
 * @param {function} props.onSubmit - Handler for form submission (sends code)
 * @param {boolean} props.isSubmitting - Indicates if the form is currently submitting
 */
const ForgotPasswordStep1Form = ({
  email,
  onEmailChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email-forgot" // Unique id
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        variant="outlined"
        value={email}
        onChange={onEmailChange}
        disabled={isSubmitting}
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
        {isSubmitting ? "Sending Code..." : "Send Verification Code"}
      </StyledButton>
    </Box>
  );
};

export default ForgotPasswordStep1Form;
