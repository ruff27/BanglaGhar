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
import { useTranslation } from "react-i18next"; // Import useTranslation

const DeleteAccountDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  error,
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("delete_account")}</DialogTitle>{" "}
      {/* Applied translation */}
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography>
          {t("delete_warning")} {/* Applied translation */}
        </Typography>
      </DialogContent>
      <DialogActions>
        {/* Applied translation */}
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
        >
          {/* Applied translation */}
          {isLoading ? <CircularProgress size={20} /> : t("delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
