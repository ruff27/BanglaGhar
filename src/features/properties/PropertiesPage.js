// src/features/Properties/pages/PropertiesPage.js
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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Chip,
  Divider, // Added Divider import
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close"; // Added CloseIcon import
import { useTranslation } from "react-i18next";

// Import Hooks and Components
import usePropertyFilters from "./hooks/usePropertyFilters";
import useWishlist from "./hooks/useWishlist";
import FilterSidebar from "./components/FilterSidebar";
import SortDropdown from "./components/SortDropdown";
import PropertyCard from "./components/PropertyCard";

/**
 * PropertiesPage Component - Updated with map navigation and location accuracy information
 */
const PropertiesPage = () => {
  const { mode } = useParams(); // mode = 'rent', 'buy', 'sold' or undefined
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // State for view mode (list only now - map redirects to MapPage)
  const [viewMode, setViewMode] = useState("list");
  
  // State for location accuracy info dialog
  const [locationInfoOpen, setLocationInfoOpen] = useState(false);

  // Get property data using existing hooks
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

  // Debug for handleSearchChange function
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

  // Notification handlers
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
  
  // Handle location info dialog
  const toggleLocationInfo = () => {
    setLocationInfoOpen(!locationInfoOpen);
  };

  // Handle view mode toggle - redirects to map page for "map" mode
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      if (newViewMode === "map") {
        // Navigate to the full-screen map view with listing type as query param
        const queryParam = mode ? `?type=${mode}` : '';
        navigate(`/map${queryParam}`);
      } else {
        setViewMode(newViewMode);
      }
    }
  };

  // Determine page title based on mode and translate
  const getPageTitle = () => {
    switch (mode) {
      case "rent":
        return t("properties_rent", "Properties for Rent");
      case "buy":
        return t("properties_sale", "Properties for Sale");
      case "sold":
        return t("properties_sold", "Sold Properties");
      default:
        return t("properties_all", "All Properties");
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
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {pageTitle}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t("location_accuracy_info", "Location Accuracy Information")}>
            <IconButton onClick={toggleLocationInfo} color="info" size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon sx={{ mr: 1 }} />
              {!isMobile && t("list_view", "List View")}
            </ToggleButton>
            <ToggleButton value="map" aria-label="map view">
              <MapIcon sx={{ mr: 1 }} />
              {!isMobile && t("map_view", "Map View")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {wishlistError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("wishlist_error", "Could not load wishlist status")}: {wishlistError}
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
              label={t("search_placeholder", "Search properties...")}
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
                aria-label={t("open_filters", "Open filters")}
              >
                <FilterListIcon />
              </IconButton>
            )}
          </Paper>

          {/* LIST VIEW CONTENT */}
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
                      showLocationAccuracy={true}
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
                {t("no_properties_found", "No properties found")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("adjust_filters", "Try adjusting your filters or search criteria")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
              >
                {t("reset_filters", "Reset Filters")}
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { width: "80%", maxWidth: "300px" } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("filters", "Filters")}
          </Typography>
          {sidebarContent}
        </Box>
      </Drawer>
      
      {/* Location Accuracy Information Dialog */}
      <Drawer
        anchor="bottom"
        open={locationInfoOpen}
        onClose={toggleLocationInfo}
        PaperProps={{ 
          sx: { 
            maxHeight: "50%", 
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            p: 2
          } 
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6">{t("location_accuracy_info", "Location Accuracy Information")}</Typography>
            <IconButton onClick={toggleLocationInfo} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body1" paragraph>
            {t("location_info_description", "Property locations on the map are displayed with different accuracy levels:")}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip size="small" color="success" label="P" sx={{ mr: 1, width: 24, height: 24 }} />
              {t("precise_location_title", "Precise Location")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4, mb: 2 }}>
              {t("precise_location_desc", "The property is located at this exact point on the map.")}
            </Typography>
            
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip size="small" color="warning" label="A" sx={{ mr: 1, width: 24, height: 24 }} />
              {t("approximate_location_title", "Approximate Location")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4, mb: 2 }}>
              {t("approximate_location_desc", "The property is located near this point, but the exact location may be slightly different.")}
            </Typography>
            
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip size="small" color="error" label="D" sx={{ mr: 1, width: 24, height: 24 }} />
              {t("district_location_title", "District-Level Location")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4 }}>
              {t("district_location_desc", "Only the general area (district) is known. The exact property location may be elsewhere in this district.")}
            </Typography>
          </Box>
          
          <Alert severity="info">
            {t("directions_info", "When using the 'Directions' button, the system will prioritize using the property's address rather than map coordinates for more accurate navigation.")}
          </Alert>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={toggleLocationInfo}>
              {t("close", "Close")}
            </Button>
          </Box>
        </Box>
      </Drawer>

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