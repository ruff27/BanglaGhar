import React from "react";
import { Grid, TextField, Typography, Box } from "@mui/material";

const Step2_Location = ({ formData, errors, handleChange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Location Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="address"
            name="address"
            label="Street Address"
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
            label="City"
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
            label="State / Division" // Or just 'District' / 'Area'
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
