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
  Switch,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Tooltip,
  InputLabel,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Define table headers (no change needed here)
const headCells = [
  // ... (same as before)
  { id: "name", numeric: false, disablePadding: false, label: "Name" },
  { id: "email", numeric: false, disablePadding: false, label: "Email" },
  {
    id: "createdAt",
    numeric: false,
    disablePadding: false,
    label: "Registered",
  },
  { id: "isAdmin", numeric: false, disablePadding: false, label: "Admin?" },
  {
    id: "accountStatus",
    numeric: false,
    disablePadding: false,
    label: "Account Status",
  },
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
  },
];

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken, user: loggedInUser } = useAuth();

  // --- State for Pagination, Sorting, Filtering ---
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalUsers, setTotalUsers] = useState(0);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // <<<--- NEW STATE for status filter
  const [actionLoading, setActionLoading] = useState({});

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(0);
    }, 500),
    [setPage]
  );

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };

  // --- NEW: Handler for Status Filter Change ---
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  // --- Fetch Users Effect (Updated Dependencies and Params) ---
  useEffect(() => {
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
        page: page + 1,
        limit: rowsPerPage,
        sort: orderBy,
        order: order,
        search: searchTerm,
      });

      // <<<--- ADD status param if filterStatus is set ---<<<
      if (filterStatus) {
        params.append("status", filterStatus);
      }

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
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch users. Please try again."
        );
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [idToken, page, rowsPerPage, orderBy, order, searchTerm, filterStatus]); // <<<--- ADD filterStatus dependency

  // --- Event Handlers (Sorting, Pagination - no change) ---
  const handleRequestSort = (event, property) => {
    // ... (sorting logic remains the same) ...
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    // ... (paging logic remains the same) ...
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    // ... (rows per page logic remains the same) ...
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Handler for User Status Updates (no change needed here) ---
  const handleUserUpdate = async (userId, field, value) => {
    // ... (update logic remains the same) ...
    if (!idToken) {
      setError("Authentication token not available for update.");
      return;
    }
    if (
      loggedInUser?.email === users.find((u) => u._id === userId)?.email &&
      field === "isAdmin"
    ) {
      setError("You cannot change your own admin status from this interface.");
      return;
    }
    if (field === "accountStatus" && value === "blocked") {
      setError("You cannot block your own account.");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        { [field]: value },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? { ...user, [field]: response.data.user[field] }
            : user
        )
      );
    } catch (err) {
      console.error(`Error updating user ${userId}:`, err);
      setError(
        err.response?.data?.message ||
          `Failed to update user ${field}. Please try again.`
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // --- Helper Functions (formatDate, getStatusChipColor - no change) ---
  const formatDate = (dateString) => {
    /* ... */
    try {
      return format(new Date(dateString), "PPpp"); // e.g., Aug 18, 2023, 4:30 PM
    } catch {
      return "Invalid Date";
    }
  };
  const getStatusChipColor = (status) => {
    /* ... */
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

  // Helper function for account status chip color
  const getAccountStatusChip = (status) => {
    switch (status) {
      case "active":
        return <Chip label="Active" color="success" size="small" />;
      case "blocked":
        return (
          <Chip
            label="Blocked"
            color="error"
            size="small"
            icon={<BlockIcon fontSize="small" />}
          />
        );
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Users
      </Typography>

      {/* Search/Filter Paper (Updated) */}
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {" "}
          {/* Added flexWrap */}
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
            sx={{ flexGrow: 1, minWidth: "250px" }} // Allow grow but set minWidth
          />
          {/* <<<--- STATUS FILTER DROPDOWN ---<<< */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            {" "}
            {/* Give it minWidth */}
            <InputLabel id="status-filter-label">Approval Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter-select"
              value={filterStatus}
              label="Approval Status"
              onChange={handleFilterStatusChange}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              <MenuItem value="not_started">Not Started</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
          {" "}
          {/* Adjusted maxHeight slightly */}
          <Table
            stickyHeader
            sx={{ minWidth: 900 }}
            aria-label="manage users table"
          >
            <TableHead>
              {/* ... (Table Head definition remains the same) ... */}
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
                        // active={orderBy === headCell.id}
                        // direction={orderBy === headCell.id ? order : "asc"}
                        // onClick={(event) =>
                        //   handleRequestSort(event, headCell.id)
                        // }
                        // sx={{
                        //   "&.Mui-active": { color: "primary.contrastText" },
                        //   "& .MuiTableSortLabel-icon": {
                        //     color: "primary.contrastText !important",
                        //   },
                        // }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* ... (Table Body logic remains the same, including loading/no results/map users) ... */}
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
                    {searchTerm || filterStatus
                      ? `No users found matching the current criteria.`
                      : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                // --- Table Body Rows with Actions ---
                users.map((user) => {
                  const isCurrentUser = loggedInUser?.email === user.email;
                  const isLoadingAction = actionLoading[user._id];
                  const isBlocked = user.accountStatus === "blocked";

                  return (
                    <TableRow
                      hover
                      key={user._id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        ...(isBlocked && {
                          backgroundColor: (theme) =>
                            theme.palette.error.lighter + "60",
                        }),
                      }}
                    >
                      {/* Cells for name, email, createdAt */}
                      <TableCell component="th" scope="row">
                        <Badge
                          badgeContent={
                            isBlocked ? (
                              <BlockIcon fontSize="small" color="error" />
                            ) : null
                          }
                        >
                          {user.name || "N/A"}
                        </Badge>
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
                              disabled={isCurrentUser || isLoadingAction}
                              color="secondary"
                              size="small"
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      {/* Account Status Cell (Display Chip) */}
                      <TableCell>
                        {getAccountStatusChip(user.accountStatus)}
                      </TableCell>
                      {/* Approval Status Cell (Display) */}
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
                      {/* Actions Cell (Status Change) */}
                      <TableCell>
                        <FormControl
                          size="small"
                          sx={{ minWidth: 130 }}
                          disabled={isLoadingAction}
                        >
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
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: "0.875rem" }}
                          >
                            <MenuItem value="not_started">Not Started</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>

                        {/* Block/Unblock Switch */}
                        <Tooltip
                          title={
                            isBlocked ? "Unblock User" : "Block User Account"
                          }
                        >
                          <span>
                            <Switch
                              checked={isBlocked}
                              onChange={(e) =>
                                handleUserUpdate(
                                  user._id,
                                  "accountStatus",
                                  e.target.checked ? "blocked" : "active"
                                )
                              }
                              disabled={isCurrentUser || isLoadingAction}
                              color="error" // Use error color for blocking action
                              size="small"
                              inputProps={{
                                "aria-label": "Block/Unblock User",
                              }}
                            />
                          </span>
                        </Tooltip>
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
