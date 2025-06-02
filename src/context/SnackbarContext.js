import React, { createContext, useState, useContext, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PropTypes from "prop-types";

const SnackbarContext = createContext(null);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info"); // 'success' | 'error' | 'warning' | 'info'
  const [snackbarDuration, setSnackbarDuration] = useState(6000);

  const showSnackbar = useCallback(
    (message, severity = "info", duration = 6000) => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarDuration(duration);
      setSnackbarOpen(true);
    },
    []
  );

  const handleClose = (event, reason) => {
    setSnackbarOpen(false);
  };

  const contextValue = {
    showSnackbar,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={snackbarDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
