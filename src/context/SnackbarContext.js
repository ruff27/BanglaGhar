// src/context/SnackbarContext.js
import React, { createContext, useState, useContext, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PropTypes from "prop-types";

// Create the context
const SnackbarContext = createContext(null);

// Create a custom hook to use the Snackbar context
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

// Create the provider component
export const SnackbarProvider = ({ children }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info"); // 'success' | 'error' | 'warning' | 'info'
  const [snackbarDuration, setSnackbarDuration] = useState(6000); // Default 6 seconds

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
    // Prevent closing on clickaway if needed, but generally okay for feedback messages
    // if (reason === 'clickaway') {
    //   return;
    // }
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Position at bottom-center
      >
        {/* Use Alert component inside Snackbar for severity styling */}
        {/* Add onClose to Alert only if you want an inline close button */}
        <Alert
          onClose={handleClose} // Optional: adds close icon to the alert itself
          severity={snackbarSeverity}
          variant="filled" // Use filled variant for better visibility
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
