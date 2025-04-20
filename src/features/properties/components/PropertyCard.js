import React from "react";
import { Link as RouterLink } from "react-router-dom"; // Import RouterLink
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  // CardActionArea removed - we'll use Link now
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
import WishlistButton from "./WishlistButton"; // Keep WishlistButton

/**
 * PropertyCard Component
 * Displays a single property listing card that links to the detail page.
 */
const PropertyCard = ({
  property,
  isWishlisted,
  onWishlistToggle,
  // onViewDetails prop is removed
}) => {
  const theme = useTheme();

  if (!property || !property._id) {
    console.warn("PropertyCard received invalid property data:", property);
    return null;
  }

  const placeholderImg = `/pictures/placeholder.png`;
  const imgSrc = property.images?.[0]
    ? `/pictures/${property.images[0]}`
    : placeholderImg;
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };

  const displayPrice = property.price
    ? `৳ ${property.price.toLocaleString()}${
        property.mode === "rent" ? "/mo" : ""
      }`
    : "Price N/A";

  const chipBgColor =
    property.mode === "sold"
      ? theme.palette.grey[700]
      : theme.palette.primary.main;

  // *** Define the detail page URL ***
  const detailUrl = `/properties/details/${property._id}`;

  return (
    // *** Wrap the entire Card in RouterLink ***
    <RouterLink
      to={detailUrl}
      style={{ textDecoration: "none", height: "100%" }}
    >
      <Card
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.06)",
          height: "100%", // Ensure card takes full height of link wrapper
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
        {/* Removed CardActionArea */}
        <Box sx={{ position: "relative", width: "100%" }}>
          {/* Keep WishlistButton - its onClick stops propagation */}
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
          {property.mode && (
            <Chip
              label={
                property.mode.charAt(0).toUpperCase() + property.mode.slice(1)
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
            flexGrow: 1,
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
            <Typography variant="body2" noWrap>
              {property.location || "Location N/A"}
            </Typography>
          </Box>
          {/* Features */}
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
        {/* Removed CardActionArea */}
      </Card>
    </RouterLink>
  );
};

export default PropertyCard;
