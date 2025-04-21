import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next"; // Import useTranslation

const ChangePasswordDialog = ({
  open,
  onClose,
  oldPassword,
  newPassword,
  onOldPasswordChange,
  onNewPasswordChange,
  onSave,
  isLoading,
  error,
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("change_password")}</DialogTitle>{" "}
      {/* Applied translation */}
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label={t("old_password")} // Applied translation
          type="password"
          fullWidth
          variant="outlined"
          value={oldPassword}
          onChange={(e) => onOldPasswordChange(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t("new_password")} // Applied translation
          type="password"
          fullWidth
          variant="outlined"
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        {/* Applied translation */}
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button onClick={onSave} variant="contained" disabled={isLoading}>
          {/* Applied translation */}
          {isLoading ? <CircularProgress size={20} /> : t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ChangePasswordDialog;
