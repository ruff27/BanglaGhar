import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Grid,
  CardMedia,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import PhoneIcon from "@mui/icons-material/Phone"; // Example contact icon
import EmailIcon from "@mui/icons-material/Email"; // Example contact icon
import HomeWorkIcon from "@mui/icons-material/HomeWork"; // <-- Added missing import

// Helper to format price (similar to one potentially in PropertyCard)
const formatDisplayPrice = (price, mode) => {
  if (price === null || price === undefined) return "N/A"; // Handle null/undefined
  // Ensure price is a number for toLocaleString
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${mode === "rent" ? "/mo" : ""}`;
};

/**
 * PropertyDetailsDialog Component
 * Renders a dialog displaying detailed information about a selected property.
 */
const PropertyDetailsDialog = ({ open, onClose, property, mode }) => {
  if (!property) {
    return null; // Don't render if no property is selected
  }

  // Construct image path with placeholder
  const placeholderImg = `${process.env.PUBLIC_URL}/pictures/placeholder.png`;
  const imgSrc = property.images?.[0]
    ? `${process.env.PUBLIC_URL}/pictures/${property.images[0]}`
    : placeholderImg;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md" // Adjust max width as needed
      fullWidth
      scroll="body" // Allow content scroll
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        {property.title || "Property Details"}
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {" "}
        {/* Remove padding and add dividers */}
        <CardMedia
          component="img"
          height="300" // Adjust height
          image={imgSrc}
          alt={property.title || "Property image"}
          onError={handleImageError}
          sx={{ objectFit: "cover", width: "100%" }}
        />
        <Box sx={{ p: 3 }}>
          {" "}
          {/* Add padding back inside */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <Typography
                variant="h5"
                component="div"
                fontWeight="600"
                gutterBottom
              >
                {property.title}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                  mb: 1,
                }}
              >
                <LocationOnIcon
                  sx={{ fontSize: "1.1rem", mr: 0.5, color: "primary.main" }}
                />
                <Typography variant="body1">{property.location}</Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              <Typography variant="h5" color="primary.main" fontWeight="700">
                {formatDisplayPrice(property.price, property.mode)}
              </Typography>
              <Chip
                label={
                  property.mode?.charAt(0).toUpperCase() +
                  property.mode?.slice(1)
                }
                size="small"
                color={property.mode === "sold" ? "default" : "primary"}
                variant="filled"
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BedIcon color="action" />
                <Typography variant="body1">
                  {property.bedrooms ?? "?"} Beds
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BathtubIcon color="action" />
                <Typography variant="body1">
                  {property.bathrooms ?? "?"} Baths
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SquareFootIcon color="action" />
                <Typography variant="body1">
                  {property.area ?? "?"} sqft
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HomeWorkIcon color="action" /> {/* Now imported */}
                <Typography variant="body1">
                  {property.propertyType?.charAt(0).toUpperCase() +
                    property.propertyType?.slice(1) || "N/A"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}
          >
            {property.description || "No description available."}
          </Typography>
          {/* Add Features/Amenities section if available in property data */}
          {/* Example:
                    {property.features && Object.values(property.features).some(v => v) && ( // Check if any feature is true
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>Features</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {Object.entries(property.features).map(([key, value]) => value && (
                                    <Chip key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} size="small" variant="outlined" /> // Format key nicely
                                ))}
                            </Box>
                        </>
                    )} */}
          <Divider sx={{ my: 2 }} />
          {/* Example Contact Section - Replace with actual contact info or button */}
          <Typography variant="h6" gutterBottom>
            Contact Agent
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button variant="contained" startIcon={<PhoneIcon />}>
              Call Now
            </Button>
            <Button variant="outlined" startIcon={<EmailIcon />}>
              Send Email
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {/* Optionally add other actions like 'Save to Wishlist' if needed */}
      </DialogActions>
    </Dialog>
  );
};

export default PropertyDetailsDialog;
