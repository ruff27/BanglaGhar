import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

const DeleteAccountDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  error,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Delete Account</DialogTitle>
    <DialogContent>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography>
        Are you sure you want to delete your account? This action cannot be
        undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={20} /> : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteAccountDialog;
