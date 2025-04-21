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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/formatPrice";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const headCells = [
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
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const debouncedSearch = useCallback(
    debounce(() => setPage(0), 500),
    []
  );
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch();
  };
  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(0);
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
      if (filterStatus) params.append("status", filterStatus);

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
  }, [idToken, page, rowsPerPage, orderBy, order, searchTerm, filterStatus]);

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

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Listings
      </Typography>
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Search Title/Location/Creator"
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
            sx={{ flexGrow: 1, minWidth: 300 }}
          />
        </Box>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
        <TableContainer sx={{ maxHeight: "calc(100vh-300px)" }}>
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
                {headCells.map((h) => (
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
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    No listings found.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((l) => {
                  const hidKey = l._id;
                  const featKey = "feature-" + l._id;
                  const anyLoading =
                    actionLoading[hidKey] || actionLoading[featKey];
                  const isFeatured = l.featuredAt != null;
                  return (
                    <TableRow
                      key={l._id}
                      hover
                      sx={{ opacity: l.isHidden ? 0.6 : 1 }}
                    >
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
                        <Tooltip
                          title={l.isHidden ? "Make Visible" : "Hide Listing"}
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleVisibilityToggle(hidKey, l.isHidden)
                              }
                              disabled={anyLoading}
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
                              onClick={() =>
                                handleFeatureToggle(hidKey, l.featuredAt)
                              }
                              disabled={anyLoading}
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
    </Container>
  );
};

export default ManageListingsPage;
