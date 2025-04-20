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
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Helper to format price
const formatDisplayPrice = (price, mode) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${mode === "rent" ? "/mo" : ""}`;
};

/**
 * PropertyDetailsDialog Component
 */
const PropertyDetailsDialog = ({ open, onClose, property, mode }) => {
  const { t } = useTranslation(); // Initialize translation

  if (!property) {
    return null;
  }

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
      maxWidth="md"
      fullWidth
      scroll="body"
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
        {/* Using property_details key for title */}
        {property.title || t("property_details")}
        <IconButton aria-label={t("close")} onClick={onClose}>
          {" "}
          {/* Using close key for aria-label */}
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <CardMedia
          component="img"
          height="300"
          image={imgSrc}
          alt={property.title || "Property image"}
          onError={handleImageError}
          sx={{ objectFit: "cover", width: "100%" }}
        />
        <Box sx={{ p: 3 }}>
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
                  property.mode
                    ? t(
                        property.mode === "buy"
                          ? "buy"
                          : property.mode === "rent"
                          ? "rent"
                          : "sold"
                      )
                    : ""
                } // Translate mode
                size="small"
                color={property.mode === "sold" ? "default" : "primary"}
                variant="filled"
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Details {/* <-- Kept as is, no key */}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BedIcon color="action" />
                <Typography variant="body1">
                  {/* Applied translation */}
                  {property.bedrooms ?? "?"} {t("beds")}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BathtubIcon color="action" />
                <Typography variant="body1">
                  {/* Applied translation */}
                  {property.bathrooms ?? "?"} {t("baths")}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SquareFootIcon color="action" />
                <Typography variant="body1">
                  {property.area ?? "?"} sqft {/* <-- Keep unit */}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HomeWorkIcon color="action" />
                <Typography variant="body1">
                  {/* Translate property type if key exists */}
                  {property.propertyType ? t(property.propertyType) : "N/A"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t("description")} {/* Applied translation */}
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}
          >
            {property.description || "No description available."}{" "}
            {/* <-- Kept as is */}
          </Typography>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            {/* Applied translation */}
            {t("contact_advertiser")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button variant="contained" startIcon={<PhoneIcon />}>
              Call Now {/* <-- Kept as is */}
            </Button>
            <Button variant="outlined" startIcon={<EmailIcon />}>
              Send Email {/* <-- Kept as is */}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t("close")} {/* Applied translation */}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyDetailsDialog;
