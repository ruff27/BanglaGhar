import React from "react";
import { Grid, TextField, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next"; // Import useTranslation

const Step2_Location = ({ formData, errors, handleChange }) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Location Details {/* <-- Kept as is, no key found */}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="address"
            name="address"
            label={t("address")} // Applied translation
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="city"
            name="city"
            label={t("city")} // Applied translation
            fullWidth
            variant="outlined"
            value={formData.city}
            onChange={handleChange}
            error={!!errors.city}
            helperText={errors.city}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="state"
            name="state"
            label={t("state")} // Applied translation
            fullWidth
            variant="outlined"
            value={formData.state}
            onChange={handleChange}
            error={!!errors.state}
            helperText={errors.state}
          />
          {/* Consider using a Select dropdown if states/divisions are predefined */}
        </Grid>
        {/* Add Map integration here later if desired */}
      </Grid>
    </Box>
  );
};

export default Step2_Location;
