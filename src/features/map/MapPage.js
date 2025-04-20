import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Paper,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useNavigate } from "react-router-dom"; // Import if needed for navigation
import { useTranslation } from "react-i18next"; // Import useTranslation

// Import Hook and Components
import useMapData from "./hooks/useMapData";
import MapComponent from "./components/MapComponent";
import PropertyInfoPanel from "./components/PropertyInfoPanel";

/**
 * MapPage Component
 */
const MapPage = () => {
  const navigate = useNavigate(); // If needed for navigation actions
  const { t } = useTranslation(); // Initialize translation

  // --- State from Hook ---
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

  // --- Local State for Page Controls ---
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all"); // Values 'all', 'rent', 'buy', 'sold' used internally

  // --- Filtered Properties based on local controls ---
  const filteredMapProperties = React.useMemo(() => {
    return properties.filter((p) => {
      const typeMatch =
        propertyTypeFilter === "all" || p.mode === propertyTypeFilter;
      const searchMatch =
        !searchQuery ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [properties, propertyTypeFilter, searchQuery]);

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

  const clearSearchAndFilters = () => {
    setSearchQuery("");
    setPropertyTypeFilter("all");
    clearSelectedProperty();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)", // Adjust height based on Navbar
      }}
    >
      {/* Top Control Bar */}
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
        <TextField
          placeholder={t("label")} // Applied translation (Search title or location...)
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
            {t("all_types")}
          </ToggleButton>
          <ToggleButton value="rent" aria-label="for rent">
            {t("nav_rent")}
          </ToggleButton>
          <ToggleButton value="buy" aria-label="for sale">
            {t("nav_buy")}
          </ToggleButton>
          <ToggleButton value="sold" aria-label="sold">
            {t("nav_sold")}
          </ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title="Locate Me">
          {" "}
          {/* <-- Kept as is, no key found */}
          <IconButton onClick={locateUser} color="primary">
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
        <Button
          onClick={clearSearchAndFilters}
          size="small"
          sx={{ textTransform: "none" }}
        >
          Clear {/* <-- Kept as is, no key found */}
        </Button>
      </Paper>
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
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 2,
            }}
          >
            {/* Assuming error message is simple or translated in the hook */}
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          </Box>
        )}
        {!loading && !error && (
          <MapComponent
            properties={filteredMapProperties}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            userLocation={userLocation}
            selectedProperty={selectedProperty}
            onMarkerClick={handleSelectProperty}
            // onMapMove={handleMapMove} // Pass if needed
          />
        )}
        {/* Selected Property Panel */}
        <PropertyInfoPanel selectedProperty={selectedProperty} />
      </Box>
    </Box>
  );
};

export default MapPage;
