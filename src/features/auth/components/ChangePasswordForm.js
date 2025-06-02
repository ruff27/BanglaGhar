import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  styled,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
 * ChangePasswordForm Component
 * Renders the form for changing a user's password.
 * @param {object} props - Component props
 * @param {string} props.name - Current value of the name field
 * @param {string} props.newPassword - Current value of the new password field
 * @param {string} props.confirmPassword - Current value of the confirm password field
 * @param {function} props.onNameChange - Handler for name input changes
 * @param {function} props.onNewPasswordChange - Handler for new password input changes
 * @param {function} props.onConfirmPasswordChange - Handler for confirm password input changes
 * @param {function} props.onSubmit - Handler for form submission
 * @param {boolean} props.isSubmitting - Indicates if the form is currently submitting
 * @param {string} props.error - Error message to display in fields
 * @param {boolean} props.openSnackbar - Indicates if success snackbar is open
 * @param {function} props.handleCloseSnackbar - Handler for closing the snackbar
 */
const ChangePasswordForm = ({
  name = "",
  temporaryPassword = "",
  newPassword = "",
  confirmPassword = "",
  onNameChange = () => {},
  onTemporaryPasswordChange = () => {},
  onNewPasswordChange = () => {},
  onConfirmPasswordChange = () => {},
  onSubmit = () => {},
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);

  const handleToggleNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };
  const handleToggleTemporaryPassword = () => {
    setShowTemporaryPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label={t("name")}
        name="name"
        autoComplete="name"
        autoFocus
        variant="outlined"
        value={name}
        onChange={onNameChange}
        disabled={isSubmitting}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="temporaryPassword"
        label={t("temporary_password", "Temporary Password")}
        name="temporaryPassword"
        type={showTemporaryPassword ? "text" : "password"}
        autoComplete="off" 
        variant="outlined"
        value={temporaryPassword}
        onChange={onTemporaryPasswordChange}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={t(
                  "toggle_temporary_password_visibility",
                  "Toggle temporary password visibility"
                )}
                onClick={handleToggleTemporaryPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                disabled={isSubmitting}
              >
                {showTemporaryPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="newPassword"
        label={t("new_password")}
        name="newPassword"
        type={showNewPassword ? "text" : "password"}
        autoComplete="new-password"
        variant="outlined"
        value={newPassword}
        onChange={onNewPasswordChange}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={t("toggle_password_visibility")}
                onClick={handleToggleNewPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                disabled={isSubmitting}
              >
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="confirmPassword"
        label={t("confirm_password")}
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        autoComplete="new-password"
        variant="outlined"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        disabled={isSubmitting}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={t("toggle_password_visibility")}
                onClick={handleToggleConfirmPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <StyledButton
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting || !name || !newPassword || !confirmPassword}
        startIcon={
          isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        {isSubmitting ? t("submitting") : t("change_password")}
      </StyledButton>
    </Box>
  );
};

export default ChangePasswordForm;
