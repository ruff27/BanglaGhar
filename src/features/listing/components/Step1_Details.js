import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // AI Icon
import { useTranslation } from "react-i18next"; // Import useTranslation

const Step1_Details = ({
  formData,
  errors,
  handleChange,
  generateDescription,
  loadingAI,
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information {/* <-- Kept as is, no key found */}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="title"
            name="title"
            label={t("property_title")} // Applied translation
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.propertyType}>
            <InputLabel id="propertyType-label">
              {t("property_type")}
            </InputLabel>{" "}
            {/* Applied translation */}
            <Select
              labelId="propertyType-label"
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              label={t("property_type")} // Applied translation
              onChange={handleChange}
            >
              {/* Applied translation */}
              <MenuItem value="apartment">{t("apartment")}</MenuItem>
              <MenuItem value="house">{t("house")}</MenuItem>
              <MenuItem value="condo">{t("condo")}</MenuItem>
              <MenuItem value="land">{t("land")}</MenuItem>
              {/* Add other types if keys exist */}
            </Select>
            {errors.propertyType && (
              <FormHelperText>{errors.propertyType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.listingType}>
            <InputLabel id="listingType-label">{t("listing_type")}</InputLabel>{" "}
            {/* Applied translation */}
            <Select
              labelId="listingType-label"
              id="listingType"
              name="listingType"
              value={formData.listingType}
              label={t("listing_type")} // Applied translation
              onChange={handleChange}
            >
              {/* Applied translation */}
              <MenuItem value="rent">{t("rent")}</MenuItem>
              <MenuItem value="buy">{t("buy")}</MenuItem>
              {/* Add 'sold' if applicable and key exists */}
            </Select>
            {errors.listingType && (
              <FormHelperText>{errors.listingType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="price"
            name="price"
            label={t("price")} // Applied translation
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
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="area"
            name="area"
            label={t("area")} // Applied translation
            type="number"
            fullWidth
            variant="outlined"
            value={formData.area}
            onChange={handleChange}
            error={!!errors.area}
            helperText={errors.area}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="bedrooms"
            name="bedrooms"
            label={t("bedrooms")} // Applied translation
            type="number"
            fullWidth
            variant="outlined"
            value={formData.bedrooms}
            onChange={handleChange}
            error={!!errors.bedrooms}
            helperText={errors.bedrooms}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="bathrooms"
            name="bathrooms"
            label={t("bathrooms")} // Applied translation
            type="number"
            fullWidth
            variant="outlined"
            value={formData.bathrooms}
            onChange={handleChange}
            error={!!errors.bathrooms}
            helperText={errors.bathrooms}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="description"
            name="description"
            label={t("property_description")} // Applied translation
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={
              errors.description ||
              "Describe the property or use the AI generator." // <-- Kept fallback as is, no key found
            }
          />
          <Button
            variant="outlined"
            size="small"
            onClick={generateDescription}
            disabled={loadingAI}
            startIcon={
              loadingAI ? <CircularProgress size={16} /> : <AutoFixHighIcon />
            }
            sx={{ mt: 1, textTransform: "none", float: "right" }}
          >
            {/* Applied translation */}
            {loadingAI ? t("sending") : t("generate_ai")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step1_Details;
