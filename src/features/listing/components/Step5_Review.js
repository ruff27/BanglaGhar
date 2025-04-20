import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardMedia,
} from "@mui/material";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Helper to format price
const formatDisplayPrice = (price, mode) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  // Keep suffix hardcoded for now as it's not in translation files
  return `৳ ${numericPrice.toLocaleString()}${mode === "rent" ? "/mo" : ""}`;
};

// Mapping from feature state keys to translation keys
const featureTranslationMap = {
  parking: "parking",
  garden: "garden",
  airConditioning: "air_conditioning",
  furnished: "furnished",
  pool: "swimming_pool",
  // Add other features if needed
};

/**
 * Step5_Review Component
 */
const Step5_Review = ({ formData, features, images }) => {
  const { t } = useTranslation(); // Initialize translation
  const imageNames = images.map(
    (img) => img.name || (typeof img === "string" ? img : "Uploaded Image") // <-- Kept as is
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("preview")} {/* Applied translation */}
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: 3, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 2 }}
      >
        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Info {/* <-- Kept as is */}
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("property_title")} // Applied translation
                  secondary={formData.title || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("property_type")} // Applied translation
                  secondary={
                    formData.propertyType ? t(formData.propertyType) : "-"
                  } // Translate type value
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("listing_type")} // Applied translation
                  secondary={
                    formData.listingType
                      ? t(formData.listingType === "buy" ? "buy" : "rent")
                      : "-"
                  } // Translate type value
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("price")} // Applied translation
                  secondary={formatDisplayPrice(
                    formData.price,
                    formData.listingType
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("area")} // Applied translation
                  secondary={formData.area ? `${formData.area} sqft` : "-"} // Keep sqft suffix
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("bedrooms")} // Applied translation
                  secondary={formData.bedrooms || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("bathrooms")} // Applied translation
                  secondary={formData.bathrooms || "-"}
                />
              </ListItem>
            </List>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Location {/* <-- Kept as is */}
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("address")} // Applied translation
                  secondary={formData.address || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("city")}
                  secondary={formData.city || "-"}
                />{" "}
                {/* Applied translation */}
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("state")} // Applied translation
                  secondary={formData.state || "-"}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t("description")} {/* Applied translation */}
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}
            >
              {formData.description || "No description provided."}{" "}
              {/* <-- Kept as is */}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Features */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {t("features")} {/* Applied translation */}
            </Typography>
            <List dense disablePadding>
              {Object.entries(features)
                .filter(([key, value]) => value && featureTranslationMap[key]) // Filter for true and translatable features
                .map(([key, value]) => (
                  <ListItem key={key} disableGutters>
                    {/* Use mapping to get correct translation key */}
                    <ListItemText primary={t(featureTranslationMap[key])} />
                  </ListItem>
                ))}
              {!Object.values(features).some((v) => v) && (
                <ListItem disableGutters>
                  <ListItemText secondary="No features selected." />{" "}
                  {/* <-- Kept as is */}
                </ListItem>
              )}
            </List>
          </Grid>

          {/* Images Preview/List */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Images ({imageNames.length}) {/* <-- Kept as is */}
            </Typography>
            {imageNames.length > 0 ? (
              <List dense disablePadding>
                {imageNames.map((name, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemText secondary={name} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No images uploaded. {/* <-- Kept as is */}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Typography
        variant="caption"
        display="block"
        sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
      >
        Please review all details carefully before submitting.{" "}
        {/* <-- Kept as is */}
      </Typography>
    </Box>
  );
};

export default Step5_Review;
