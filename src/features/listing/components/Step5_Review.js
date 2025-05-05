// src/features/ListPropertyPage/components/Step5_Review.js (Acts as Step 6: Review)
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
  Chip, // Added for displaying tags/features
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Helper to format price (keep as is or enhance)
const formatDisplayPrice = (price, mode) => {
  if (!price) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${mode === "rent" ? "/mo" : ""}`;
};

// Helper to display boolean/string values nicely
const formatValue = (value, t) => {
  if (value === true || value === "yes") return t("yes", "Yes");
  if (value === false || value === "no") return t("no", "No");
  if (typeof value === "string" && value) return value;
  if (Array.isArray(value) && value.length > 0) return value.join(", ");
  return value || "-"; // Handle null, undefined, empty string
};

/**
 * Step5_Review Component - Updated for new structure (Acts as final review step)
 */
const Step5_Review = ({ formData, features, images }) => {
  const { t } = useTranslation();
  const bdDetails = formData.bangladeshDetails || {};
  const imageNames = images.map(
    (img) =>
      img.name ||
      (typeof img === "string" ? img : t("uploaded_image", "Uploaded Image"))
  );

  const isLandOrCommercial =
    formData.propertyType === "land" || formData.propertyType === "commercial";

  // Mapping for standard features (from Step 2)
  const standardFeatureList = [
    { key: "parking", labelKey: "parking" },
    { key: "garden", labelKey: "garden" },
    { key: "airConditioning", labelKey: "air_conditioning" },
    { key: "pool", labelKey: "swimming_pool" },
    // Add others included in Step3_Features checkboxes
  ];

  return (
    <Box>
      {/* <Typography variant="h6" gutterBottom>
        {t("step_review", "Review Your Listing")}
      </Typography> */}
      <Paper
        elevation={0}
        sx={{ p: 3, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 2 }}
      >
        <Grid container spacing={3} rowSpacing={2}>
          {/* --- Section 1: Basic Info & Location --- */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              {t("basic_info", "Basic Info")}
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("property_title")}
                  secondary={formatValue(formData.title, t)}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("property_type")}
                  secondary={formatValue(
                    t(formData.propertyType, formData.propertyType),
                    t
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("listing_type")}
                  secondary={formatValue(
                    t(formData.listingType, formData.listingType),
                    t
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("price")}
                  secondary={formatDisplayPrice(
                    formData.price,
                    formData.listingType
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("area_sqft", "Area (sqft)")}
                  secondary={
                    formatValue(formData.area, t) ||
                    t("not_provided", "Not Provided")
                  }
                />
              </ListItem>
              {!isLandOrCommercial && (
                <>
                  <ListItem disableGutters>
                    <ListItemText
                      primary={t("bedrooms")}
                      secondary={formatValue(formData.bedrooms, t)}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText
                      primary={t("bathrooms")}
                      secondary={formatValue(formData.bathrooms, t)}
                    />
                  </ListItem>
                </>
              )}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              {t("location", "Location")}
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("address_line_1")}
                  secondary={formatValue(formData.addressLine1, t)}
                />
              </ListItem>
              {formData.addressLine2 && (
                <ListItem disableGutters>
                  <ListItemText
                    primary={t("address_line_2")}
                    secondary={formatValue(formData.addressLine2, t)}
                  />
                </ListItem>
              )}
              <ListItem disableGutters>
                <ListItemText
                  primary={t("city_town")}
                  secondary={formatValue(formData.cityTown, t)}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("upazila_thana")}
                  secondary={formatValue(formData.upazila, t)}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("district")}
                  secondary={formatValue(formData.district, t)}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("postal_code")}
                  secondary={formatValue(formData.postalCode, t)}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* --- Section 2: Features & Specifics --- */}
          {/* Standard Features (only if applicable) */}
          {!isLandOrCommercial && (
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                {t("features", "Standard Features")}
              </Typography>
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemText
                    primary={t("furnished", "Furnished Status")}
                    secondary={formatValue(
                      t(
                        `furnished_${features.furnished || "no"}`,
                        features.furnished || "no"
                      ),
                      t
                    )}
                  />
                </ListItem>
                {standardFeatureList.map(
                  (f) =>
                    features[f.key] && (
                      <ListItem key={f.key} disableGutters>
                        <ListItemText primary={t(f.labelKey, f.key)} />
                      </ListItem>
                    )
                )}
                {/* Check if any standard feature is true */}
                {!Object.values(features).some(
                  (v) => v === true || (typeof v === "string" && v !== "no")
                ) && (
                  <ListItem disableGutters>
                    <ListItemText
                      secondary={t(
                        "no_features_selected",
                        "No standard features selected."
                      )}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          )}

          {/* Specific Bangladesh Details */}
          <Grid item xs={12} md={isLandOrCommercial ? 12 : 6}>
            {" "}
            {/* Take full width if features are hidden */}
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              {t("specific_details", "Specific Details")}
            </Typography>
            <List dense disablePadding>
              {/* Display key BD details - add more as needed */}
              <ListItem disableGutters>
                <ListItemText
                  primary={t("property_condition")}
                  secondary={formatValue(
                    t(
                      `condition_${bdDetails.propertyCondition}`,
                      bdDetails.propertyCondition
                    ),
                    t
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("water_source")}
                  secondary={formatValue(
                    t(`water_${bdDetails.waterSource}`, bdDetails.waterSource),
                    t
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("gas_source")}
                  secondary={formatValue(
                    t(`gas_${bdDetails.gasSource}`, bdDetails.gasSource),
                    t
                  )}
                />
              </ListItem>
              {bdDetails.gasSource === "piped" && (
                <ListItem disableGutters>
                  <ListItemText
                    primary={t("gas_line_installed")}
                    secondary={formatValue(bdDetails.gasLineInstalled, t)}
                  />
                </ListItem>
              )}
              <ListItem disableGutters>
                <ListItemText
                  primary={t("backup_power")}
                  secondary={formatValue(
                    t(`power_${bdDetails.backupPower}`, bdDetails.backupPower),
                    t
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("parking_type")}
                  secondary={formatValue(
                    t(
                      `parking_${bdDetails.parkingType}`,
                      bdDetails.parkingType
                    ),
                    t
                  )}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary={t("security_features")}
                  secondary={
                    formatValue(
                      bdDetails.securityFeatures?.map((f) =>
                        t(`security_${f}`, f)
                      ),
                      t
                    ) || t("none", "None")
                  }
                />
              </ListItem>
              {/* Add more key details here */}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* --- Section 3: Description & Images --- */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              {t("description", "Description")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                color: "text.secondary",
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {formatValue(formData.description, t) ||
                t("no_description_provided", "No description provided.")}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              {t("images", "Images")} ({imageNames.length})
            </Typography>
            {imageNames.length > 0 ? (
              <List
                dense
                disablePadding
                sx={{ maxHeight: 200, overflowY: "auto" }}
              >
                {imageNames.map((name, index) => (
                  <ListItem key={index} disableGutters sx={{ pb: 0 }}>
                    <ListItemText
                      secondary={`${index + 1}. ${name}`}
                      sx={{ m: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("no_images_uploaded", "No images uploaded.")}
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
        {t(
          "review_prompt",
          "Please review all details carefully before submitting."
        )}
      </Typography>
    </Box>
  );
};

export default Step5_Review;
