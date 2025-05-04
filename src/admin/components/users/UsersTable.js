// src/admin/components/users/UsersTable.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Chip,
  Switch,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Badge,
  Paper, // Removed IconButton, Box (not used directly in table structure)
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block"; // Keep necessary icons
import { format } from "date-fns";

// Keep headCells definition consistent with original
const headCells = [
  { id: "displayName", numeric: false, disablePadding: false, label: "Name" },
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

// Keep helper functions consistent
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "PPpp");
  } catch {
    return "Invalid Date";
  }
};
const getStatusChipColor = (status) => {
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

const UsersTable = ({
  users,
  loading,
  order,
  orderBy,
  actionLoading,
  loggedInUser,
  onRequestSort,
  onUserUpdate,
}) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    // Match original Paper styling
    <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
      {/* Match original TableContainer styling */}
      <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
        {/* Match original Table styling and aria-label */}
        <Table
          stickyHeader
          sx={{ minWidth: 900 }}
          aria-label="manage users table"
        >
          <TableHead>
            {/* Match original TableHead TableRow styling */}
            <TableRow
              sx={{
                "& th": {
                  backgroundColor: "primary.dark",
                  color: "primary.contrastText",
                },
              }}
            >
              {headCells.map((headCell) => (
                // Match original TableCell styling and props
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? "right" : "left"}
                  padding={headCell.disablePadding ? "none" : "normal"}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable !== false ? (
                    // Match original TableSortLabel styling and props
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={createSortHandler(headCell.id)}
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
                    headCell.label
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
                  {/* Keep conditional message from original if needed */}
                  {"No users found."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isCurrentUser = loggedInUser?.email === user.email;
                const isLoadingAction = actionLoading[user._id];
                const isBlocked = user.accountStatus === "blocked";

                // Match original TableRow styling and props
                return (
                  <TableRow
                    hover
                    key={user.displayName}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      ...(isBlocked && {
                        backgroundColor: (theme) =>
                          theme.palette.error.lighter + "60",
                      }),
                    }}
                  >
                    {/* Match original TableCell styling and props */}
                    <TableCell component="th" scope="row">
                      <Badge
                        badgeContent={
                          isBlocked ? (
                            <BlockIcon fontSize="small" color="error" />
                          ) : null
                        }
                      >
                        {user.displayName || user.name}
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
                          {/* Match original Switch styling and props */}
                          <Switch
                            checked={user.isAdmin}
                            onChange={(e) =>
                              onUserUpdate(
                                user._id,
                                "isAdmin",
                                e.target.checked
                              )
                            }
                            disabled={isCurrentUser || isLoadingAction}
                            color="success" // Keep original color
                            size="small" // Keep original size
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    {/* Account Status Cell */}
                    <TableCell>
                      {getAccountStatusChip(user.accountStatus)}
                    </TableCell>
                    {/* Approval Status Cell */}
                    <TableCell>
                      {/* Match original Chip styling and props */}
                      <Chip
                        label={user.approvalStatus?.replace("_", " ") || "N/A"}
                        color={getStatusChipColor(user.approvalStatus)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    {/* Actions Cell */}
                    <TableCell>
                      {/* Match original FormControl styling and props */}
                      <FormControl
                        size="small"
                        sx={{ minWidth: 130 }}
                        disabled={isLoadingAction}
                      >
                        {/* Match original Select styling and props */}
                        <Select
                          value={user.approvalStatus || "not_started"}
                          onChange={(e) =>
                            onUserUpdate(
                              user._id,
                              "approvalStatus",
                              e.target.value
                            )
                          }
                          displayEmpty // Keep original prop
                          inputProps={{
                            "aria-label": "Change approval status",
                          }} // Keep original prop
                          variant="outlined" // Keep original variant (usually default)
                          size="small"
                          sx={{ fontSize: "0.875rem" }} // Keep original sx
                        >
                          <MenuItem value="not_started">Not Started</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                      {/* Match original Block/Unblock Switch */}
                      <Tooltip
                        title={
                          isBlocked ? "Unblock User" : "Block User Account"
                        }
                      >
                        <span>
                          {/* Match original Switch styling and props */}
                          <Switch
                            checked={isBlocked}
                            onChange={(e) =>
                              onUserUpdate(
                                user._id,
                                "accountStatus",
                                e.target.checked ? "blocked" : "active"
                              )
                            }
                            disabled={isCurrentUser || isLoadingAction}
                            color="error" // Keep original color
                            size="small" // Keep original size
                            inputProps={{ "aria-label": "Block/Unblock User" }} // Keep original props
                          />
                        </span>
                      </Tooltip>
                      {/* Match original loading indicator */}
                      {isLoadingAction && (
                        <CircularProgress
                          size={20}
                          sx={{ ml: 1, verticalAlign: "middle" }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default UsersTable;
