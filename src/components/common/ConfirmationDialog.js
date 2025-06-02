import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import { color } from "framer-motion";


const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonProps = { color: "primary" },
  cancelButtonProps = { color: "inherit" },
  isConfirming = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose} // Allow closing by clicking outside or pressing Esc
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {typeof message === "string" ? (
          <DialogContentText
            id="confirmation-dialog-description"
            // Explicitly set color to text.primary for max contrast in light/dark modes
            sx={{ color: "text.primary" }}
          >
            {message}
          </DialogContentText>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          {...cancelButtonProps}
          disabled={isConfirming}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          {...confirmButtonProps}
          autoFocus
          disabled={isConfirming}
        >
          {isConfirming ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmButtonProps: PropTypes.object,
  cancelButtonProps: PropTypes.object,
  isConfirming: PropTypes.bool,
};

export default ConfirmationDialog;
