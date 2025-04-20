// src/features/Properties/components/PropertyCard.js
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import WishlistButton from "./WishlistButton";

/**
 * PropertyCard Component - Updated for new address structure
 */
const PropertyCard = ({ property, isWishlisted, onWishlistToggle }) => {
  const theme = useTheme();

  // Add more robust checking
  if (!property || typeof property !== "object" || !property._id) {
    console.warn("PropertyCard received invalid property data:", property);
    return null;
  }

  const placeholderImg = `/pictures/placeholder.png`; // Ensure this path is correct relative to your public folder
  // Check if images array exists and has content
  const imgSrc =
    Array.isArray(property.images) && property.images.length > 0
      ? `/pictures/${property.images[0]}` // Assuming image names are stored directly
      : placeholderImg;

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop if placeholder fails
    e.target.src = placeholderImg;
  };

  const displayPrice =
    property.price !== null && property.price !== undefined
      ? `৳ ${Number(property.price).toLocaleString()}${
          property.listingType === "rent" ? "/mo" : ""
        }` // Use listingType
      : "Price N/A";

  // Use listingType for chip logic
  const chipBgColor =
    property.listingType === "sold"
      ? theme.palette.grey[700]
      : theme.palette.primary.main;

  // Construct location string from new fields
  const locationString =
    [
      property.addressLine1,
      property.upazila,
      property.cityTown, // Or district? Choose the most relevant parts for a short display
      property.district,
    ]
      .filter(Boolean) // Remove empty/null parts
      .join(", ") || "Location N/A"; // Fallback

  const detailUrl = `/properties/details/${property._id}`;
  const isLandOrCommercial =
    property.propertyType === "land" || property.propertyType === "commercial";

  return (
    <RouterLink
      to={detailUrl}
      style={{ textDecoration: "none", height: "100%" }}
    >
      <Card
        sx={{
          /* Existing styles... */ borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.06)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          border: "1px solid rgba(43, 123, 140, 0.08)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 12px 25px rgba(43, 123, 140, 0.12)",
          },
        }}
      >
        <Box sx={{ position: "relative", width: "100%" }}>
          <WishlistButton
            isWishlisted={isWishlisted}
            onClick={onWishlistToggle}
            sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
          />
          <CardMedia
            component="img"
            height="200"
            image={imgSrc}
            alt={property.title || "Property image"}
            onError={handleImageError}
            sx={{ objectFit: "cover" }}
          />
          {/* Use listingType */}
          {property.listingType && (
            <Chip
              label={
                property.listingType.charAt(0).toUpperCase() +
                property.listingType.slice(1)
              }
              size="small"
              sx={{
                /* Existing styles... */ position: "absolute",
                top: 8,
                left: 8,
                zIndex: 1,
                bgcolor: alpha(chipBgColor, 0.85),
                color: "white",
                fontWeight: 500,
                borderRadius: "4px",
                backdropFilter: "blur(2px)",
              }}
            />
          )}
        </Box>

        <CardContent
          sx={{
            /* Existing styles... */ flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, mb: 1, fontSize: "1.1rem" }}
            noWrap
          >
            {property.title || "Untitled Property"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              color: "text.secondary",
            }}
          >
            <LocationOnIcon
              sx={{ fontSize: "1rem", mr: 0.5, color: "primary.main" }}
            />
            {/* Use constructed locationString */}
            <Typography variant="body2" noWrap title={locationString}>
              {locationString}
            </Typography>
          </Box>

          {/* Features - Conditionally render based on type */}
          {!isLandOrCommercial ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
                color: "text.secondary",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BedIcon sx={{ fontSize: "1.1rem", color: "primary.light" }} />
                <Typography variant="body2">
                  {property.bedrooms ?? "?"} Beds
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BathtubIcon
                  sx={{ fontSize: "1.1rem", color: "primary.light" }}
                />
                <Typography variant="body2">
                  {property.bathrooms ?? "?"} Baths
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SquareFootIcon
                  sx={{ fontSize: "1.1rem", color: "primary.light" }}
                />
                <Typography variant="body2">
                  {property.area ?? "?"} sqft
                </Typography>
              </Box>
            </Box>
          ) : (
            // Display Area prominently for Land/Commercial
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 2,
                color: "text.secondary",
              }}
            >
              <SquareFootIcon
                sx={{ fontSize: "1.1rem", color: "primary.light" }}
              />
              <Typography variant="body2">
                Area: {property.area ?? "?"} sqft
              </Typography>
              {/* Add other relevant info for Land/Commercial if available */}
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          {/* Price and Type */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "auto",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              {displayPrice}
            </Typography>
            {property.propertyType && (
              <Chip
                icon={<HomeWorkIcon />}
                label={
                  property.propertyType.charAt(0).toUpperCase() +
                  property.propertyType.slice(1)
                }
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </RouterLink>
  );
};

export default PropertyCard;
