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
  Paper,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Import Hooks and Components
import usePropertyFilters from "./hooks/usePropertyFilters";
import useWishlist from "./hooks/useWishlist";
import FilterSidebar from "./components/FilterSidebar";
import SortDropdown from "./components/SortDropdown";
import PropertyCard from "./components/PropertyCard"; // No translations needed here

/**
 * PropertiesPage Component
 */
const PropertiesPage = () => {
  const { mode } = useParams(); // mode = 'rent', 'buy', 'sold' or undefined
  const theme = useTheme();
  const { t } = useTranslation(); // Initialize translation
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

  useEffect(() => {
    console.log(
      "PropertiesPage: handleSearchChange defined?",
      typeof handleSearchChange
    );
  }, [handleSearchChange]);

  const { wishlistIds, toggleWishlist, loadingWishlist, wishlistError } =
    useWishlist();

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Determine page title based on mode and translate
  const getPageTitle = () => {
    switch (mode) {
      case "rent":
        return t("properties_rent");
      case "buy":
        return t("properties_sale"); // Assuming 'properties_sale' is the key for 'Properties for Sale'
      case "sold":
        return t("properties_sold");
      default:
        return t("properties_all"); // Key for 'All Properties'
    }
  };
  const pageTitle = getPageTitle();

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
        {pageTitle} {/* Applied translation */}
      </Typography>

      {wishlistError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Could not load wishlist status: {wishlistError} {/* <-- Kept as is */}
        </Alert>
      )}

      <Grid container spacing={3}>
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

        <Grid item xs={12} md={9} lg={9.5}>
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
              label={t("search_placeholder")} // Applied translation
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
                {" "}
                {/* <-- Kept aria-label */}
                <FilterListIcon />
              </IconButton>
            )}
          </Paper>

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
                    {/* PropertyCard is intentionally not translated */}
                    <PropertyCard
                      property={property}
                      isWishlisted={wishlistIds.has(property._id)}
                      onWishlistToggle={() =>
                        handleWishlistToggle(property._id)
                      }
                    />
                  </Grid>
                ) : null
              )}
            </Grid>
          ) : (
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
                {t("no_properties_found")} {/* Applied translation */}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("adjust_filters")} {/* Applied translation */}
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
              >
                {t("reset_filters")} {/* Applied translation */}
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileFiltersOpen}
          onClose={handleDrawerToggle}
          PaperProps={{ sx: { width: "80%", maxWidth: "300px" } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filters {/* <-- Kept as is */}
            </Typography>
            {sidebarContent}
          </Box>
        </Drawer>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {/* Assume notification message is simple or translated in hook */}
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
