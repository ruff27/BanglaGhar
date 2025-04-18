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

// Import Hook and Components
import useMapData from "./hooks/useMapData";
import MapComponent from "./components/MapComponent";
import PropertyInfoPanel from "./components/PropertyInfoPanel";

/**
 * MapPage Component
 *
 * Container for the interactive map view. Uses useMapData hook for state
 * and renders MapComponent and PropertyInfoPanel. Includes controls for
 * search, filtering, and locating the user.
 */
const MapPage = () => {
  const navigate = useNavigate(); // If needed for navigation actions

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
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all"); // e.g., 'all', 'rent', 'buy'

  // --- Filtered Properties based on local controls ---
  // Note: This filtering could also be moved into the useMapData hook
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
      // Prevent unselecting all toggles
      setPropertyTypeFilter(newType);
      clearSelectedProperty(); // Clear selection when filter changes
    }
  };

  // Clear search and filters
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
        height: "calc(100vh - 64px)",
      }}
    >
      {" "}
      {/* Adjust height based on Navbar */}
      {/* Top Control Bar */}
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          m: 2, // Margin around the control bar
          mb: 0, // No bottom margin
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          flexWrap: "wrap", // Allow controls to wrap on small screens
          borderRadius: "12px",
          position: "relative", // Position relative for potential absolute elements inside
          zIndex: 1100, // Ensure controls are above map elements
        }}
      >
        <TextField
          placeholder="Search title or location..."
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
          <ToggleButton value="all" aria-label="all types">
            All
          </ToggleButton>
          <ToggleButton value="rent" aria-label="for rent">
            Rent
          </ToggleButton>
          <ToggleButton value="buy" aria-label="for sale">
            Buy
          </ToggleButton>
          <ToggleButton value="sold" aria-label="sold">
            Sold
          </ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title="Locate Me">
          <IconButton onClick={locateUser} color="primary">
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
        <Button
          onClick={clearSearchAndFilters}
          size="small"
          sx={{ textTransform: "none" }}
        >
          Clear
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
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          </Box>
        )}
        {!loading && !error && (
          <MapComponent
            properties={filteredMapProperties} // Pass filtered properties
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            userLocation={userLocation}
            selectedProperty={selectedProperty}
            onMarkerClick={handleSelectProperty} // Pass handler from hook
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
