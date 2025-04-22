// src/admin/components/listings/ListingsTable.js
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
  Checkbox,
  Avatar,
  Tooltip,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { format } from "date-fns";
import { formatPrice } from "../../../utils/formatPrice"; // Adjust path

// Keep headCells consistent
const headCells = [
  {
    id: "select",
    numeric: false,
    disablePadding: true,
    label: "",
    sortable: false,
  },
  {
    id: "images",
    numeric: false,
    disablePadding: true,
    label: "Image",
    sortable: false,
  },
  { id: "title", numeric: false, disablePadding: false, label: "Title" },
  { id: "price", numeric: true, disablePadding: false, label: "Price" },
  {
    id: "location",
    numeric: false,
    disablePadding: false,
    label: "Location",
    sortable: false,
  },
  { id: "propertyType", numeric: false, disablePadding: false, label: "Type" },
  {
    id: "listingType",
    numeric: false,
    disablePadding: false,
    label: "Listing Type",
  },
  {
    id: "createdBy",
    numeric: false,
    disablePadding: false,
    label: "Created By",
  },
  {
    id: "createdAt",
    numeric: false,
    disablePadding: false,
    label: "Created At",
  },
  {
    id: "actions",
    numeric: false,
    disablePadding: false,
    label: "Actions",
    sortable: false,
  },
];

// Keep helpers consistent
const formatDate = (ds) => {
  try {
    return format(new Date(ds), "PP");
  } catch {
    return "-";
  }
};
const getListingStatusChipColor = (status) => {
  switch (status) {
    case "buy":
      return "success";
    case "rent":
      return "info";
    default:
      return "default";
  }
};

const ListingsTable = ({
  listings,
  loading,
  order,
  orderBy,
  selected,
  actionLoading,
  isSelected,
  onSelectAllClick,
  onRowClick,
  onRequestSort,
  onVisibilityToggle,
  onFeatureToggle,
  bulkDeleteLoading,
}) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const numSelected = selected.length;
  const rowCount = listings.length;

  return (
    // Match original Paper styling
    <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
      {/* Match original TableContainer styling */}
      <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
        {/* Match original Table styling */}
        <Table stickyHeader sx={{ minWidth: 1000 }}>
          <TableHead>
            {/* Match original TableHead -> TableRow styling */}
            <TableRow
              sx={{
                "& th": {
                  backgroundColor: "primary.dark",
                  color: "primary.contrastText",
                },
              }}
            >
              {/* Match original Select All Checkbox */}
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                  inputProps={{ "aria-label": "select all listings" }}
                  // Match original Checkbox styling
                  sx={{
                    color: "primary.contrastText",
                    "&.Mui-checked": { color: "primary.contrastText" },
                    "&.MuiCheckbox-indeterminate": {
                      color: "primary.contrastText",
                    },
                  }}
                />
              </TableCell>
              {/* Match original Header Cells */}
              {headCells.map(
                (h) =>
                  h.id !== "select" && (
                    <TableCell
                      key={h.id}
                      align={h.numeric ? "right" : "left"}
                      padding={h.disablePadding ? "none" : "normal"} // Use original padding
                      sortDirection={orderBy === h.id ? order : false}
                    >
                      {h.sortable !== false ? (
                        // Match original Sort Label styling
                        <TableSortLabel
                          active={orderBy === h.id}
                          direction={orderBy === h.id ? order : "asc"}
                          onClick={createSortHandler(h.id)}
                          sx={{
                            "&.Mui-active": { color: "primary.contrastText" },
                            "& .MuiTableSortLabel-icon": {
                              color: "primary.contrastText!important",
                            },
                          }}
                        >
                          {h.label}
                        </TableSortLabel>
                      ) : (
                        h.label
                      )}
                    </TableCell>
                  )
              )}
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
            ) : listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
                  No listings found.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((l) => {
                const isItemSelected = isSelected(l._id);
                const labelId = `enhanced-table-checkbox-${l._id}`;
                const hidKey = `visibility-${l._id}`;
                const featKey = `feature-${l._id}`;
                const isActionLoading =
                  actionLoading[hidKey] || actionLoading[featKey];
                const isFeatured = l.featuredAt != null;

                // Match original TableRow props and styling
                return (
                  <TableRow
                    key={l._id}
                    hover
                    onClick={(event) => onRowClick(event, l._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{ opacity: l.isHidden ? 0.6 : 1, cursor: "pointer" }} // Keep original sx
                  >
                    {/* Match original Checkbox Cell */}
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    {/* Match original Image Cell */}
                    <TableCell padding="checkbox">
                      {" "}
                      {/* Keep original padding */}
                      <Avatar
                        variant="rounded"
                        src={l.images?.[0]}
                        sx={{ width: 56, height: 56, mr: 1 }}
                      >
                        {l.title?.[0]}
                      </Avatar>
                    </TableCell>
                    {/* Match other Cells */}
                    <TableCell>
                      <Tooltip title={l.title}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {l.title}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">{formatPrice(l.price)}</TableCell>
                    <TableCell>
                      <Tooltip
                        title={`${l.addressLine1}, ${l.upazila}, ${l.district}`}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {l.cityTown || ""}, {l.district || ""}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {l.propertyType}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={l.listingType}
                        color={getListingStatusChipColor(l.listingType)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>{l.createdBy}</TableCell>
                    <TableCell>{formatDate(l.createdAt)}</TableCell>
                    {/* Match original Actions Cell */}
                    <TableCell align="center">
                      <Tooltip
                        title={l.isHidden ? "Make Visible" : "Hide Listing"}
                      >
                        <span>
                          {/* Match original IconButton props */}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onVisibilityToggle(l._id, l.isHidden);
                            }}
                            disabled={isActionLoading || bulkDeleteLoading}
                            color={l.isHidden ? "warning" : "default"}
                          >
                            {l.isHidden ? (
                              <VisibilityOffIcon fontSize="small" />
                            ) : (
                              <VisibilityIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          isFeatured ? "Unfeature Listing" : "Feature Listing"
                        }
                      >
                        <span>
                          {/* Match original IconButton props */}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFeatureToggle(l._id, l.featuredAt);
                            }}
                            disabled={isActionLoading || bulkDeleteLoading}
                            color={isFeatured ? "warning" : "default"}
                          >
                            {isFeatured ? (
                              <StarIcon fontSize="small" />
                            ) : (
                              <StarBorderIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      {/* Match original loading indicator */}
                      {isActionLoading && (
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

export default ListingsTable;
