import React from "react";
import {
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  FormGroup,
} from "@mui/material";

const Step3_Features = ({ features, handleFeatureChange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Features & Amenities
      </Typography>
      <FormGroup>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={features.parking}
                  onChange={handleFeatureChange}
                  name="parking"
                />
              }
              label="Parking Available"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={features.garden}
                  onChange={handleFeatureChange}
                  name="garden"
                />
              }
              label="Garden / Outdoor Space"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={features.airConditioning}
                  onChange={handleFeatureChange}
                  name="airConditioning"
                />
              }
              label="Air Conditioning"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={features.furnished}
                  onChange={handleFeatureChange}
                  name="furnished"
                />
              }
              label="Furnished"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={features.pool}
                  onChange={handleFeatureChange}
                  name="pool"
                />
              }
              label="Swimming Pool"
            />
          </Grid>
          {/* Add more features as needed */}
        </Grid>
      </FormGroup>
    </Box>
  );
};

export default Step3_Features;
