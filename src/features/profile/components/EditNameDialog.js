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

const EditNameDialog = ({
  open,
  onClose,
  currentName,
  onNameChange,
  onSave,
  isLoading,
  error,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Edit Profile Name</DialogTitle>
    <DialogContent>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        autoFocus
        margin="dense"
        label="Name"
        type="text"
        fullWidth
        variant="outlined"
        value={currentName}
        onChange={(e) => onNameChange(e.target.value)}
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

export default EditNameDialog;
