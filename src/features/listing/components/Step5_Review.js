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

// Helper to format price
const formatDisplayPrice = (price, mode) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${mode === "rent" ? "/mo" : ""}`;
};

/**
 * Step5_Review Component
 * Displays a summary of the entered property details for final review.
 */
const Step5_Review = ({ formData, features, images }) => {
  // Generate image previews (similar logic to Step4, but maybe just show filenames or count)
  const imageNames = images.map(
    (img) => img.name || (typeof img === "string" ? img : "Uploaded Image")
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Listing
      </Typography>
      <Paper
        elevation={0}
        sx={{ p: 3, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 2 }}
      >
        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Info
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary="Title"
                  secondary={formData.title || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Property Type"
                  secondary={formData.propertyType || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Listing Type"
                  secondary={formData.listingType || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Price"
                  secondary={formatDisplayPrice(
                    formData.price,
                    formData.listingType
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Area (sqft)"
                  secondary={formData.area || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Bedrooms"
                  secondary={formData.bedrooms || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Bathrooms"
                  secondary={formData.bathrooms || "-"}
                />
              </ListItem>
            </List>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary="Address"
                  secondary={formData.address || "-"}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="City" secondary={formData.city || "-"} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="State/Division"
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
              Description
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}
            >
              {formData.description || "No description provided."}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Features */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            <List dense disablePadding>
              {Object.entries(features).map(
                ([key, value]) =>
                  value && (
                    <ListItem key={key} disableGutters>
                      <ListItemText
                        primary={key.replace(/([A-Z])/g, " $1").trim()}
                      />{" "}
                      {/* Format key */}
                    </ListItem>
                  )
              )}
              {!Object.values(features).some((v) => v) && (
                <ListItem disableGutters>
                  <ListItemText secondary="No features selected." />
                </ListItem>
              )}
            </List>
          </Grid>

          {/* Images Preview/List */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Images ({imageNames.length})
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
                No images uploaded.
              </Typography>
            )}
            {/* Optionally show small image thumbnails here instead of names */}
          </Grid>
        </Grid>
      </Paper>
      <Typography
        variant="caption"
        display="block"
        sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
      >
        Please review all details carefully before submitting.
      </Typography>
    </Box>
  );
};

export default Step5_Review;
