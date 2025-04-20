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
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Change Password</DialogTitle>
    <DialogContent>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        autoFocus
        margin="dense"
        label="Current Password"
        type="password"
        fullWidth
        variant="outlined"
        value={oldPassword}
        onChange={(e) => onOldPasswordChange(e.target.value)}
      />
      <TextField
        margin="dense"
        label="New Password"
        type="password"
        fullWidth
        variant="outlined"
        value={newPassword}
        onChange={(e) => onNewPasswordChange(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSave} variant="contained" disabled={isLoading}>
        {isLoading ? <CircularProgress size={20} /> : "Save"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ChangePasswordDialog;
