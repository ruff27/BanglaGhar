import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Paper, // Added Paper
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList"; // Icon for mobile filter button
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh"; // For no results button

// Import Hooks and Components
import usePropertyFilters from "./hooks/usePropertyFilters";
import useWishlist from "./hooks/useWishlist";
import FilterSidebar from "./components/FilterSidebar";
import SortDropdown from "./components/SortDropdown";
import PropertyCard from "./components/PropertyCard";
import PropertyDetailsDialog from "./components/PropertyDetailsDialog";

/**
 * PropertiesPage Component
 *
 * Displays a list of properties based on the mode (rent/buy/sold).
 * Uses hooks for data fetching/filtering and wishlist management.
 * Renders filter sidebar, sort controls, property grid, and details dialog.
 */
const PropertiesPage = () => {
  const { mode } = useParams(); // 'rent', 'buy', or 'sold'
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Use md breakpoint for sidebar toggle

  // --- State from Hooks ---
  const {
    properties,
    loading,
    error,
    filters,
    searchTerm,
    sortBy,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    resetFilters,
  } = usePropertyFilters(mode);
  const { wishlist, toggleWishlist, loadingWishlist } = useWishlist();

  // --- Local State ---
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --- Handlers ---
  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setDetailsDialogOpen(true);
    // Optional: Update URL without full page reload
    // navigate(`${location.pathname}?open=${property._id}`, { replace: true });
  };
  const handleClosePropertyDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedProperty(null);
    // Optional: Clear query param on close
    // navigate(location.pathname, { replace: true });
  };
  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification((prev) => ({ ...prev, open: false }));
  };
  const handleWishlistToggle = (propertyId) => {
    toggleWishlist(propertyId, (message, severity) => {
      setNotification({ open: true, message, severity });
    });
  };
  const handleDrawerToggle = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Effect to check URL query params for opening dialog on load/navigation
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertyIdToOpen = queryParams.get("open");
    if (propertyIdToOpen && properties.length > 0) {
      // Prevent opening if already open with the same property
      if (!detailsDialogOpen || selectedProperty?._id !== propertyIdToOpen) {
        const propertyToOpen = properties.find(
          (p) => p._id === propertyIdToOpen
        );
        if (propertyToOpen) {
          handleViewDetails(propertyToOpen);
        }
      }
    } else if (!propertyIdToOpen && detailsDialogOpen) {
      // Close dialog if query param is removed (e.g., browser back)
      // handleClosePropertyDetails(); // This might be too aggressive, consider user experience
    }
    // Only run when properties or search query changes significantly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, location.search]);

  const pageTitle = mode
    ? `${mode.charAt(0).toUpperCase() + mode.slice(1)} Properties`
    : "Properties";

  // Sidebar content component (to reuse in Drawer and Grid)
  const sidebarContent = (
    <FilterSidebar
      filters={filters}
      onFilterChange={handleFilterChange}
      onResetFilters={resetFilters}
      isMobile={isMobile}
      onClose={handleDrawerToggle} // Pass handler to close drawer
    />
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        {pageTitle}
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar Grid Item (Hidden on Mobile) */}
        {!isMobile && (
          <Grid item md={3} lg={2.5}>
            {sidebarContent}
          </Grid>
        )}

        {/* Main Content Grid Item */}
        <Grid item xs={12} md={9} lg={9.5}>
          {/* Top Controls: Search, Sort, Mobile Filter Button */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              borderRadius: "12px",
            }}
          >
            <TextField
              label="Search Properties..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: "8px" },
              }}
              sx={{ flexGrow: 1, minWidth: "200px" }}
            />
            <SortDropdown sortBy={sortBy} onSortChange={handleSortChange} />
            {isMobile && (
              <IconButton onClick={handleDrawerToggle} color="primary">
                <FilterListIcon />
              </IconButton>
            )}
          </Paper>

          {/* Property Listing */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : properties.length > 0 ? (
            <Grid container spacing={3}>
              {properties.map((property) => (
                <Grid item xs={12} sm={6} lg={4} key={property._id}>
                  <PropertyCard
                    property={property}
                    isWishlisted={wishlist.includes(property._id)}
                    onWishlistToggle={() => handleWishlistToggle(property._id)}
                    onViewDetails={() => handleViewDetails(property)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            // No results message
            <Box
              sx={{
                textAlign: "center",
                mt: 4,
                p: 4,
                backgroundColor: "rgba(0,0,0,0.02)",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                No properties match your criteria
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Try adjusting your filters or search terms.
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </Box>
          )}
          {/* Add Pagination component here later if needed */}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileFiltersOpen}
          onClose={handleDrawerToggle}
          PaperProps={{ sx: { width: "80%", maxWidth: "300px" } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Property Details Dialog */}
      {selectedProperty && ( // Conditionally render dialog only when a property is selected
        <PropertyDetailsDialog
          open={detailsDialogOpen}
          property={selectedProperty}
          onClose={handleClosePropertyDetails}
          mode={mode} // Pass mode if needed inside dialog
        />
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PropertiesPage;
