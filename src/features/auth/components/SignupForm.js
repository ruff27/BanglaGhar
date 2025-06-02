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
    { label: "At least 8 characters", valid: validation.hasMinLength }, 
    { label: "Contains a number", valid: validation.hasNumber }, 
    {
      label: "Contains a special character (!@#$...etc)", 
      valid: validation.hasSpecial,
    },
    { label: "Contains an uppercase letter", valid: validation.hasUppercase },
    { label: "Contains a lowercase letter", valid: validation.hasLowercase }, 
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
 * SignupForm Component
 * Renders the fields and button for the signup form.
 * @param {object} props - Component props including form data, handlers, validation state, and submission status.
 */
const SignupForm = ({
  email,
  username,
  password,
  confirmPass,
  passwordValidation,
  isPasswordValid, 
  onEmailChange,
  onUsernameChange,
  onPasswordChange,
  onConfirmPassChange,
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
        id="fullName" 
        label={t("full_name", "Full Name")} 
        name="fullName" 
        autoComplete="name" 
        variant="outlined"
        value={username} 
        onChange={onUsernameChange} 
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
        autoComplete="new-password" 
        variant="outlined"
        value={password}
        onChange={onPasswordChange}
        disabled={isSubmitting}
        sx={{ mb: 0 }} 
        InputProps={{
          "aria-describedby": "password-criteria", 
        }}
      />
      <Box id="password-criteria" sx={{ width: "100%" }}>
        <PasswordCriteria validation={passwordValidation} />
      </Box>

      <TextField
        margin="normal"
        required
        fullWidth
        id="confirmPassword"
        label={t("confirm_password")} 
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        variant="outlined"
        value={confirmPass}
        onChange={onConfirmPassChange}
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
        {isSubmitting ? t("sending") : t("sign_up")}
      </StyledButton>
    </Box>
  );
};

export default SignupForm;
