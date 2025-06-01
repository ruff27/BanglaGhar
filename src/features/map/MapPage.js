import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useParams,
  useNavigate, 
} from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Drawer,
  Divider,
  Snackbar,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Paper,
  InputAdornment,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import { useTranslation } from "react-i18next";
import MapComponent from "./components/MapComponent";
import PropertyInfoPanel from "./components/PropertyInfoPanel";
import FilterSidebar from "../properties/components/FilterSidebar"; 
import useMapData from "./hooks/useMapData";
const constructAddressString = (property) => {
  if (!property) return "Location unavailable";
  if (property.address) return property.address; 
  if (property.location) return property.location; 

  const addressParts = [
    property.addressLine1,
    property.addressLine2,
    property.upazila,
    property.cityTown,
    property.district,
    property.postalCode,
  ].filter(Boolean);
  return addressParts.length > 0
    ? addressParts.join(", ")
    : "Location details not available";
};

const MapPage = () => {
  const { propertyCode } = useParams(); 
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const [detailedFilters, setDetailedFilters] = useState({
    priceRange: [0, 50000000],
    bedrooms: "any",
    bathrooms: "any",
    propertyType: "any", 
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [showLocationInfo, setShowLocationInfo] = useState(false);


  const {
    properties: allMappableProperties, 
    loading,
    error,
    userLocation,
    mapCenter,
    mapZoom,
    selectedProperty,
    locateUser,
    handleSelectProperty, 
    clearSelectedProperty,
    handleMapMove,
    fetchPropertyByCode, 
  } = useMapData(propertyCode);

  useEffect(() => {
    if (propertyCode && selectedProperty?._id === propertyCode) {
      const message =
        selectedProperty.locationAccuracy === "district-level"
          ? t(
              "location_district_level",
              "Property loaded with district-level location. Exact location may vary."
            )
          : selectedProperty.locationAccuracy === "approximate"
          ? t(
              "location_approximate",
              "Property loaded with approximate location"
            )
          : t(
              "property_loaded",
              `Property '${
                selectedProperty.title || "Unnamed Property"
              }' loaded`
            );
      const severity =
        selectedProperty.locationAccuracy === "district-level"
          ? "warning"
          : "info";
      showNotification(message, severity);
    } else if (propertyCode && !loading && !selectedProperty) {
      
    }
  }, [propertyCode, selectedProperty, loading, t]); 
  const showNotification = useCallback((message, severity = "info") => {
    setNotification({ open: true, message, severity });
  }, []);

  const filteredMapProperties = useMemo(() => {
    let propsToFilter = Array.isArray(allMappableProperties)
      ? [...allMappableProperties]
      : [];

    // 1. Apply listingType filter (e.g., 'rent', 'buy', 'sold')
    if (propertyTypeFilter !== "all") {
      propsToFilter = propsToFilter.filter(
        (p) => p.listingType === propertyTypeFilter
      );
    }

    // 2. Apply detailed filters from FilterSidebar state ('detailedFilters')
    propsToFilter = propsToFilter.filter((p) => {
      if (!p) return false;
      const priceMatch =
        p.price !== null && p.price !== undefined
          ? (() => {
              const [minPrice, maxPrice] = detailedFilters.priceRange;
              return (
                p.price >= minPrice &&
                (maxPrice === 50000000 ? true : p.price <= maxPrice)
              );
            })()
          : true;

      let bedMatch = true;
      if (
        detailedFilters.bedrooms !== "any" &&
        p.bedrooms !== null &&
        p.bedrooms !== undefined
      ) {
        const requiredBeds = parseInt(detailedFilters.bedrooms, 10);
        bedMatch =
          detailedFilters.bedrooms === "5"
            ? p.bedrooms >= requiredBeds
            : p.bedrooms === requiredBeds;
      } else if (
        detailedFilters.bedrooms !== "any" &&
        (p.bedrooms === null || p.bedrooms === undefined)
      ) {
        bedMatch = false;
      }

      let bathMatch = true;
      if (
        detailedFilters.bathrooms !== "any" &&
        p.bathrooms !== null &&
        p.bathrooms !== undefined
      ) {
        const requiredBaths = parseInt(detailedFilters.bathrooms, 10);
        bathMatch =
          detailedFilters.bathrooms === "3"
            ? p.bathrooms >= requiredBaths
            : p.bathrooms === requiredBaths;
      } else if (
        detailedFilters.bathrooms !== "any" &&
        (p.bathrooms === null || p.bathrooms === undefined)
      ) {
        bathMatch = false;
      }
      const typeMatch =
        detailedFilters.propertyType === "any" ||
        (p.propertyType &&
          p.propertyType.toLowerCase() ===
            detailedFilters.propertyType.toLowerCase());

      return priceMatch && bedMatch && bathMatch && typeMatch;
    });

    // 3. Apply Search Query
    if (searchQuery && searchQuery.trim() !== "") {
      const sq = searchQuery.toLowerCase().trim();
      const propsWithAddress = propsToFilter.map((p) => ({
        ...p,
        addressForSearch: constructAddressString(p),
      }));
      propsToFilter = propsWithAddress.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(sq)) ||
          (p.addressForSearch &&
            p.addressForSearch.toLowerCase().includes(sq)) ||
          (p.district && p.district.toLowerCase().includes(sq)) ||
          (p.cityTown && p.cityTown.toLowerCase().includes(sq)) ||
          (p.upazila && p.upazila.toLowerCase().includes(sq))
      );
    }
    return propsToFilter;
  }, [allMappableProperties, propertyTypeFilter, detailedFilters, searchQuery]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handlePropertyTypeFilterChange = (event, newType) => {
    if (newType !== null) {
      setPropertyTypeFilter(newType);
      clearSelectedProperty(); 
    }
  };
  const handleCloseNotification = () =>
    setNotification((prev) => ({ ...prev, open: false }));
  const toggleLocationInfo = () => setShowLocationInfo((prev) => !prev);

  const handleDetailedFilterChange = (newFilters) =>
    setDetailedFilters(newFilters);
  const handleResetDetailedFilters = () => {
    setDetailedFilters({
      priceRange: [0, 50000000],
      bedrooms: "any",
      bathrooms: "any",
      propertyType: "any",
    });
    showNotification(t("filters_reset", "Filters reset"), "info");
  };
  const handleCloseFiltersDrawer = () => setFiltersOpen(false);
  const handleOpenFiltersDrawer = () => setFiltersOpen(true);

  const clearAllPageFilters = () => {
    setSearchQuery("");
    setPropertyTypeFilter("all"); 
    handleResetDetailedFilters(); 
    clearSelectedProperty();
  };
  const handleBack = () => navigate(-1);


  const onMarkerPropertySelect = useCallback(
    (property) => {
      handleSelectProperty(property);
    },
    [handleSelectProperty]
  );

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 1,
          m: { xs: 1, sm: 2 },
          mb: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          borderRadius: "12px",
          zIndex: 1100,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1.5 },
            flexWrap: "wrap",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
            size="small"
          >
            {t("back", "Back")}
          </Button>
          <TextField
            placeholder={t(
              "search_map_placeholder",
              "Search title, address..."
            )}
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: "8px", fontSize: "0.875rem" },
            }}
            sx={{
              width: { xs: "100%", sm: "auto" },
              mt: { xs: 1, sm: 0 },
              maxWidth: { sm: 250 },
            }}
          />
          <Tooltip title={t("filters", "Filters")}>
            <IconButton
              onClick={handleOpenFiltersDrawer}
              color="primary"
              size="small"
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1.5 },
            flexWrap: "wrap",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
            mt: { xs: 1, sm: 0 },
          }}
        >
          <ToggleButtonGroup
            value={propertyTypeFilter}
            exclusive
            onChange={handlePropertyTypeFilterChange}
            aria-label="property type filter"
            size="small"
          >
            <ToggleButton value="all" sx={{ fontSize: "0.75rem", px: 1 }}>
              {t("all_types", "All")}
            </ToggleButton>
            <ToggleButton value="rent" sx={{ fontSize: "0.75rem", px: 1 }}>
              {t("nav_rent", "Rent")}
            </ToggleButton>
            <ToggleButton value="buy" sx={{ fontSize: "0.75rem", px: 1 }}>
              {t("nav_buy", "Buy")}
            </ToggleButton>
            <ToggleButton value="sold" sx={{ fontSize: "0.75rem", px: 1 }}>
              {t("nav_sold", "Sold")}
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title={t("locate_me", "Locate Me")}>
            <IconButton onClick={locateUser} color="primary" size="small">
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("location_accuracy_info", "Location Info")}>
            <IconButton onClick={toggleLocationInfo} color="info" size="small">
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <Button
            onClick={clearAllPageFilters}
            size="small"
            sx={{ fontSize: "0.75rem" }}
          >
            {t("clear_all", "Clear All")}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            width: "auto",
            maxWidth: "90%",
          }}
          onClose={() => {
            /* Consider if clearSelectedProperty or specific error clear is needed */
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          m: { xs: 1, sm: 2 },
          mt: 1,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: 1,
        }}
      >
        {loading && !selectedProperty ? ( 
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress />{" "}
            <Typography sx={{ mt: 2 }}>
              {t("loading_map", "Loading map data...")}
            </Typography>
          </Box>
        ) : (
          <MapComponent
            properties={filteredMapProperties}
            mapCenter={mapCenter} 
            mapZoom={mapZoom}
            userLocation={userLocation} 
            selectedProperty={selectedProperty}
            onMarkerClick={onMarkerPropertySelect}
            onMapMove={handleMapMove}
          />
        )}
        {selectedProperty && (
          <PropertyInfoPanel selectedProperty={selectedProperty} />
        )}
      </Box>

      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={handleCloseFiltersDrawer}
        PaperProps={{ sx: { width: "80%", maxWidth: "320px" } }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("filters", "Filters")}</Typography>
            <IconButton onClick={handleCloseFiltersDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <FilterSidebar
              filters={detailedFilters}
              onFilterChange={handleDetailedFilterChange}
              onResetFilters={handleResetDetailedFilters}
              isMobile={true} // Assuming sidebar adapts
              onClose={handleCloseFiltersDrawer}
            />
          </Box>
        </Box>
      </Drawer>

      <Drawer
        anchor="bottom"
        open={showLocationInfo}
        onClose={toggleLocationInfo}
        PaperProps={{
          sx: {
            maxHeight: "60%",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6">
              {t("location_accuracy_info", "Location Accuracy Information")}
            </Typography>
            <IconButton onClick={toggleLocationInfo} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            {t(
              "location_info_description",
              "Property locations are displayed with different accuracy levels:"
            )}
          </Typography>
          {/* Accuracy descriptions... */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Chip
                size="small"
                color="success"
                label="P"
                sx={{ mr: 1, width: 24, height: 24 }}
              />
              {t("precise_location_title", "Precise Location (P)")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4, mb: 2 }}>
              {t(
                "precise_location_desc",
                "The property is located at this exact point."
              )}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Chip
                size="small"
                color="warning"
                label="A"
                sx={{ mr: 1, width: 24, height: 24 }}
              />
              {t("approximate_location_title", "Approximate Location (A)")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4, mb: 2 }}>
              {t(
                "approximate_location_desc",
                "The property is near this point; exact location may vary."
              )}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Chip
                size="small"
                color="error"
                label="D"
                sx={{ mr: 1, width: 24, height: 24 }}
              />
              {t("district_location_title", "District-Level (D)")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4 }}>
              {t(
                "district_location_desc",
                "Only the general district is known."
              )}
            </Typography>
          </Box>
          <Alert severity="info">
            {t(
              "directions_info",
              "For 'Directions', the property's address (if available) is prioritized over map coordinates for better accuracy."
            )}
          </Alert>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
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
    </Box>
  );
};

export default MapPage;
