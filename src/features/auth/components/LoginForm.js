import React from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

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
    backgroundColor: "#236C7D", // Darker shade on hover
    boxShadow: "0 6px 14px rgba(43, 123, 140, 0.3)",
    transform: "translateY(-2px)", // Slight lift effect
  },
  "&:disabled": {
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
  const { t } = useTranslation();

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label={t("email")} 
        name="email" 
        autoComplete="email" 
        autoFocus
        variant="outlined"
        value={email}
        onChange={onEmailChange}
        disabled={isSubmitting} 
        sx={{ mb: 2 }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="password" 
        label={t("password")}
        name="password" 
        type="password"
        autoComplete="current-password" 
        variant="outlined"
        value={password}
        onChange={onPasswordChange}
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
        {isSubmitting ? t("sending") : t("sign_in")}
      </StyledButton>
    </Box>
  );
};

export default LoginForm;
