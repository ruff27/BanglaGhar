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
  Paper,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import { format } from "date-fns";

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
    <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
      <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
        <Table
          stickyHeader
          sx={{ minWidth: 900 }}
          aria-label="manage users table"
        >
          <TableHead>
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
                  {"No users found."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isCurrentUser = loggedInUser?.email === user.email;
                const isLoadingAction = actionLoading[user._id];
                const isBlocked = user.accountStatus === "blocked";

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
                              onUserUpdate(
                                user._id,
                                "isAdmin",
                                e.target.checked
                              )
                            }
                            disabled={isCurrentUser || isLoadingAction}
                            color="success"
                            size="small"
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {getAccountStatusChip(user.accountStatus)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.approvalStatus?.replace("_", " ") || "N/A"}
                        color={getStatusChipColor(user.approvalStatus)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl
                        size="small"
                        sx={{ minWidth: 130 }}
                        disabled={isLoadingAction}
                      >
                        <Select
                          value={user.approvalStatus || "not_started"}
                          onChange={(e) =>
                            onUserUpdate(
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
                      <Tooltip
                        title={
                          isBlocked ? "Unblock User" : "Block User Account"
                        }
                      >
                        <span>
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
                            color="error"
                            size="small"
                            inputProps={{ "aria-label": "Block/Unblock User" }}
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
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default UsersTable;
