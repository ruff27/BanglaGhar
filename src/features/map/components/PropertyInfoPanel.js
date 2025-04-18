import React from "react";
import {
  Paper,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  CardMedia,
} from "@mui/material";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import DirectionsIcon from "@mui/icons-material/Directions";
import OpenInNewIcon from "@mui/icons-material/OpenInNew"; // Icon for View Details
import { useNavigate } from "react-router-dom";

// Helper to format price
const formatDisplayPrice = (price, mode) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${mode === "rent" ? "/mo" : ""}`;
};

/**
 * PropertyInfoPanel Component
 * Displays details of the selected property at the bottom of the map view.
 */
const PropertyInfoPanel = ({ selectedProperty }) => {
  const navigate = useNavigate();

  if (!selectedProperty) {
    return null; // Render nothing if no property is selected
  }

  // Construct image path
  const placeholderImg = `${process.env.PUBLIC_URL}/pictures/placeholder.png`;
  const imgSrc = selectedProperty.images?.[0]
    ? `${process.env.PUBLIC_URL}/pictures/${selectedProperty.images[0]}`
    : placeholderImg;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };

  // Navigate to the property details page or relevant properties page
  const navigateToPropertyPage = () => {
    const mode = selectedProperty.mode || "rent";
    // Option 1: Navigate to properties page and trigger dialog
    navigate(`/properties/${mode}?open=${selectedProperty._id}`);
    // Option 2: Navigate to dedicated details page
    // navigate(`/property/${selectedProperty._id}`);
  };

  // Function to open Google Maps directions
  const getDirections = () => {
    if (selectedProperty?.position?.lat && selectedProperty?.position?.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.position.lat},${selectedProperty.position.lng}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000, // Ensure it's above map tiles
        p: 2,
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.95)", // Slightly transparent background
        backdropFilter: "blur(5px)",
        borderTop: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3} md={2}>
          <CardMedia
            component="img"
            image={imgSrc}
            alt={selectedProperty.title}
            onError={handleImageError}
            sx={{
              height: 80,
              width: "100%",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={9} md={5}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            {selectedProperty.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {selectedProperty.location} •{" "}
            {formatDisplayPrice(selectedProperty.price, selectedProperty.mode)}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 2 },
              mt: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<BedIcon fontSize="small" />}
              label={`${selectedProperty.bedrooms} Beds`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<BathtubIcon fontSize="small" />}
              label={`${selectedProperty.bathrooms} Baths`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<SquareFootIcon fontSize="small" />}
              label={`${selectedProperty.area} ft²`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Grid>
        <Grid item xs={6} md={2.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DirectionsIcon />}
            onClick={getDirections}
            fullWidth
            sx={{ borderRadius: "8px", textTransform: "none", py: 1 }}
          >
            Directions
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
            View Details
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyInfoPanel;
