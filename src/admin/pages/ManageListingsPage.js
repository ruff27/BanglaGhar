// src/admin/pages/ManageListingsPage.js
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
  Avatar, // For showing image thumbnail
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
// Add icons for potential actions later
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import DeleteIcon from '@mui/icons-material/Delete';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import CancelIcon from '@mui/icons-material/Cancel';
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext"; // Ensure path is correct
import { formatPrice } from "../../utils/formatPrice"; // Assuming you have this utility

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Define table headers for sorting
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
  }, // Combined location display
  { id: "propertyType", numeric: false, disablePadding: false, label: "Type" },
  {
    id: "listingType",
    numeric: false,
    disablePadding: false,
    label: "Category",
  }, // Using listingType as status
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
  }, // Placeholder
];

const ManageListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idToken } = useAuth();

  // State for Pagination, Sorting, Filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalListings, setTotalListings] = useState(0);
  const [order, setOrder] = useState("desc"); // Default desc for createdAt
  const [orderBy, setOrderBy] = useState("createdAt"); // Default sort field
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // For listingType ('rent', 'buy', 'sold')

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

  // Handler for Status Filter Change
  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  // Fetch Listings Effect
  useEffect(() => {
    const fetchListings = async () => {
      if (!idToken) {
        setError("Authentication token not available.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        sort: orderBy,
        order: order,
        search: searchTerm,
      });
      if (filterStatus) {
        params.append("status", filterStatus); // Use 'status' query param for listingType filter
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/admin/listings?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        setListings(response.data.listings);
        setTotalListings(response.data.totalListings);
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

  // Event Handlers (Sorting, Pagination)
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "PP"); // Shorter date format
    } catch {
      return "Invalid Date";
    }
  };

  const getListingStatusChipColor = (status) => {
    switch (status) {
      case "buy":
        return "success";
      case "rent":
        return "info";
      case "sold":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl">
      {" "}
      {/* Use wider container */}
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Listings
      </Typography>
      {/* Search/Filter Paper */}
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
            sx={{ flexGrow: 1, minWidth: "300px" }}
          />
          {/* Add Listing Type Filter Dropdown maybe? */}
        </Box>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper sx={{ width: "100%", overflow: "hidden" }} elevation={3}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          {" "}
          {/* Adjust height */}
          <Table
            stickyHeader
            sx={{ minWidth: 1000 }}
            aria-label="manage listings table"
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
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    No listings found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow
                    hover
                    key={listing._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      {" "}
                      {/* Align with header padding */}
                      <Avatar
                        variant="rounded" // or square
                        src={listing.images?.[0]} // Use first image as thumbnail
                        sx={{ width: 56, height: 56, mr: 1 }} // Adjust size
                      >
                        {/* Fallback if no image */}
                        {listing.title?.[0]}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={listing.title}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: "200px" }}
                        >
                          {listing.title}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(listing.price)}
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={`${listing.addressLine1}, ${listing.upazila}, ${listing.district}`}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: "200px" }}
                        >
                          {listing.cityTown || "N/A"},{" "}
                          {listing.district || "N/A"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {listing.propertyType}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={listing.listingType}
                        color={getListingStatusChipColor(listing.listingType)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>{listing.createdBy}</TableCell>
                    <TableCell>{formatDate(listing.createdAt)}</TableCell>
                    <TableCell>
                      {/* Placeholder for Action Buttons */}
                      {/* <Tooltip title="View Details"><IconButton size="small"><VisibilityIcon /></IconButton></Tooltip> */}
                      {/* <Tooltip title="Delete"><IconButton size="small" color="error"><DeleteIcon /></IconButton></Tooltip> */}
                    </TableCell>
                  </TableRow>
                ))
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
