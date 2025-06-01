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
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import WishlistButton from "./WishlistButton";

const PropertyCard = ({ property, isWishlisted, onWishlistToggle }) => {
  const theme = useTheme();

  if (!property || typeof property !== "object" || !property._id) {
    console.warn("PropertyCard received invalid property data:", property);
    return null;
  }

  const placeholderImg = `/pictures/placeholder.png`;

  // --- CORRECTED IMAGE SOURCE LOGIC ---
  let imgSrc = placeholderImg;

  if (Array.isArray(property.images) && property.images.length > 0) {
    const firstImage = property.images[0];
    
    if (
      firstImage &&
      (firstImage.startsWith("http://") || firstImage.startsWith("https://"))
    ) {
      imgSrc = firstImage; 
    }
  }
  // --- END CORRECTION ---

  const handleImageError = (e) => {
    console.error(
      "Error loading image, falling back to placeholder. Failed URL:",
      e.target.currentSrc || e.target.src
    );
    e.target.onerror = null; 
    e.target.src = placeholderImg;
  };

  const displayPrice =
    property.price !== null && property.price !== undefined
      ? `৳ ${Number(property.price).toLocaleString()}${
          property.listingType === "rent" ? "/mo" : ""
        }`
      : "Price N/A";

  let statusChipColor = "default";
  let statusChipIcon = <HelpOutlineIcon />;
  let statusLabel = property.listingStatus
    ? property.listingStatus.charAt(0).toUpperCase() +
      property.listingStatus.slice(1)
    : "Unknown";

  switch (property.listingStatus) {
    case "available":
      statusChipColor = "success";
      statusChipIcon = <CheckCircleIcon />;
      statusLabel = "Available";
      break;
    case "sold":
      statusChipColor = "error";
      statusChipIcon = <RemoveShoppingCartIcon />;
      statusLabel = "Sold";
      break;
    case "rented":
      statusChipColor = "warning";
      statusChipIcon = <EventBusyIcon />;
      statusLabel = "Rented";
      break;
    case "unavailable":
      statusChipColor = "default";
      statusChipIcon = <HelpOutlineIcon />;
      statusLabel = "Unavailable";
      break;
    default:
      statusChipColor = "default";
      statusChipIcon = <HelpOutlineIcon />;
  }

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
    <RouterLink
      to={detailUrl}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
    >
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
        <Box sx={{ position: "relative", width: "100%" }}>
          {onWishlistToggle && (
            <WishlistButton
              isWishlisted={isWishlisted}
              onClick={onWishlistToggle}
              sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
            />
          )}
          <CardMedia
            component="img"
            image={imgSrc} 
            alt={property.title || "Property image"}
            onError={handleImageError}
            sx={{
              objectFit: "cover",
              aspectRatio: "16/9",
              width: "100%",
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
                bgcolor: alpha(
                  property.listingType === "sold"
                    ? theme.palette.grey[700]
                    : theme.palette.primary.main,
                  0.85
                ),
                color: "white",
                fontWeight: 500,
                borderRadius: "4px",
                backdropFilter: "blur(2px)",
              }}
            />
          )}

          {property.listingStatus && property.listingStatus !== "available" && (
            <Chip
              icon={statusChipIcon}
              label={statusLabel}
              size="small"
              color={statusChipColor}
              variant="filled"
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                zIndex: 1,
                color:
                  statusChipColor === "default"
                    ? theme.palette.text.primary
                    : "white",
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
            p: 2,
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
            <Typography variant="body2" noWrap title={locationString}>
              {locationString}
            </Typography>
          </Box>

          {!isLandOrCommercial ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 2,
                color: "text.secondary",
                alignItems: "center",
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

          <Box sx={{ flexGrow: 1 }} />

          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
