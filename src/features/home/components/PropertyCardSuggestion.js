import React from "react";
import { Box, Typography } from "@mui/material"; // Removed unused Button import
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next"; // Import useTranslation

/**
 * PropertyCardSuggestion Component
 *
 * A compact card used to display property suggestions, typically in a dropdown.
 * Uses PUBLIC_URL for reliable image paths from the public folder.
 * Includes image error handling.
 */
const PropertyCardSuggestion = ({ property, onSelect }) => {
  const { t } = useTranslation(); // Initialize translation
  // Construct image source using PUBLIC_URL for assets in the public folder
  const placeholderImg = `${process.env.PUBLIC_URL}/pictures/placeholder.png`;
  const imgSrc = property?.images?.[0] // Optional chaining for safety
    ? `${process.env.PUBLIC_URL}/pictures/${property.images[0]}`
    : placeholderImg;

  // Image error handler
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if placeholder also fails
    e.target.src = placeholderImg;
  };

  // Basic validation for property object
  if (!property || !property.title) {
    // Optionally render a loading/error state or null
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1.5,
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        "&:last-child": { borderBottom: 0 },
      }}
      onClick={onSelect} // Trigger selection handler on click
    >
      {/* Property Image */}
      <Box
        component="img"
        src={imgSrc}
        alt={property.title}
        onError={handleImageError} // Added error handler
        sx={{
          width: 50,
          height: 50,
          borderRadius: "4px",
          mr: 1.5,
          objectFit: "cover",
          flexShrink: 0, // Prevent image from shrinking
        }}
      />
      {/* Property Details */}
      <Box sx={{ overflow: "hidden" }}>
        {" "}
        {/* Prevent text overflow issues */}
        <Typography variant="body2" fontWeight="500" noWrap>
          {property.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center" }}
          noWrap
        >
          <LocationOnIcon sx={{ fontSize: "0.8rem", mr: 0.5, flexShrink: 0 }} />
          {/* Kept fallback text as is, no key found */}
          {property.location || "Location not specified"}
        </Typography>
      </Box>
    </Box>
  );
};

export default PropertyCardSuggestion;
