import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Fuse from "fuse.js";

// Import the NEW MapComponent from its correct refactored location
import MapComponent from "../../map/components/MapComponent"; // Corrected path

// Import the STANDALONE PropertyCardSuggestion component
import PropertyCardSuggestion from "./PropertyCardSuggestion";

const API_BASE_URL = "http://localhost:5001/api"; // Or use env var

/**
 * HomeSearchBar Component
 * Displays the main search bar, suggestions, and map dialog for location selection.
 */
const HomeSearchBar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation
  const [searchQuery, setSearchQuery] = useState("");
  // Initialize with translated 'Any location'
  const [selectedLocation, setSelectedLocation] = useState(() =>
    t("search_location")
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Effect to update selectedLocation if language changes
  useEffect(() => {
    setSelectedLocation(t("search_location"));
  }, [t]);

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/properties?fields=title,location,images,mode,_id`
        );
        setAllProperties(response.data || []);
      } catch (error) {
        console.error("Error fetching all properties for search:", error);
      }
    };
    fetchAllProperties();
  }, []);

  const fuse = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return null;
    return new Fuse(allProperties, {
      keys: ["title", "location"],
      includeScore: true,
      threshold: 0.4,
    });
  }, [allProperties]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setLoadingSuggestions(true);

    if (query.length > 1 && fuse) {
      const results = fuse.search(query);
      setFilteredProperties(results.map((result) => result.item).slice(0, 5));
      setShowSuggestions(true);
    } else {
      setFilteredProperties([]);
      setShowSuggestions(false);
    }
    setLoadingSuggestions(false);
  };

  const handlePropertySelect = (property) => {
    const mode = property.mode || "rent";
    navigate(`/properties/${mode}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set("search", searchQuery);
    // When adding location filter, compare against translated 'Any location'
    // if (selectedLocation !== t('search_location')) queryParams.set('location', selectedLocation);
    navigate(`/properties/rent?${queryParams.toString()}`);
    setShowSuggestions(false);
  };

  const handleOpenMap = () => setMapOpen(true);
  const handleCloseMap = () => setMapOpen(false);
  const handleLocationSelected = (locationName) => {
    // Use translated 'Any location' as default/fallback
    setSelectedLocation(locationName || t("search_location"));
    handleCloseMap();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  return (
    <>
      <Paper
        ref={searchContainerRef}
        elevation={3}
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          gap: 1.5,
          borderRadius: "12px",
          mt: { xs: 4, md: -4 },
          mb: { xs: 4, md: 6 },
          zIndex: 10,
          position: "relative",
          backgroundColor: "background.paper",
          maxWidth: "950px",
          mx: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Query Input */}
        <Box
          sx={{
            position: "relative",
            flex: { xs: "1 1 100%", md: 3 },
            zIndex: 11,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t("search_placeholder")} // Already translated
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => setShowSuggestions(searchQuery.length > 1)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: "8px", bgcolor: alpha("#EFF9FE", 0.5) },
            }}
          />
          {/* Property Suggestions Dropdown */}
          {showSuggestions && (
            <Paper
              elevation={6}
              sx={{
                position: "absolute",
                top: "105%",
                left: 0,
                right: 0,
                bgcolor: "white",
                borderRadius: "8px",
                maxHeight: "400px",
                overflowY: "auto",
                zIndex: 12,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              {loadingSuggestions && (
                <Typography sx={{ p: 2, color: "text.secondary" }}>
                  {t("sending")} {/* Applied translation */}
                </Typography>
              )}
              {!loadingSuggestions && filteredProperties.length > 0 ? (
                <>
                  {filteredProperties.map((property) => (
                    <PropertyCardSuggestion
                      key={property._id || property.id}
                      property={property}
                      onSelect={() => handlePropertySelect(property)}
                    />
                  ))}
                  <Box
                    sx={{
                      p: 1,
                      textAlign: "center",
                      borderTop: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Button
                      size="small"
                      onClick={handleSearch}
                      sx={{ textTransform: "none" }}
                    >
                      View all results {/* <-- Kept as is, no key */}
                    </Button>
                  </Box>
                </>
              ) : (
                !loadingSuggestions &&
                searchQuery.length > 1 && (
                  <Typography sx={{ p: 2, color: "text.secondary" }}>
                    No specific matches found. {/* <-- Kept as is, no key */}
                  </Typography>
                )
              )}
            </Paper>
          )}
        </Box>

        {/* Location Input (triggers map) */}
        <TextField
          variant="outlined"
          fullWidth
          value={selectedLocation} // Now uses state initialized with t()
          onClick={handleOpenMap}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "8px",
              cursor: "pointer",
              bgcolor: alpha("#EFF9FE", 0.5),
            },
            readOnly: true,
          }}
          sx={{ flex: { xs: "1 1 100%", md: 1 } }}
        />

        {/* Search Button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
          sx={{
            py: 1.8,
            px: { xs: 2, md: 4 },
            borderRadius: "8px",
            flexShrink: 0,
            height: "56px",
            boxShadow: "0 4px 12px rgba(43, 123, 140, 0.2)",
            "&:hover": {
              bgcolor: "#246A77",
              boxShadow: "0 6px 16px rgba(43, 123, 140, 0.3)",
            },
          }}
        >
          {t("search_button")} {/* Already translated */}
        </Button>
      </Paper>

      {/* Map Dialog */}
      <Dialog
        open={mapOpen}
        onClose={handleCloseMap}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          Select Location {/* <-- Kept as is, no key */}
          <IconButton onClick={handleCloseMap} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: { xs: "60vh", md: "70vh" } }}>
          <MapComponent
            properties={allProperties}
            mapCenter={[23.8103, 90.4125]}
            mapZoom={7}
            onMarkerClick={(prop) => handleLocationSelected(prop.location)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomeSearchBar;
