import React from "react";
import {
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  FormGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next"; // Import useTranslation

const Step3_Features = ({ features, handleFeatureChange }) => {
  const { t } = useTranslation(); // Initialize translation

  // Define feature list with keys matching state and translation keys
  const featureList = [
    { key: "parking", labelKey: "parking" },
    { key: "garden", labelKey: "garden" },
    { key: "airConditioning", labelKey: "air_conditioning" }, // Note the key difference
    { key: "furnished", labelKey: "furnished" },
    { key: "pool", labelKey: "swimming_pool" }, // Note the key difference
    // Add more features here if they exist in state and have translation keys
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("features")} {/* Applied translation */}
      </Typography>
      <FormGroup>
        <Grid container spacing={1}>
          {featureList.map((feature) => (
            <Grid item xs={12} sm={6} key={feature.key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={features[feature.key] || false} // Ensure checked is boolean
                    onChange={handleFeatureChange}
                    name={feature.key}
                  />
                }
                label={t(feature.labelKey)} // Apply translation using mapped key
              />
            </Grid>
          ))}
          {/* Example for a feature without a direct key (if needed later)
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={ <Checkbox checked={features.balcony} onChange={handleFeatureChange} name="balcony" /> }
              label="Balcony" // Kept as is if no key 'balcony'
            />
          </Grid>
          */}
        </Grid>
      </FormGroup>
    </Box>
  );
};

export default Step3_Features;
