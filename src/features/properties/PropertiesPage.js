import React, { useState, useEffect } from "react"; // Removed useCallback as handleViewDetails is gone
import { useParams, useLocation, useNavigate } from "react-router-dom"; // Keep navigate if needed for other things
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
  Paper,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

// Import Hooks and Components
import usePropertyFilters from "./hooks/usePropertyFilters";
import useWishlist from "./hooks/useWishlist";
import FilterSidebar from "./components/FilterSidebar";
import SortDropdown from "./components/SortDropdown";
import PropertyCard from "./components/PropertyCard";
// PropertyDetailsDialog import is removed

/**
 * PropertiesPage Component
 * Displays filterable/sortable property listings.
 */
const PropertiesPage = () => {
  const { mode } = useParams();
  // const navigate = useNavigate(); // Keep if needed elsewhere
  // const location = useLocation(); // Keep if needed elsewhere
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
  const { wishlistIds, toggleWishlist, loadingWishlist, wishlistError } =
    useWishlist();

  // --- Local State ---
  // Removed state related to dialog: detailsDialogOpen, selectedProperty
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --- Handlers ---
  // Removed handleViewDetails and handleClosePropertyDetails
  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification((prev) => ({ ...prev, open: false }));
  };
  const showWishlistNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };
  const handleWishlistToggle = (propertyId) => {
    if (!propertyId) return;
    toggleWishlist(propertyId, showWishlistNotification);
  };
  const handleDrawerToggle = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // --- Effects ---
  // Removed useEffect related to opening dialog via query params

  const pageTitle = mode
    ? `${mode.charAt(0).toUpperCase() + mode.slice(1)} Properties`
    : "All Properties";

  // Sidebar content component
  const sidebarContent = (
    <FilterSidebar
      filters={filters}
      onFilterChange={handleFilterChange}
      onResetFilters={resetFilters}
      isMobile={isMobile}
      onClose={handleDrawerToggle}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
        {pageTitle}
      </Typography>

      {wishlistError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Could not load wishlist status: {wishlistError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sidebar Grid Item (Hidden on Mobile) */}
        {!isMobile && (
          <Grid item md={3} lg={2.5}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {sidebarContent}
            </Paper>
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
              <IconButton
                onClick={handleDrawerToggle}
                color="primary"
                aria-label="Open filters"
              >
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
              {properties.map((property) =>
                property && property._id ? (
                  <Grid item xs={12} sm={6} lg={4} key={property._id}>
                    <PropertyCard
                      property={property}
                      isWishlisted={wishlistIds.has(property._id)}
                      onWishlistToggle={() =>
                        handleWishlistToggle(property._id)
                      }
                      // onViewDetails prop is removed
                    />
                  </Grid>
                ) : null
              )}
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
          {/* TODO: Add Pagination component here */}
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
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filters
            </Typography>
            {sidebarContent}
          </Box>
        </Drawer>
      )}

      {/* Property Details Dialog is removed */}

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
