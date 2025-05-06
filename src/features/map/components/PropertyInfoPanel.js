import React from "react";
import {
  Paper,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  CardMedia,
  Stack,
  Tooltip,
  Alert,
} from "@mui/material";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import DirectionsIcon from "@mui/icons-material/Directions";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoIcon from "@mui/icons-material/Info";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Helper to format price with consistent display
 */
const formatDisplayPrice = (price, listingType) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${
    listingType === "rent" ? "/mo" : ""
  }`;
};

/**
 * Get position data from a property object in a standard format
 */
const getPropertyPosition = (property) => {
  if (!property) return null;
  
  // First try position.lat/lng format
  if (property.position && 
      typeof property.position.lat === 'number' && 
      typeof property.position.lng === 'number') {
    return {
      lat: property.position.lat,
      lng: property.position.lng
    };
  }
  
  // Then try latitude/longitude format
  if (typeof property.latitude === 'number' && 
      typeof property.longitude === 'number') {
    return {
      lat: property.latitude,
      lng: property.longitude
    };
  }
  
  return null;
};

/**
 * Helper to construct location string with consistent handling of null/undefined values
 */
const constructLocationString = (property) => {
  if (!property) return "Location unavailable";
  
  // If the property already has a pre-constructed address string, use it
  if (property.address) return property.address;
  
  // If the property has a location field, use it (legacy support)
  if (property.location) return property.location;
  
  // Otherwise construct from individual fields
  const locationParts = [
    property.addressLine1,
    property.addressLine2,
    property.upazila,
    property.cityTown,
    property.district,
    property.postalCode,
  ].filter(Boolean);
  
  return locationParts.length > 0 
    ? locationParts.join(", ") 
    : "Location details not available";
};

/**
 * Function to normalize position coordinates
 */
const normalizePosition = (position) => {
  if (!position) return null;
  
  // Handle object format {lat, lng}
  if (typeof position === 'object') {
    if (typeof position.lat === 'number' && typeof position.lng === 'number') {
      return {
        lat: parseFloat(position.lat.toFixed(6)),
        lng: parseFloat(position.lng.toFixed(6))
      };
    }
  }
  
  return null;
};

/**
 * Get location accuracy icon and color
 */
const getLocationAccuracyInfo = (accuracy) => {
  switch(accuracy) {
    case 'precise':
      return {
        icon: <CheckCircleIcon fontSize="small" />,
        color: "success",
        text: "precise",
        label: "P"
      };
    case 'approximate':
      return {
        icon: <WarningIcon fontSize="small" />,
        color: "warning",
        text: "approximate",
        label: "A"
      };
    case 'district-level':
      return {
        icon: <ErrorIcon fontSize="small" />,
        color: "error",
        text: "district-level",
        label: "D"
      };
    default:
      return {
        icon: <InfoIcon fontSize="small" />,
        color: "default",
        text: "unknown",
        label: "U"
      };
  }
};

/**
 * PropertyInfoPanel Component - Enhanced for better property details display
 * with improved address handling and location accuracy indicators
 */
const PropertyInfoPanel = ({ selectedProperty }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // If no property is selected, return null
  if (!selectedProperty) {
    return null;
  }

  // Default image handling
  const placeholderImg = `/pictures/placeholder.png`;
  const imgSrc =
    Array.isArray(selectedProperty.images) && selectedProperty.images.length > 0
      ? `/pictures/${selectedProperty.images[0]}`
      : placeholderImg;
  
  // Get location string using the helper function
  const locationString = constructLocationString(selectedProperty);
  
  // Property type check
  const isLandOrCommercial = 
    selectedProperty.propertyType === "land" || 
    selectedProperty.propertyType === "commercial";
  
  // Price formatting
  const formattedPrice = formatDisplayPrice(
    selectedProperty.price, 
    selectedProperty.listingType || selectedProperty.mode // Support both new and old property formats
  );
  
  // Get position data in a consistent format
  const positionData = getPropertyPosition(selectedProperty);
  const stablePosition = positionData ? normalizePosition(positionData) : null;

  // Get location accuracy information
  const locationAccuracy = selectedProperty.locationAccuracy || "unknown";
  const accuracyInfo = getLocationAccuracyInfo(locationAccuracy);

  // Image error handler
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };

  // Navigation handler with proper error handling
  const navigateToPropertyPage = () => {
    if (!selectedProperty._id) {
      console.error("Cannot navigate - property ID is missing");
      return;
    }
    navigate(`/properties/${selectedProperty._id}`);
  };

  // Get directions handler with position validation
  const getDirections = () => {
    let destination = '';
    
    // Try to use address for more accurate directions
    if (locationString && locationString !== "Location details not available" && locationString !== "Location unavailable") {
      // Use the address string directly, encoded for a URL
      destination = encodeURIComponent(locationString);
      console.log(`Using address for directions: ${locationString}`);
    } else if (stablePosition) {
      // Fall back to coordinates if no valid address
      destination = `${stablePosition.lat},${stablePosition.lng}`;
      console.log(`Using coordinates for directions: ${destination}`);
    } else {
      console.error("Cannot get directions - property position is invalid");
      return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        p: 2,
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(5px)",
        borderTop: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {/* Location Accuracy Warning for district-level or approximate */}
      {(locationAccuracy === 'district-level' || locationAccuracy === 'approximate') && (
        <Alert 
          severity={locationAccuracy === 'district-level' ? "error" : "warning"}
          icon={accuracyInfo.icon}
          sx={{ 
            mb: 2, 
            fontSize: "0.85rem", 
            '& .MuiAlert-message': { 
              display: 'flex', 
              alignItems: 'center' 
            } 
          }}
        >
          {locationAccuracy === 'district-level' 
            ? t("district_level_warning", "This is an approximate location at district level. The exact property may be elsewhere in this district.")
            : t("approximate_location_warning", "This is an approximate location. The exact property may be nearby but not at this exact point.")
          }
        </Alert>
      )}
      
      <Grid container spacing={2} alignItems="center">
        {/* Property Image */}
        <Grid item xs={12} sm={3} md={2}>
          <CardMedia
            component="img"
            image={imgSrc}
            alt={selectedProperty.title || "Unnamed Property"}
            onError={handleImageError}
            sx={{
              height: 80,
              width: "100%",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </Grid>
        
        {/* Property Details */}
        <Grid item xs={12} sm={9} md={5}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            {selectedProperty.title || "Unnamed Property"}
          </Typography>
          
          <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
            <LocationOnIcon 
              fontSize="small" 
              color="action" 
              sx={{ mt: 0.3, mr: 0.5, minWidth: 20 }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.2,
                flexGrow: 1
              }}
            >
              {locationString}
            </Typography>
            
            {/* Location Accuracy Indicator */}
            <Tooltip 
              title={t(`location_accuracy_${accuracyInfo.text}`, `${locationAccuracy.charAt(0).toUpperCase() + locationAccuracy.slice(1)} Location`)}
              arrow
            >
              <Chip
                size="small"
                color={accuracyInfo.color}
                label={accuracyInfo.label}
                sx={{ 
                  ml: 1, 
                  height: 20, 
                  minWidth: 20, 
                  width: 20,
                  '& .MuiChip-label': { 
                    p: 0,
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }
                }}
              />
            </Tooltip>
          </Box>
          
          <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>
            {formattedPrice}
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}
          >
            {!isLandOrCommercial && selectedProperty.bedrooms !== undefined && (
              <Chip
                icon={<BedIcon fontSize="small" />}
                label={`${selectedProperty.bedrooms} ${t("beds", "Beds")}`}
                size="small"
                variant="outlined"
              />
            )}
            
            {!isLandOrCommercial && selectedProperty.bathrooms !== undefined && (
              <Chip
                icon={<BathtubIcon fontSize="small" />}
                label={`${selectedProperty.bathrooms} ${t("baths", "Baths")}`}
                size="small"
                variant="outlined"
              />
            )}
            
            {selectedProperty.area !== undefined && (
              <Chip
                icon={<SquareFootIcon fontSize="small" />}
                label={`${selectedProperty.area} ft²`}
                size="small"
                variant="outlined"
              />
            )}
            
            {selectedProperty.propertyType && (
              <Chip
                icon={<HomeWorkIcon fontSize="small" />}
                label={selectedProperty.propertyType}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Grid>
        
        {/* Action Buttons */}
        <Grid item xs={6} md={2.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DirectionsIcon />}
            onClick={getDirections}
            fullWidth
            disabled={!stablePosition && !locationString}
            sx={{ borderRadius: "8px", textTransform: "none", py: 1 }}
          >
            {t("directions", "Directions")}
          </Button>
        </Grid>
        
        <Grid item xs={6} md={2.5}>
          <Button
            variant="outlined"
            color="primary"
            onClick={navigateToPropertyPage}
            startIcon={<OpenInNewIcon />}
            fullWidth
            sx={{ borderRadius: "8px", textTransform: "none", py: 1 }}
          >
            {t("view_details", "View Details")}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyInfoPanel;