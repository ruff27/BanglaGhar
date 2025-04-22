// src/admin/pages/ManageListingsPage.js
// Final updated ManageListingsPage with visibility & feature toggles, search, sort, pagination
// citeturn6file0

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
  Avatar,
  Tooltip,
  IconButton,
  Checkbox,
  Button,
  Toolbar,
  Dialog,
  Select,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const PROPERTY_TYPES = ["apartment", "house", "condo", "land", "commercial"];
const LISTING_TYPES = ["rent", "buy", "sold"];
const VISIBILITY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Visible", value: "false" },
  { label: "Hidden", value: "true" },
];
const FEATURED_OPTIONS = [
  { label: "All", value: "" },
  { label: "Featured", value: "true" },
  { label: "Not Featured", value: "false" },
];

const headCells = [
  {
    id: "select",
    numeric: false,
    disablePadding: true,
    label: "", // No label needed, will use Checkbox
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

const ManageListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken } = useAuth();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalListings, setTotalListings] = useState(0);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [searchTerm, setSearchTerm] = useState("");
  // const [filterStatus, setFilterStatus] = useState("");
  const [filterPropertyType, setFilterPropertyType] = useState("");
  const [filterListingType, setFilterListingType] = useState("");
  const [filterVisibility, setFilterVisibility] = useState(""); // Stores "true", "false", or ""
  const [filterFeatured, setFilterFeatured] = useState(""); // Stores "true", "false", or ""
  const [actionLoading, setActionLoading] = useState({});
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Debounced reset page handler (can be used by multiple filters)
  const debouncedResetPage = useCallback(
    debounce(() => {
      setPage(0);
    }, 500),
    [setPage] // setPage should be stable, but include for correctness
  );

  // Debounced search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedResetPage(); // Reset page when search term changes
  };

  // Handlers for new filters
  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    debouncedResetPage();
  };

  useEffect(() => {
    const fetchListings = async () => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        sort: orderBy,
        order,
        search: searchTerm,
      });

      if (filterPropertyType) params.append("propertyType", filterPropertyType);
      if (filterListingType) params.append("listingType", filterListingType);
      if (filterVisibility) params.append("isHidden", filterVisibility); // Send "true" or "false"
      if (filterFeatured) params.append("isFeatured", filterFeatured); // Send "true" or "false"

      try {
        const response = await axios.get(
          `${API_BASE_URL}/admin/listings?${params.toString()}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setListings(response.data.listings || []);
        setTotalListings(response.data.totalListings || 0);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(err.response?.data?.message || "Failed to fetch listings.");
        setListings([]);
        setTotalListings(0);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [
    idToken,
    page,
    rowsPerPage,
    orderBy,
    order,
    searchTerm,
    filterPropertyType,
    filterListingType,
    filterVisibility,
    filterFeatured, // Add new filter states
  ]);

  // --- Selection Handlers ---
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = listings.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleVisibilityToggle = async (id, isHidden) => {
    if (!idToken) {
      setError("Auth token missing.");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.put(
        `${API_BASE_URL}/admin/listings/${id}/visibility`,
        { isHidden: !isHidden },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setListings((lst) =>
        lst.map((l) => (l._id === id ? { ...l, isHidden: !isHidden } : l))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update visibility.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleFeatureToggle = async (id, featuredAt) => {
    if (!idToken) {
      setError("Auth token missing.");
      return;
    }
    setActionLoading((prev) => ({ ...prev, ["feature-" + id]: true }));
    try {
      const resp = await axios.put(
        `${API_BASE_URL}/admin/listings/${id}/feature`,
        { feature: featuredAt == null },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setListings((lst) =>
        lst.map((l) =>
          l._id === id ? { ...l, featuredAt: resp.data.listing.featuredAt } : l
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update feature status."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, ["feature-" + id]: false }));
    }
  };

  // --- Bulk Delete: Step 1 - Open Confirmation Dialog ---
  const handleDeleteSelected = async () => {
    if (selected.length === 0 || !idToken) return;
    // Just open the confirmation dialog
    setConfirmDialogOpen(true);
  };

  // --- Bulk Delete: Step 2 - Execute Deletion (Called by Dialog's Confirm) ---
  const executeBulkDelete = async () => {
    setBulkDeleteLoading(true); // Show loading state on confirm button
    setError(null);
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/listings`, {
        headers: { Authorization: `Bearer ${idToken}` },
        data: { listingIds: selected }, // Send IDs in the request body
      });

      console.log("Bulk delete response:", response.data);
      // Refresh listings after deletion
      setListings((prev) => prev.filter((l) => !selected.includes(l._id)));
      setSelected([]); // Clear selection
      setTotalListings((prev) => prev - response.data.deletedCount);
      // Optionally: Add a success Snackbar/Toast message here later (Req 5)
    } catch (err) {
      console.error("Error deleting selected listings:", err);
      setError(
        err.response?.data?.message || "Failed to delete selected listings."
      );
      // Optionally: Add an error Snackbar/Toast message here later (Req 5)
    } finally {
      setBulkDeleteLoading(false);
      setConfirmDialogOpen(false); // Close the dialog regardless of success/error
    }
  };

  const formatDate = (ds) => {
    try {
      return format(new Date(ds), "PP"); // PP formats like 'Oct 13, 2023'
    } catch {
      return "-"; // Return hyphen if date is invalid
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

  const numSelected = selected.length;
  const rowCount = listings.length;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Listings
      </Typography>
      {/* Search/Filter Bar (existing) */}
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Grid container spacing={2} alignItems="center">
          {" "}
          {/* Use Grid for better layout */}
          {/* Search Field */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search Title/Location/Creator"
              size="small"
              fullWidth // Make text field take full grid item width
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {/* Property Type Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="property-type-filter-label">
                Property Type
              </InputLabel>
              <Select
                labelId="property-type-filter-label"
                value={filterPropertyType}
                label="Property Type"
                onChange={handleFilterChange(setFilterPropertyType)}
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {PROPERTY_TYPES.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Listing Type Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="listing-type-filter-label">
                Listing Type
              </InputLabel>
              <Select
                labelId="listing-type-filter-label"
                value={filterListingType}
                label="Listing Type"
                onChange={handleFilterChange(setFilterListingType)}
              >
                <MenuItem value="">
                  <em>All Modes</em>
                </MenuItem>
                {LISTING_TYPES.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Visibility Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="visibility-filter-label">Visibility</InputLabel>
              <Select
                labelId="visibility-filter-label"
                value={filterVisibility}
                label="Visibility"
                onChange={handleFilterChange(setFilterVisibility)}
              >
                {VISIBILITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Featured Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="featured-filter-label">Featured</InputLabel>
              <Select
                labelId="featured-filter-label"
                value={filterFeatured}
                label="Featured"
                onChange={handleFilterChange(setFilterFeatured)}
              >
                {FEATURED_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>{" "}
        {/* End Grid container */}
      </Paper>
      {/* --- Enhanced Toolbar for Bulk Actions --- */}
      <Paper sx={{ width: "100%", mb: 2 }} elevation={1}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(numSelected > 0 && {
              bgcolor: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.secondary.lighter // Example color
                  : theme.palette.secondary.darker, // Example color
            }),
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {numSelected > 0 ? (
            <Typography
              sx={{ flex: "1 1 100%" }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {numSelected} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: "1 1 100%" }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              All Listings {/* Or keep your search bar here */}
            </Typography>
          )}

          {numSelected > 0 && (
            <Tooltip title="Delete Selected">
              <span>
                {" "}
                {/* Span needed for disabled button tooltip */}
                <IconButton
                  onClick={handleDeleteSelected}
                  disabled={bulkDeleteLoading}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Toolbar>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
          {" "}
          {/* Adjusted height */}
          <Table stickyHeader sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    backgroundColor: "primary.dark",
                    color: "primary.contrastText",
                  },
                }}
              >
                <TableCell padding="checkbox">
                  {" "}
                  {/* Header Checkbox */}
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "select all listings" }}
                    sx={{
                      color: "primary.contrastText",
                      "&.Mui-checked": { color: "primary.contrastText" },
                      "&.MuiCheckbox-indeterminate": {
                        color: "primary.contrastText",
                      },
                    }}
                  />
                </TableCell>
                {headCells.map(
                  (
                    h // Skip 'select' headCell since it's handled above
                  ) =>
                    h.id !== "select" && (
                      <TableCell
                        key={h.id}
                        align={h.numeric ? "right" : "left"}
                        padding={h.disablePadding ? "none" : "normal"}
                        sortDirection={orderBy === h.id ? order : false}
                      >
                        {h.sortable !== false ? (
                          <TableSortLabel
                            active={orderBy === h.id}
                            direction={orderBy === h.id ? order : "asc"}
                            onClick={(e) => handleRequestSort(e, h.id)}
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
                    colSpan={headCells.length + 1} // Adjusted colspan
                    align="center"
                    sx={{ py: 5 }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={headCells.length + 1} // Adjusted colspan
                    align="center"
                  >
                    No listings found.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((l) => {
                  const isItemSelected = isSelected(l._id); // <-- Check if item is selected
                  const labelId = `enhanced-table-checkbox-${l._id}`;
                  const hidKey = l._id;
                  const featKey = "feature-" + l._id;
                  const anyLoading =
                    actionLoading[hidKey] || actionLoading[featKey];
                  const isFeatured = l.featuredAt != null;

                  return (
                    <TableRow
                      key={l._id}
                      hover
                      onClick={(event) => handleClick(event, l._id)} // <-- Handle row click for selection
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected} // <-- Highlight selected rows
                      sx={{ opacity: l.isHidden ? 0.6 : 1, cursor: "pointer" }} // Add pointer cursor
                    >
                      <TableCell padding="checkbox">
                        {" "}
                        {/* Row Checkbox */}
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      <TableCell padding="checkbox">
                        <Avatar
                          variant="rounded"
                          src={l.images?.[0]}
                          sx={{ width: 56, height: 56, mr: 1 }}
                        >
                          {l.title?.[0]}
                        </Avatar>
                      </TableCell>
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
                      <TableCell align="right">
                        {formatPrice(l.price)}
                      </TableCell>
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
                      <TableCell align="center">
                        {" "}
                        {/* Actions */}
                        {/* Stop propagation on buttons to prevent row selection */}
                        <Tooltip
                          title={l.isHidden ? "Make Visible" : "Hide Listing"}
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVisibilityToggle(hidKey, l.isHidden);
                              }}
                              disabled={anyLoading || bulkDeleteLoading}
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
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeatureToggle(hidKey, l.featuredAt);
                              }}
                              disabled={anyLoading || bulkDeleteLoading}
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
                        {/* Loading indicators */}
                        {anyLoading && (
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
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalListings}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* --- Confirmation Dialog Integration --- */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)} // Close dialog on cancel/outside click
        onConfirm={executeBulkDelete} // Call the actual delete logic on confirm
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selected.length} selected listing(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonProps={{ color: "error" }} // Make delete button red
        isConfirming={bulkDeleteLoading} // Show loading state on confirm button
      />
    </Container>
  );
};

export default ManageListingsPage;
