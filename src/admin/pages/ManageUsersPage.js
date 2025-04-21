// src/admin/pages/ManageUsersPage.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  CircularProgress,
  Alert,
  Box,
  Chip,
  TextField,
  InputAdornment,
  debounce,
  Switch, // Added
  Select, // Added
  MenuItem, // Added
  FormControl, // Added
  IconButton, // Added for potential alternative actions
  Tooltip, // Added for clarity
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
// Consider adding icons for actions if using IconButton
// import EditIcon from '@mui/icons-material/Edit';
// import BlockIcon from '@mui/icons-material/Block';
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext"; // To get logged-in user info and token

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Define table headers - Add 'actions'
const headCells = [
  { id: "name", numeric: false, disablePadding: false, label: "Name" },
  { id: "email", numeric: false, disablePadding: false, label: "Email" },
  {
    id: "createdAt",
    numeric: false,
    disablePadding: false,
    label: "Registered",
  },
  { id: "isAdmin", numeric: false, disablePadding: false, label: "Admin?" }, // Shortened label
  {
    id: "approvalStatus",
    numeric: false,
    disablePadding: false,
    label: "Approval Status",
  },
  {
    id: "actions",
    numeric: false,
    disablePadding: false,
    label: "Actions",
    sortable: false,
  }, // Indicate not sortable
];

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken, user: loggedInUser } = useAuth(); // Get logged-in user details too

  // --- State for Pagination, Sorting, Filtering ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  // State to track loading status for individual row actions
  const [actionLoading, setActionLoading] = useState({}); // e.g., { userId: true }

  // Debounced search handler (corrected dependencies based on previous feedback)
  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(0);
    }, 500),
    [setPage] // Dependency added
  );

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };

  // --- Fetch Users Effect (no change needed here) ---
  useEffect(() => {
    // ... (fetchUsers logic remains the same as previous step) ...
    const fetchUsers = async () => {
      if (!idToken) {
        setError("Authentication token not available.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Construct query params
      const params = new URLSearchParams({
        page: page + 1, // API expects 1-based page index
        limit: rowsPerPage,
        sort: orderBy,
        order: order,
        search: searchTerm,
        // status: filterStatus, // Add later if implementing status filter
      });

      try {
        const response = await axios.get(
          `${API_BASE_URL}/admin/users?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        setUsers(response.data.users);
        setTotalUsers(response.data.totalUsers);
        // Note: We don't need to set totalPages state, TablePagination calculates it
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch users. Please try again."
        );
        setUsers([]); // Clear users on error
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [idToken, page, rowsPerPage, orderBy, order, searchTerm]);

  // --- Event Handlers (Sorting, Pagination - no change needed) ---
  const handleRequestSort = (event, property) => {
    // ... (sorting logic remains the same) ...
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0); // Reset to first page on sort change
  };

  const handleChangePage = (event, newPage) => {
    // ... (paging logic remains the same) ...
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    // ... (rows per page logic remains the same) ...
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // --- NEW: Handler for User Status Updates ---
  const handleUserUpdate = async (userId, field, value) => {
    if (!idToken) {
      setError("Authentication token not available for update.");
      return;
    }
    // Prevent logged-in admin from changing their own admin status via UI
    if (
      loggedInUser?.email === users.find((u) => u._id === userId)?.email &&
      field === "isAdmin"
    ) {
      setError("You cannot change your own admin status from this interface.");
      // Revert switch visually if needed (though disabled state is better)
      // For now, just show error and don't proceed
      return;
    }

    setActionLoading((prev) => ({ ...prev, [userId]: true })); // Set loading for this specific user action
    setError(null); // Clear previous errors

    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        { [field]: value }, // Send only the updated field
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      // Update local state for immediate feedback
      setUsers((currentUsers) =>
        currentUsers.map(
          (user) =>
            user._id === userId
              ? { ...user, [field]: response.data.user[field] }
              : user
          // Ensure we update with the actual value returned by the server
        )
      );
      // Optionally show a success snackbar/message here
    } catch (err) {
      console.error(`Error updating user ${userId}:`, err);
      setError(
        err.response?.data?.message ||
          `Failed to update user ${field}. Please try again.`
      );
      // Note: No need to manually revert UI state here if using controlled components,
      // as the local 'users' state wasn't permanently changed on error.
      // If using uncontrolled components or need explicit revert, add logic here.
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false })); // Clear loading for this user action
    }
  };

  // --- Helper Functions (formatDate, getStatusChipColor - no change) ---
  const formatDate = (dateString) => {
    // ... (same as before)
    try {
      return format(new Date(dateString), "PPpp"); // e.g., Aug 18, 2023, 4:30 PM
    } catch {
      return "Invalid Date";
    }
  };
  const getStatusChipColor = (status) => {
    // ... (same as before)
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      case "not_started":
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl">
      {" "}
      {/* Consider wider container for more columns */}
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Users
      </Typography>
      {/* Search/Filter Paper (no change) */}
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        {/* ... (search input code remains the same) ... */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Search by Name/Email"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          {/* Add Filter Dropdown/Buttons here later */}
        </Box>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {" "}
          {/* Allow dismissing error */}
          {error}
        </Alert>
      )}
      <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 320px)" }}>
          {" "}
          {/* Adjust maxHeight */}
          <Table
            stickyHeader
            sx={{ minWidth: 900 }}
            aria-label="manage users table"
          >
            {" "}
            {/* Increased minWidth */}
            <TableHead>
              {/* Table Head Row (adjust map for non-sortable 'actions') */}
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: "primary.dark",
                    color: "primary.contrastText",
                  },
                }}
              >
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? "right" : "left"}
                    padding={headCell.disablePadding ? "none" : "normal"}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {/* Check if column is sortable */}
                    {headCell.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={(event) =>
                          handleRequestSort(event, headCell.id)
                        }
                        sx={{
                          "&.Mui-active": { color: "primary.contrastText" },
                          "& .MuiTableSortLabel-icon": {
                            color: "primary.contrastText !important",
                          },
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label // Display label without sort functionality
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={headCells.length}
                    align="center"
                    sx={{ py: 5 }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    {/* ... (no results message remains same) ... */}
                    {searchTerm
                      ? `No users found matching "${searchTerm}".`
                      : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                // --- Table Body Rows with Actions ---
                users.map((user) => {
                  const isCurrentUser = loggedInUser?.email === user.email; // Check if row is the logged-in user
                  const isLoadingAction = actionLoading[user._id]; // Check if an action is loading for this row

                  return (
                    <TableRow
                      hover
                      key={user._id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {user.name || "N/A"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      {/* Admin Status Cell */}
                      <TableCell padding="none" align="center">
                        <Tooltip
                          title={
                            isCurrentUser
                              ? "Cannot change own admin status here"
                              : user.isAdmin
                              ? "Demote to User"
                              : "Promote to Admin"
                          }
                        >
                          {/* Wrap Switch in span to allow Tooltip when disabled */}
                          <span>
                            <Switch
                              checked={user.isAdmin}
                              onChange={(e) =>
                                handleUserUpdate(
                                  user._id,
                                  "isAdmin",
                                  e.target.checked
                                )
                              }
                              disabled={isCurrentUser || isLoadingAction} // Disable for self or while loading
                              color="secondary" // Or another appropriate color
                              size="small"
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      {/* Approval Status Cell (Using Chip as display only for now) */}
                      <TableCell>
                        <Chip
                          label={
                            user.approvalStatus?.replace("_", " ") || "N/A"
                          }
                          color={getStatusChipColor(user.approvalStatus)}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      {/* Actions Cell */}
                      <TableCell>
                        <FormControl
                          size="small"
                          sx={{ minWidth: 130 }}
                          disabled={isLoadingAction}
                        >
                          {/* <InputLabel>Status</InputLabel> */}{" "}
                          {/* Optional: Label if needed */}
                          <Select
                            value={user.approvalStatus || "not_started"}
                            onChange={(e) =>
                              handleUserUpdate(
                                user._id,
                                "approvalStatus",
                                e.target.value
                              )
                            }
                            displayEmpty
                            inputProps={{
                              "aria-label": "Change approval status",
                            }}
                            variant="outlined" // Use outlined or standard
                            size="small"
                            sx={{ fontSize: "0.875rem" }} // Match chip size roughly
                          >
                            <MenuItem value="not_started">Not Started</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                        {/* Add other actions like Block/Delete later using IconButtons */}
                        {/*
                         <Tooltip title="Block User (Not Implemented)">
                            <span> <IconButton size="small" disabled={isLoadingAction}> <BlockIcon fontSize="small" /> </IconButton> </span>
                         </Tooltip>
                          */}
                        {/* Show mini-loader if action is processing for this row */}
                        {isLoadingAction && (
                          <CircularProgress
                            size={20}
                            sx={{ ml: 1, verticalAlign: "middle" }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }) // End map users
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination (no change) */}
        <TablePagination
          // ... (pagination props remain the same) ...
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default ManageUsersPage;
