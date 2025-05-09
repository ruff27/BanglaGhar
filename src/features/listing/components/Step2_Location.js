import React from "react";
import { Grid, TextField, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const Step2_Location = ({ formData, errors, handleChange }) => {
  const { t } = useTranslation();

  return (
    <Box>
      {/* <Typography variant="h6" gutterBottom>
        {t("step_location", "Location Details")}
      </Typography> */}
      <Grid container spacing={3}>
        {/* Address Line 1 (House/Road/Village/Area) */}
        <Grid item xs={12}>
          <TextField
            required
            id="addressLine1"
            name="addressLine1"
            label={t(
              "address_line_1",
              "Address Line 1 (House/Road/Village/Area)"
            )}
            fullWidth
            variant="outlined"
            value={formData.addressLine1}
            onChange={handleChange}
            error={!!errors.addressLine1}
            helperText={
              errors.addressLine1 ||
              t(
                "address_l1_helper",
                "e.g., House 12, Road 5, Block C OR Vill: Rampur"
              )
            }
          />
        </Grid>

        {/* Address Line 2 (Optional) */}
        <Grid item xs={12}>
          <TextField
            id="addressLine2"
            name="addressLine2"
            label={t("address_line_2", "Address Line 2 (Optional)")}
            fullWidth
            variant="outlined"
            value={formData.addressLine2}
            onChange={handleChange}
            error={!!errors.addressLine2}
            helperText={
              errors.addressLine2 ||
              t(
                "address_l2_helper",
                "e.g., Near XYZ School OR Post Office: ABC"
              )
            }
          />
        </Grid>

        {/* City / Town */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="cityTown"
            name="cityTown"
            label={t("city_town", "City / Town")}
            fullWidth
            variant="outlined"
            value={formData.cityTown}
            onChange={handleChange}
            error={!!errors.cityTown}
            helperText={errors.cityTown}
          />
        </Grid>

        {/* Upazila / Thana */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="upazila"
            name="upazila"
            label={t("upazila_thana", "Upazila / Thana")}
            fullWidth
            variant="outlined"
            value={formData.upazila}
            onChange={handleChange}
            error={!!errors.upazila}
            helperText={errors.upazila}
          />
          {/* Consider Select dropdown if you have a list of upazilas per district */}
        </Grid>

        {/* District */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="district"
            name="district"
            label={t("district", "District")}
            fullWidth
            variant="outlined"
            value={formData.district}
            onChange={handleChange}
            error={!!errors.district}
            helperText={errors.district}
          />
          {/* Consider Select dropdown if you have a list of districts */}
        </Grid>

        {/* Postal Code */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="postalCode"
            name="postalCode"
            label={t("postal_code", "Postal Code")}
            fullWidth
            variant="outlined"
            value={formData.postalCode}
            onChange={handleChange}
            error={!!errors.postalCode}
            helperText={errors.postalCode}
            inputProps={{ maxLength: 4 }} // BD postal codes are usually 4 digits
          />
        </Grid>

        {/* Removed State field */}
        {/* Add Map integration here later if desired */}
      </Grid>
    </Box>
  );
};

export default Step2_Location;
