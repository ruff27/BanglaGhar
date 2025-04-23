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
import WishlistButton from "./WishlistButton"; // Ensure this path is correct

const PropertyCard = ({ property, isWishlisted, onWishlistToggle }) => {
  const theme = useTheme();

  if (!property || typeof property !== "object" || !property._id) {
    console.warn("PropertyCard received invalid property data:", property);
    return null;
  }

  const placeholderImg = `/pictures/placeholder.png`;
  const imgSrc =
    Array.isArray(property.images) && property.images.length > 0
      ? `/pictures/${property.images[0]}`
      : placeholderImg;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };

  const displayPrice =
    property.price !== null && property.price !== undefined
      ? `৳ ${Number(property.price).toLocaleString()}${
          property.listingType === "rent" ? "/mo" : ""
        }`
      : "Price N/A";

  const chipBgColor =
    property.listingType === "sold"
      ? theme.palette.grey[700]
      : theme.palette.primary.main;

  const locationString =
    [
      property.addressLine1,
      property.upazila,
      property.cityTown,
      property.district,
    ]
      .filter(Boolean)
      .join(", ") || "Location N/A";

  const detailUrl = `/properties/details/${property._id}`;
  const isLandOrCommercial =
    property.propertyType === "land" || property.propertyType === "commercial";

  return (
    // Wrap with RouterLink first
    // --- Ensure Link fills the Grid Item ---
    <RouterLink
      to={detailUrl}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
    >
      <Card
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.06)",
          // --- Ensure Card fills the Link wrapper ---
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
          {/* Render WishlistButton only if onWishlistToggle is provided */}
          {onWishlistToggle && (
            <WishlistButton
              isWishlisted={isWishlisted}
              // --- CORRECTED onClick ---
              // Simply call onWishlistToggle. preventDefault/stopPropagation are handled inside WishlistButton.
              onClick={onWishlistToggle}
              // --- END CORRECTION ---
              sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
            />
          )}
          {/* --- Use Aspect Ratio for Image --- */}
          <CardMedia
            component="img"
            image={imgSrc}
            alt={property.title || "Property image"}
            onError={handleImageError}
            sx={{
              objectFit: "cover",
              aspectRatio: "16/9", // Common ratio, adjust e.g., '3/2', '4/3' if needed
              width: "100%", // Ensure it takes full width
            }}
          />
          {property.listingType && (
            <Chip
              label={
                property.listingType.charAt(0).toUpperCase() +
                property.listingType.slice(1)
              }
              size="small"
              sx={{
                position: "absolute",
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
            flexGrow: 1, // Allows content to expand vertically
            display: "flex",
            flexDirection: "column",
            width: "100%",
            p: 2, // Ensure consistent padding
          }}
        >
          {/* Top details */}
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
            <Typography variant="body2" noWrap title={locationString}>
              {locationString}
            </Typography>
          </Box>

          {/* Middle features */}
          {!isLandOrCommercial ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between", // Distribute space
                flexWrap: "wrap", // Allow wrapping on narrow cards
                gap: 1.5, // Space between items
                mb: 2,
                color: "text.secondary",
                alignItems: "center",
              }}
            >
              {/* Bed */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BedIcon sx={{ fontSize: "1.1rem", color: "primary.light" }} />
                <Typography variant="body2">
                  {property.bedrooms ?? "?"} Beds
                </Typography>
              </Box>
              {/* Bath */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BathtubIcon
                  sx={{ fontSize: "1.1rem", color: "primary.light" }}
                />
                <Typography variant="body2">
                  {property.bathrooms ?? "?"} Baths
                </Typography>
              </Box>
              {/* Area */}
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
            // Area for Land/Commercial
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
            </Box>
          )}

          {/* --- Spacer pushes content below it to the bottom --- */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Bottom divider and price/type */}
          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // mt: "auto", // REMOVED - using spacer box now
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
