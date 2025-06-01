
import React from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Grid,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";

const EditPropertyForm = ({
  formData,
  onInputChange,

  onSubmit,
  isSubmitting,
  validationErrors = {},
  
}) => {
  const { t } = useTranslation();

  
  if (!formData)
    return <Typography>{t("loading_form", "Loading form...")}</Typography>;

  const listingStatusOptions = [
    { value: "available", label: t("status_available", "Available") },
    { value: "rented", label: t("status_rented", "Rented") },
    { value: "sold", label: t("status_sold", "Sold") },
    { value: "unavailable", label: t("status_unavailable", "Unavailable") },
  ];

  return (
    <form onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Example: Title field (add other editable fields as needed) */}
        <Grid item xs={12}>
          <TextField
            name="title"
            label={t("property_title", "Property Title")}
            value={formData.title || ""}
            onChange={onInputChange}
            fullWidth
            variant="outlined"
            error={!!validationErrors?.title}
            helperText={validationErrors?.title}
            disabled={isSubmitting}
          />
        </Grid>

        {/* 🎉🎉🎉🎉🎉🎉 start modification: Add Listing Status Dropdown */}
        <Grid item xs={12} sm={6}>
          <FormControl
            fullWidth
            error={!!validationErrors?.listingStatus}
            disabled={isSubmitting}
          >
            <InputLabel id="listing-status-label">
              {t("listing_status_label", "Listing Status")}
            </InputLabel>
            <Select
              labelId="listing-status-label"
              name="listingStatus"
              value={formData.listingStatus || "available"}
              label={t("listing_status_label", "Listing Status")}
              onChange={onInputChange}
              MenuProps={{
                disableScrollLock: true, 
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                PaperProps: {
                  style: {
                    maxHeight: 250,
                    width: "auto", 
                  },
                },
              }}
            >
              {listingStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {validationErrors?.listingStatus && (
              <FormHelperText>{validationErrors.listingStatus}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Example: Price field */}
        <Grid item xs={12} sm={6}>
          <TextField
            name="price"
            label={t("property_price", "Price")}
            type="number"
            value={formData.price || ""}
            onChange={onInputChange}
            fullWidth
            variant="outlined"
            error={!!validationErrors?.price}
            helperText={validationErrors?.price}
            disabled={isSubmitting}
          />
        </Grid>

        {/* Add other editable fields from your property schema as needed */}
        {/* e.g., description, bedrooms, bathrooms, features, etc. */}
        {/* For brevity, only title, price, and listingStatus are shown here */}

        <Grid item xs={12}>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isSubmitting
                ? t("saving_changes", "Saving...")
                : t("save_changes_button", "Save Changes")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default EditPropertyForm;
