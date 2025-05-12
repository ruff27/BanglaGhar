import React from "react";
import { Popup } from "react-leaflet";
import { Box, Typography, Button, Divider, Chip, Stack } from "@mui/material";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoIcon from "@mui/icons-material/Info";
import DirectionsIcon from "@mui/icons-material/Directions";
import { useTranslation } from "react-i18next";

/**
 * Helper function to format price with consistent handling
 */
const formatPrice = (price, listingType) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${
    listingType === "rent" ? "/mo" : ""
  }`;
};

/**
 * Helper function to construct location string with consistent handling
 */
const constructLocationString = (property) => {
  if (!property) return "Location unavailable";

  // If the property has a pre-constructed address string, use it
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
 * Get location accuracy text for display
 */
const getLocationAccuracyText = (accuracy, t) => {
  switch (accuracy) {
    case "precise":
      return t("location_accuracy_precise", "Precise Location");
    case "approximate":
      return t("location_accuracy_approximate", "Approximate Location");
    case "district-level":
      return t("location_accuracy_district", "District Level (Approximate)");
    default:
      return t("location_accuracy_unknown", "Location Accuracy Unknown");
  }
};

/**
 * Get location accuracy icon color
 */
const getLocationAccuracyColor = (accuracy) => {
  switch (accuracy) {
    case "precise":
      return "success";
    case "approximate":
      return "warning";
    case "district-level":
      return "error";
    default:
      return "default";
  }
};

/**
 * Enhanced MapPopup component for displaying property information
 */
const MapPopup = ({ property, onViewDetails }) => {
  const { t } = useTranslation();

  if (!property) return null;

  // Get stable location string - moved outside useMemo
  const locationString = constructLocationString(property);

  // Determine if property is land or commercial for conditional rendering
  const isLandOrCommercial =
    property.propertyType === "land" || property.propertyType === "commercial";

  // Handle view details click with consistent context
  const handleViewDetails = () => {
    if (onViewDetails) {
      // Create a stable copy of property before passing it to handler
      const stableProperty = {
        ...property,
        position: property.position
          ? {
              lat: parseFloat(property.position.lat.toFixed(6)),
              lng: parseFloat(property.position.lng.toFixed(6)),
            }
          : property.position,
      };
      onViewDetails(stableProperty);
    }
  };

  // Handle directions click
  const handleGetDirections = () => {
    let destination = "";

    // Try to use address for more accurate directions
    if (
      locationString &&
      locationString !== "Location details not available" &&
      locationString !== "Location unavailable"
    ) {
      // Use the address string directly, encoded for a URL
      destination = encodeURIComponent(locationString);
    } else if (property.position) {
      // Fall back to coordinates if no valid address
      destination = `${property.position.lat},${property.position.lng}`;
    } else if (property.latitude && property.longitude) {
      // Support for legacy format
      destination = `${property.latitude},${property.longitude}`;
    } else {
      console.error("Cannot get directions - no valid location data");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Popup closeButton={true} minWidth={280} maxWidth={320}>
      <Box sx={{ p: 0.5 }}>
        {/* Location Accuracy Indicator */}
        {property.locationAccuracy &&
          property.locationAccuracy !== "precise" && (
            <Box sx={{ mb: 1 }}>
              <Chip
                icon={<InfoIcon fontSize="small" />}
                label={`📍 ${getLocationAccuracyText(
                  property.locationAccuracy,
                  t
                )}`}
                size="small"
                color={getLocationAccuracyColor(property.locationAccuracy)}
                variant="outlined"
                sx={{ width: "100%", fontSize: "0.75rem", fontWeight: 500 }}
              />
            </Box>
          )}

        {/* Property Title */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {property.title || "Unnamed Property"}
        </Typography>

        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
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
            }}
          >
            {locationString}
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <MonetizationOnIcon
            fontSize="small"
            color="primary"
            sx={{ mr: 0.5 }}
          />
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            {formatPrice(property.price, property.listingType)}
          </Typography>
          {property.listingType && (
            <Chip
              label={
                property.listingType === "rent"
                  ? t("for_rent", "For Rent")
                  : t("for_sale", "For Sale")
              }
              size="small"
              color={property.listingType === "rent" ? "info" : "success"}
              sx={{ ml: 1, height: 20, fontSize: "0.6rem" }}
            />
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Property Features */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 1, justifyContent: "space-between" }}
        >
          {!isLandOrCommercial && property.bedrooms !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <BedIcon fontSize="small" color="action" />
              <Typography variant="body2">{property.bedrooms}</Typography>
            </Box>
          )}

          {!isLandOrCommercial && property.bathrooms !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <BathtubIcon fontSize="small" color="action" />
              <Typography variant="body2">{property.bathrooms}</Typography>
            </Box>
          )}

          {property.area !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SquareFootIcon fontSize="small" color="action" />
              <Typography variant="body2">{property.area} ft²</Typography>
            </Box>
          )}

          {property.propertyType && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <HomeWorkIcon fontSize="small" color="action" />
              <Typography
                variant="body2"
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  maxWidth: "60px",
                }}
              >
                {property.propertyType}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DirectionsIcon />}
            onClick={handleGetDirections}
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: "8px",
              fontSize: "0.8rem",
            }}
          >
            {t("directions", "Directions")}
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleViewDetails}
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: "8px",
              fontSize: "0.8rem",
            }}
          >
            {t("view_details", "View Details")}
          </Button>
        </Box>

        {/* Warning for district-level location */}
        {property.locationAccuracy === "district-level" && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              display: "block",
              mt: 1,
              fontSize: "0.7rem",
              textAlign: "center",
            }}
          >
            {t(
              "location_approximate_note",
              "Note: This is an approximate location. The exact property may be elsewhere in this district."
            )}
          </Typography>
        )}
      </Box>
    </Popup>
  );
};

export default MapPopup;
