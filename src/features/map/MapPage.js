// src/features/map/MapPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

// Import components and hooks
import MapComponent from "./components/MapComponent";
import PropertyInfoPanel from "./components/PropertyInfoPanel";
import FilterSidebar from "../properties/components/FilterSidebar";
import useMapData from "./hooks/useMapData";
import axios from "axios";
import { divisionCenters } from "../../constants/divisionCenters";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * Extract position data from a property in a consistent format
 */
const getFallbackPosition = (property) => {
  const lowerDistrict = property.district?.toLowerCase() || "";
  const lowerDivision = property.division?.toLowerCase() || "";

  const fallbackKey = Object.keys(divisionCenters).find(
    (key) => lowerDistrict.includes(key) || lowerDivision.includes(key)
  );

  if (fallbackKey) {
    return {
      lat: divisionCenters[fallbackKey][0],
      lng: divisionCenters[fallbackKey][1],
    };
  }

  return null; // no fallback available
};
const getPropertyPosition = (property) => {
  if (!property) return null;

  if (
    property.position &&
    typeof property.position.lat === "number" &&
    typeof property.position.lng === "number"
  ) {
    return {
      lat: property.position.lat,
      lng: property.position.lng,
    };
  }

  if (
    typeof property.latitude === "number" &&
    typeof property.longitude === "number"
  ) {
    return {
      lat: property.latitude,
      lng: property.longitude,
    };
  }

  const lowerDistrict = property.district?.toLowerCase() || "";
  const lowerDivision = property.division?.toLowerCase() || "";

  const fallbackKey = Object.keys(divisionCenters).find(
    (key) => lowerDistrict.includes(key) || lowerDivision.includes(key)
  );

  if (fallbackKey) {
    property.locationAccuracy = "district-level";
    return {
      lat: divisionCenters[fallbackKey][0],
      lng: divisionCenters[fallbackKey][1],
    };
  }

  return null;
};

/**
 * Function to construct a complete address string from property fields
 */
const constructAddressString = (property) => {
  if (!property) return "Location unavailable";

  // Use the location field if it exists
  if (property.location) return property.location;

  // Otherwise construct from individual address components
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

/**
 * MapPage Component - Fullscreen map view with enhanced location handling
 */
const MapPage = () => {
  const { propertyCode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- Local State for Page Controls ---
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionZoomOverride, setDivisionZoomOverride] = useState({
    center: null,
    zoom: null,
  });
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all"); // Values 'all', 'rent', 'buy', 'sold' used internally

  // State for filter drawer
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 50000000],
    bedrooms: "any",
    bathrooms: "any",
    propertyType: "any",
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // State for location accuracy info dialog
  const [showLocationInfo, setShowLocationInfo] = useState(false);

  // Refs for tracking state
  const propertyPositionRef = useRef(null);
  const propertyAddressRef = useRef(null);
  const loadingPropertyRef = useRef(false);

  // Use the map data hook
  const {
    properties,
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
  } = useMapData();

  // --- Filtered Properties based on local controls ---
  const filteredMapProperties = React.useMemo(() => {
    const divisions = [
      "dhaka",
      "chattogram",
      "khulna",
      "rajshahi",
      "barisal",
      "sylhet",
      "rangpur",
      "mymensingh",
    ];

    const lowerQuery = searchQuery.toLowerCase();

    //  Set zoom/center if query matches a division
    if (divisionCenters[lowerQuery]) {
      setDivisionZoomOverride({
        center: divisionCenters[lowerQuery],
        zoom: 10,
      });
    } else {
      setDivisionZoomOverride({ center: null, zoom: null });
    }

    return properties
      .map((p) => {
        const typeMatch =
          propertyTypeFilter === "all" || p.listingType === propertyTypeFilter;

        const lowerQuery = searchQuery.toLowerCase();
        const searchMatch =
          !searchQuery ||
          p.title?.toLowerCase().includes(lowerQuery) ||
          p.addressLine1?.toLowerCase().includes(lowerQuery) ||
          p.cityTown?.toLowerCase().includes(lowerQuery) ||
          p.district?.toLowerCase().includes(lowerQuery) ||
          (p.division &&
            typeof p.division === "string" &&
            (p.division.toLowerCase().includes(lowerQuery) ||
              divisions.includes(lowerQuery)));

        if (!typeMatch || !searchMatch) return null;

        const hasCoords =
          typeof p.latitude === "number" && typeof p.longitude === "number";

        if (hasCoords) {
          return p; // ✅ Already has exact coordinates
        }

        const fallback = getFallbackPosition(p);
        if (fallback) {
          return {
            ...p,
            latitude: fallback.lat,
            longitude: fallback.lng,
            position: fallback,
            locationAccuracy: "district-level",
          };
        }

        return null; //  Can't show anything without at least district
      })
      .filter(Boolean); // Remove any null entries
  }, [properties, propertyTypeFilter, searchQuery]);

  // Track if we've loaded a specific property
  const [specificPropertyLoaded, setSpecificPropertyLoaded] = useState(false);

  // --- Handlers for Page Controls ---
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePropertyTypeChange = (event, newType) => {
    if (newType !== null) {
      setPropertyTypeFilter(newType);
      clearSelectedProperty();
    }
  };

  // Show notification helper
  const showNotification = useCallback((message, severity = "info") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  // Close notification handler
  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Toggle location info dialog
  const toggleLocationInfo = () => {
    setShowLocationInfo((prev) => !prev);
  };

  // Fetch specific property if propertyCode is provided
  useEffect(() => {
    if (
      propertyCode &&
      !specificPropertyLoaded &&
      !loadingPropertyRef.current
    ) {
      loadingPropertyRef.current = true;
      const fetchProperty = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/properties/${propertyCode}`
          );

          if (response.data) {
            const property = response.data;

            const addressString = constructAddressString(property);
            propertyAddressRef.current = addressString;

            let positionData = getPropertyPosition(property);

            if (!positionData) {
              const lowerDistrict = property.district?.toLowerCase() || "";
              const lowerDivision = property.division?.toLowerCase() || "";

              const fallbackKey = Object.keys(divisionCenters).find(
                (key) =>
                  lowerDistrict.includes(key) || lowerDivision.includes(key)
              );

              if (fallbackKey) {
                const fallbackCoords = divisionCenters[fallbackKey];

                showNotification(
                  t(
                    "property_fallback_location",
                    `Exact property location is not available. Showing approximate location for '${fallbackKey}'.`
                  ),
                  "warning"
                );

                positionData = {
                  lat: fallbackCoords[0],
                  lng: fallbackCoords[1],
                };

                console.log(
                  "📍 Fallback used for division:",
                  fallbackKey,
                  "→",
                  positionData
                );

                // ✅ Add this block to inject usable coords
                property.position = positionData;
                property.latitude = positionData.lat;
                property.longitude = positionData.lng;

                // Label it as approximate
                property.locationAccuracy = "district-level";
              } else {
                console.warn(
                  `No position and no known division/district fallback for property ${propertyCode}`
                );

                showNotification(
                  t(
                    "property_missing_coordinates",
                    "This property has no valid location. It may not appear on the map."
                  ),
                  "warning"
                );

                return; // Skip rendering
              }
            }

            const stablePosition = {
              lat: parseFloat(positionData.lat.toFixed(6)),
              lng: parseFloat(positionData.lng.toFixed(6)),
            };

            propertyPositionRef.current = stablePosition;

            const enhancedProperty = {
              ...property,
              address: addressString,
              position: stablePosition,
              latitude: stablePosition.lat,
              longitude: stablePosition.lng,
            };

            handleSelectProperty(enhancedProperty);
            setSpecificPropertyLoaded(true);

            if (property.locationAccuracy === "district-level") {
              showNotification(
                t(
                  "location_district_level",
                  "Property loaded with district-level location. Exact location may vary."
                ),
                "warning"
              );
            } else if (property.locationAccuracy === "approximate") {
              showNotification(
                t(
                  "location_approximate",
                  "Property loaded with approximate location"
                ),
                "info"
              );
            } else {
              showNotification(
                t(
                  "property_loaded",
                  `Property '${
                    enhancedProperty.title || "Unnamed Property"
                  }' loaded`
                ),
                "success"
              );
            }
          } else {
            showNotification(
              `Property with ID ${propertyCode} not found`,
              "error"
            );
          }
        } catch (err) {
          console.error("Error fetching property:", err);
          showNotification(`Error loading property: ${err.message}`, "error");
        } finally {
          loadingPropertyRef.current = false;
        }
      };

      fetchProperty();
    }
  }, [
    propertyCode,
    handleSelectProperty,
    specificPropertyLoaded,
    showNotification,
    t,
  ]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 50000000],
      bedrooms: "any",
      bathrooms: "any",
      propertyType: "any",
    });
    showNotification("Filters reset", "info");
  };

  // Close filter drawer
  const handleCloseFilters = () => {
    setFiltersOpen(false);
  };

  const clearSearchAndFilters = () => {
    setSearchQuery("");
    setPropertyTypeFilter("all");
    clearSelectedProperty();
  };

  // Back button handler
  const handleBack = () => {
    navigate(-1);
  };

  // Handle property selection with address handling
  const onPropertySelect = useCallback(
    (property) => {
      if (!property) return;

      // Add address to property if not already present
      let enhancedProperty = { ...property };

      if (!enhancedProperty.address) {
        enhancedProperty.address = constructAddressString(property);
      }

      // Use the hook's handler with the enhanced property
      handleSelectProperty(enhancedProperty);

      // Update position reference
      const positionData = getPropertyPosition(property);
      if (positionData) {
        propertyPositionRef.current = {
          lat: parseFloat(positionData.lat.toFixed(6)),
          lng: parseFloat(positionData.lng.toFixed(6)),
        };
      }

      // Update address reference
      propertyAddressRef.current = enhancedProperty.address;

      // Show notification based on location accuracy
      if (property.locationAccuracy === "district-level") {
        showNotification(
          t(
            "location_district_level_short",
            "District-level location (approximate)"
          ),
          "warning"
        );
      } else if (property.locationAccuracy === "approximate") {
        showNotification(
          t("location_approximate_short", "Approximate location"),
          "info"
        );
      }
    },
    [handleSelectProperty, showNotification, t]
  );

  // Locate user handler with error handling
  const handleLocateUser = () => {
    try {
      locateUser();
      showNotification("Finding your location...", "info");
    } catch (err) {
      console.error("Error locating user:", err);
      showNotification("Failed to get your location", "error");
    }
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)", // Full height minus navbar
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Top Controls */}
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          m: 2,
          mb: 0,
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          flexWrap: "wrap",
          borderRadius: "12px",
          position: "relative",
          zIndex: 1100,
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
          placeholder={t("search_property", "Search title or location...")}
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
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

        <ToggleButtonGroup
          value={propertyTypeFilter}
          exclusive
          onChange={handlePropertyTypeChange}
          aria-label="property type filter"
          size="small"
        >
          {/* Translate labels, keep values */}
          <ToggleButton value="all" aria-label="all types">
            {t("all_types", "All Types")}
          </ToggleButton>
          <ToggleButton value="rent" aria-label="for rent">
            {t("nav_rent", "Rent")}
          </ToggleButton>
          <ToggleButton value="buy" aria-label="for sale">
            {t("nav_buy", "Buy")}
          </ToggleButton>
          <ToggleButton value="sold" aria-label="sold">
            {t("nav_sold", "Sold")}
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={t("locate_me", "Locate Me")}>
          <IconButton onClick={handleLocateUser} color="primary">
            <MyLocationIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={t("location_accuracy_info", "Location Accuracy Info")}>
          <IconButton onClick={toggleLocationInfo} color="info">
            <InfoIcon />
          </IconButton>
        </Tooltip>

        <Button
          onClick={clearSearchAndFilters}
          size="small"
          sx={{ textTransform: "none" }}
        >
          {t("clear", "Clear")}
        </Button>

        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setFiltersOpen(true)}
          variant="outlined"
          size="small"
        >
          {t("filters", "Filters")}
        </Button>
      </Paper>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            position: "absolute",
            top: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            width: "90%",
            maxWidth: "600px",
          }}
          onClose={() => clearSelectedProperty()}
        >
          {error}
        </Alert>
      )}

      {/* Map Container */}
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          mx: 2,
          mb: 2,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: 1,
        }}
      >
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              {t("loading_map", "Loading map data...")}
            </Typography>
          </Box>
        ) : (
          <MapComponent
            properties={filteredMapProperties}
            mapCenter={divisionZoomOverride.center || mapCenter}
            mapZoom={divisionZoomOverride.zoom || mapZoom}
            userLocation={userLocation}
            selectedProperty={selectedProperty}
            onMarkerClick={onPropertySelect}
            onMapMove={handleMapMove}
            showLocationAccuracy={true}
          />
        )}

        {/* Selected property info panel */}
        {selectedProperty && (
          <PropertyInfoPanel selectedProperty={selectedProperty} />
        )}
      </Box>

      {/* Filters Drawer */}
      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={handleCloseFilters}
        PaperProps={{ sx: { width: "80%", maxWidth: "350px" } }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("filters", "Filters")}</Typography>
            <IconButton onClick={handleCloseFilters} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 1 }} />

          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            isMobile={true}
            onClose={handleCloseFilters}
          />
        </Box>
      </Drawer>

      {/* Location Accuracy Information Dialog */}
      <Drawer
        anchor="bottom"
        open={showLocationInfo}
        onClose={toggleLocationInfo}
        PaperProps={{
          sx: {
            maxHeight: "50%",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            p: 2,
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
              "Property locations on the map are displayed with different accuracy levels:"
            )}
          </Typography>

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
              {t("precise_location_title", "Precise Location")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4, mb: 2 }}>
              {t(
                "precise_location_desc",
                "The property is located at this exact point on the map."
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
              {t("approximate_location_title", "Approximate Location")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4, mb: 2 }}>
              {t(
                "approximate_location_desc",
                "The property is located near this point, but the exact location may be slightly different."
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
              {t("district_location_title", "District-Level Location")}
            </Typography>
            <Typography variant="body2" sx={{ ml: 4 }}>
              {t(
                "district_location_desc",
                "Only the general area (district) is known. The exact property location may be elsewhere in this district."
              )}
            </Typography>
          </Box>

          <Alert severity="info">
            {t(
              "directions_info",
              "When using the 'Directions' button, the system will prioritize using the property's address rather than map coordinates for more accurate navigation."
            )}
          </Alert>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={toggleLocationInfo}>
              {t("close", "Close")}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        message={notification.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default MapPage;
