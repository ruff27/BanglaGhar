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
import { useNavigate } from "react-router-dom";

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
  
  if (property.address) return property.address;
  
  if (property.location) return property.location;

  
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
  const navigate = useNavigate(); // Initialize navigate

  if (!property) return null;

  const locationString = constructLocationString(property);
  const isLandOrCommercial =
    property.propertyType === "land" || property.propertyType === "commercial";

  const handleGetDirections = () => {
    let destination = "";
    const position = property.position || {
      lat: property.latitude,
      lng: property.longitude,
    };

    if (
      locationString &&
      locationString !== "Location details not available" &&
      locationString !== "Location unavailable"
    ) {
      destination = encodeURIComponent(locationString);
    } else if (
      position &&
      typeof position.lat === "number" &&
      typeof position.lng === "number"
    ) {
      destination = `${position.lat},${position.lng}`;
    } else {
      console.error(
        "Cannot get directions - no valid location data for property:",
        property._id
      );
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=$${destination}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleViewDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(property);
    } else if (property && property._id) {
      console.warn(
        "MapPopup: onViewDetails prop not provided, falling back to direct navigation for property:",
        property._id
      );
      navigate(`/properties/details/${property._id}`);
    } else {
      console.error(
        "MapPopup: Cannot view details, missing onViewDetails prop or property._id"
      );
    }
  };

  return (
    <Popup closeButton={true} minWidth={280} maxWidth={320}>
      <Box sx={{ p: 0.5 }}>
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
          {property.title || t("unnamed_property", "Unnamed Property")}
        </Typography>

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
              lineHeight: 1.3,
            }}
            title={locationString}
          >
            {locationString}
          </Typography>
        </Box>

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
                  : property.listingType === "buy"
                  ? t("for_sale", "For Sale")
                  : t("status_sold", "Sold")
              }
              size="small"
              color={
                property.listingType === "rent"
                  ? "info"
                  : property.listingType === "buy"
                  ? "success"
                  : "default"
              }
              sx={{ ml: 1, height: 20, fontSize: "0.6rem" }}
            />
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{ mb: 1.5, justifyContent: "space-around", flexWrap: "wrap" }}
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
              <Typography variant="body2">
                {property.area} {t("sqft_unit", "ft²")}
              </Typography>
            </Box>
          )}
          {property.propertyType && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 1,
                minWidth: 0,
              }}
            >
              <HomeWorkIcon fontSize="small" color="action" />
              <Typography
                variant="body2"
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
                title={property.propertyType}
              >
                {t(property.propertyType, property.propertyType)}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DirectionsIcon />}
            onClick={handleGetDirections}
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: "8px",
              fontSize: "0.75rem",
              p: "4px 8px",
            }}
          >
            {t("directions", "Directions")}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleViewDetailsClick} // This line was previously causing the error
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: "8px",
              fontSize: "0.75rem",
              p: "4px 8px",
            }}
          >
            {t("view_details", "View Details")}
          </Button>
        </Box>

        {property.locationAccuracy === "district-level" && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              display: "block",
              mt: 1.5,
              fontSize: "0.7rem",
              textAlign: "center",
            }}
          >
            {t(
              "location_approximate_note",
              "Note: This is an approximate location."
            )}
          </Typography>
        )}
      </Box>
    </Popup>
  );
};

export default MapPopup;
