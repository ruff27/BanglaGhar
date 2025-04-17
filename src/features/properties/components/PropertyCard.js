import React from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  IconButton,
  Chip,
  Divider,
  alpha, // alpha is usually imported from @mui/material/styles or @mui/material
  useTheme, // Import useTheme hook
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HomeWorkIcon from "@mui/icons-material/HomeWork"; // Example icon

/**
 * PropertyCard Component
 *
 * Displays a single property listing in a card format.
 * Handles image display, basic details, wishlist toggle, and click to view details.
 */
const PropertyCard = ({
  property,
  isWishlisted,
  onWishlistToggle,
  onViewDetails,
}) => {
  const theme = useTheme(); // Get the theme object

  // Basic validation
  if (!property) {
    return null; // Or render a loading/error state
  }

  // Construct image path with placeholder and error handling
  const placeholderImg = `${process.env.PUBLIC_URL}/pictures/placeholder.png`;
  const imgSrc = property.images?.[0]
    ? `${process.env.PUBLIC_URL}/pictures/${property.images[0]}`
    : placeholderImg;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };

  // Price display logic (simplified example)
  const displayPrice = property.price
    ? `৳ ${property.price.toLocaleString()}${
        property.mode === "rent" ? "/mo" : ""
      }`
    : "Price N/A";

  // Prevent card click from triggering when wishlist button is clicked
  const handleWishlistClick = (event) => {
    event.stopPropagation(); // Stop event bubbling
    onWishlistToggle(); // Call the passed handler
  };

  // Determine chip background color using resolved theme values
  const chipBgColor =
    property.mode === "sold"
      ? theme.palette.grey[700] // Get actual grey color
      : theme.palette.primary.main; // Get actual primary color

  return (
    <Card
      sx={{
        borderRadius: "12px",
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
      {/* Use CardActionArea to make the main card clickable */}
      <CardActionArea
        onClick={onViewDetails}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ position: "relative", width: "100%" }}>
          <IconButton
            aria-label="add to favorites"
            onClick={handleWishlistClick}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: alpha("#ffffff", 0.7), // alpha() works fine with direct hex/rgb
              "&:hover": { bgcolor: alpha("#ffffff", 0.9) },
              color: isWishlisted ? "error.main" : "action.active",
            }}
          >
            {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <CardMedia
            component="img"
            height="200"
            image={imgSrc}
            alt={property.title || "Property image"}
            onError={handleImageError}
            sx={{ objectFit: "cover" }}
          />
          {/* Optional: Property Status Label */}
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
                // Apply alpha() to the resolved color string
                bgcolor: alpha(chipBgColor, 0.85),
                color: "white", // Ensure text is readable
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
      </CardActionArea>
    </Card>
  );
};

export default PropertyCard;
