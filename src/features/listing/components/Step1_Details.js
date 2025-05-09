import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  // Removed Button, CircularProgress, AutoFixHighIcon
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const Step1_Details = ({ formData, errors, handleChange }) => {
  const { t } = useTranslation();

  // Determine if Bedrooms/Bathrooms should be shown
  const showBedBath =
    formData.propertyType !== "land" && formData.propertyType !== "commercial";

  return (
    <Box>
      {/* <Typography variant="h6" gutterBottom>
        {t("step_basic_info", "Basic Information")}
      </Typography> */}
      <Grid container spacing={3}>
        {/* Property Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.propertyType}>
            <InputLabel id="propertyType-label">
              {t("property_type")}
            </InputLabel>
            <Select
              labelId="propertyType-label"
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              label={t("property_type")}
              onChange={handleChange}
            >
              <MenuItem value="apartment">
                {t("apartment", "Apartment")}
              </MenuItem>
              <MenuItem value="house">{t("house", "House")}</MenuItem>
              <MenuItem value="condo">{t("condo", "Condo")}</MenuItem>
              <MenuItem value="land">{t("land", "Land")}</MenuItem>
              <MenuItem value="commercial">
                {t("commercial", "Commercial")}
              </MenuItem>{" "}
              {/* Added */}
              {/* Add other types if needed */}
            </Select>
            {errors.propertyType && (
              <FormHelperText>{errors.propertyType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Listing Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.listingType}>
            <InputLabel id="listingType-label">{t("listing_type")}</InputLabel>
            <Select
              labelId="listingType-label"
              id="listingType"
              name="listingType"
              value={formData.listingType}
              label={t("listing_type")}
              onChange={handleChange}
            >
              <MenuItem value="rent">{t("rent", "For Rent")}</MenuItem>
              <MenuItem value="buy">{t("buy", "For Sale")}</MenuItem>
              {/* Add 'sold' if applicable and managed differently */}
            </Select>
            {errors.listingType && (
              <FormHelperText>{errors.listingType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Title */}
        <Grid item xs={12}>
          <TextField
            required
            id="title"
            name="title"
            label={t("property_title")}
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
          />
        </Grid>

        {/* Price */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="price"
            name="price"
            label={t("price")}
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={handleChange}
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">৳</InputAdornment>
              ),
              // Ensure non-negative input if needed via inputProps
              inputProps: { min: 0 },
            }}
          />
        </Grid>

        {/* Area - Optional */}
        <Grid item xs={12} sm={6}>
          <TextField
            // required // Removed required
            id="area"
            name="area"
            label={t("area_sqft", "Area (sqft)")} // Specify unit
            type="number"
            fullWidth
            variant="outlined"
            value={formData.area}
            onChange={handleChange}
            error={!!errors.area}
            helperText={errors.area || t("optional", "Optional")} // Indicate optional
            InputProps={{ inputProps: { min: 0 } }} // Allow only non-negative
          />
          {/* Consider adding a unit selector if area can be in Katha etc. for Land type */}
        </Grid>

        {/* Bedrooms - Conditional */}
        {showBedBath && (
          <Grid item xs={12} sm={6}>
            <TextField
              required // Required only when shown
              id="bedrooms"
              name="bedrooms"
              label={t("bedrooms")}
              type="number"
              fullWidth
              variant="outlined"
              value={formData.bedrooms}
              onChange={handleChange}
              error={!!errors.bedrooms}
              helperText={errors.bedrooms}
              InputProps={{ inputProps: { min: 0 } }} // Allow 0 or more
            />
          </Grid>
        )}

        {/* Bathrooms - Conditional */}
        {showBedBath && (
          <Grid item xs={12} sm={6}>
            <TextField
              required // Required only when shown
              id="bathrooms"
              name="bathrooms"
              label={t("bathrooms")}
              type="number"
              fullWidth
              variant="outlined"
              value={formData.bathrooms}
              onChange={handleChange}
              error={!!errors.bathrooms}
              helperText={errors.bathrooms}
              InputProps={{ inputProps: { min: 0 } }} // Allow 0 or more
            />
          </Grid>
        )}

        {/* Description and AI Button Removed from here */}
      </Grid>
    </Box>
  );
};

export default Step1_Details;
