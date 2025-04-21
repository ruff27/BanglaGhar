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

const EditNameDialog = ({
  open,
  onClose,
  currentName,
  onNameChange,
  onSave,
  isLoading,
  error,
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("edit_name")}</DialogTitle> {/* Applied translation */}
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label={t("name")} // Applied translation
          type="text"
          fullWidth
          variant="outlined"
          value={currentName}
          onChange={(e) => onNameChange(e.target.value)}
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

export default EditNameDialog;
