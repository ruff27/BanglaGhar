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

const Step1_Details = ({
  formData,
  errors,
  handleChange,
  generateDescription,
  loadingAI,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="title"
            name="title"
            label="Property Title"
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
            <InputLabel id="propertyType-label">Property Type</InputLabel>
            <Select
              labelId="propertyType-label"
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              label="Property Type"
              onChange={handleChange}
            >
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="land">Land</MenuItem>
              {/* Add other types */}
            </Select>
            {errors.propertyType && (
              <FormHelperText>{errors.propertyType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.listingType}>
            <InputLabel id="listingType-label">Listing Type</InputLabel>
            <Select
              labelId="listingType-label"
              id="listingType"
              name="listingType"
              value={formData.listingType}
              label="Listing Type"
              onChange={handleChange}
            >
              <MenuItem value="rent">For Rent</MenuItem>
              <MenuItem value="buy">For Sale</MenuItem>
              {/* Add 'sold' if applicable for listing directly */}
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
            label="Price (BDT)"
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
            label="Area (sqft)"
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
            label="Bedrooms"
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
            label="Bathrooms"
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
            label="Property Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={
              errors.description ||
              "Describe the property or use the AI generator."
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
            {loadingAI ? "Generating..." : "Generate with AI"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step1_Details;
