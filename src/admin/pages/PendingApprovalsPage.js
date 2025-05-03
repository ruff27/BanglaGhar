// src/admin/pages/PendingApprovalsPage.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Link,
  Snackbar, // Added Link, Snackbar
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility"; // For viewing ID potentially
import { useAuth } from "../../context/AuthContext"; // Adjust path as needed

// Define the API base URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const PendingApprovalsPage = () => {
  const { idToken } = useAuth(); // Get token for authenticated requests
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({}); // Loading state per user action
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [viewIdLoading, setViewIdLoading] = useState({});

  // Function to fetch pending users
  const fetchPendingUsers = useCallback(async () => {
    if (!idToken) {
      setError("Authentication token not found.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/pending-approvals`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      setPendingUsers(response.data);
    } catch (err) {
      console.error(
        "Error fetching pending users:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message || "Failed to fetch pending approvals."
      );
    } finally {
      setIsLoading(false);
    }
  }, [idToken]);

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  // Handler for closing the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Function to handle Approve/Reject actions
  const handleUserAction = async (userId, action) => {
    if (!idToken) {
      setSnackbar({
        open: true,
        message: "Authentication error.",
        severity: "error",
      });
      return;
    }
    setActionLoading((prev) => ({ ...prev, [userId]: true })); // Set loading for specific user
    setError(""); // Clear previous page errors

    const endpoint = `${API_BASE_URL}/admin/users/${userId}/${action}`; // action is 'approve' or 'reject'

    try {
      const response = await axios.put(
        endpoint,
        {},
        {
          // PUT request, empty body ok
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      setSnackbar({
        open: true,
        message: response.data.message || `User ${action}d successfully.`,
        severity: "success",
      });
      // Refresh the list after successful action
      fetchPendingUsers();
    } catch (err) {
      console.error(
        `Error ${action}ing user ${userId}:`,
        err.response?.data || err.message
      );
      const errorMsg =
        err.response?.data?.message || `Failed to ${action} user.`;
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
      // setError(errorMsg); // Optionally set page-level error too
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false })); // Clear loading for specific user
    }
  };

  const handleViewIdClick = async (userId) => {
    if (!idToken) {
      setSnackbar({
        open: true,
        message: "Authentication token not found.",
        severity: "error",
      });
      return;
    }
    setViewIdLoading((prev) => ({ ...prev, [userId]: true })); // Set loading for this button

    try {
      const response = await axios.get(
        // 👇👇👇 THIS IS THE CORRECTED LINE 👇👇👇
        `${API_BASE_URL}/admin/get-signed-id-url/${userId}`,
        // 👆👆👆 THIS IS THE CORRECTED LINE 👆👆👆
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      // Open the received S3 URL in a new tab
      if (response.data && response.data.signedUrl) {
        window.open(response.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setSnackbar({
          open: true,
          message: "Could not retrieve file URL.",
          severity: "error",
        });
      }
    } catch (err) {
      // Updated error logging from previous step:
      console.error(
        `Error fetching signed URL for user ${userId}. Requested URL: ${API_BASE_URL}/admin/get-signed-id-url/${userId}`,
        err.response?.data || err.message
      );
      const errorMsg =
        err.response?.data?.message || "Failed to get viewable link for ID.";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    } finally {
      setViewIdLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 128px)" /* Adjust based on layout */,
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchPendingUsers} sx={{ mt: 1 }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 3 }}>
        Pending Listing Approvals
      </Typography>
      {pendingUsers.length === 0 ? (
        <Typography>No users are currently pending approval.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 650 }} aria-label="pending users table">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Govt ID Path</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow
                  key={user._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {user.name || "-"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {/* Format date nicely */}
                    {new Date(user.createdAt).toLocaleDateString("en-AU", {
                      // Example locale
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell sx={{ wordBreak: "break-all" }}>
                    {user.govtIdUrl ? (
                      <Button
                        variant="outlined" // Or "text"
                        size="small"
                        onClick={() => handleViewIdClick(user._id)} // Call the handler
                        disabled={viewIdLoading[user._id]} // Disable while loading this specific ID's URL
                        startIcon={
                          viewIdLoading[user._id] ? (
                            <CircularProgress size={14} />
                          ) : null
                        }
                      >
                        View ID
                      </Button>
                    ) : (
                      "Not Provided"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={
                          actionLoading[user._id] ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CheckCircleIcon />
                          )
                        }
                        onClick={() => handleUserAction(user._id, "approve")}
                        disabled={actionLoading[user._id]}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={
                          actionLoading[user._id] ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CancelIcon />
                          )
                        }
                        onClick={() => handleUserAction(user._id, "reject")}
                        disabled={actionLoading[user._id]}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PendingApprovalsPage;
