import React from "react";
import {
  Paper,
  Typography,
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close"; // For mobile close

// Example price marks (adjust based on your data range)
const priceMarks = [
  { value: 0, label: "৳0" },
  { value: 1000000, label: "৳10L" },
  { value: 2500000, label: "৳25L" },
  { value: 5000000, label: "৳50L" },
  { value: 10000000, label: "৳1Cr" },
  { value: 50000000, label: "৳5Cr+" }, // Adjust max as needed
];

function formatPriceLabel(value) {
  if (value >= 10000000) return `৳${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `৳${(value / 100000).toFixed(0)}L`;
  if (value >= 1000) return `৳${(value / 1000).toFixed(0)}k`;
  return `৳${value}`;
}

/**
 * FilterSidebar Component
 * Renders controls for filtering properties (price, beds, baths, type).
 */
const FilterSidebar = ({
  filters,
  onFilterChange,
  onResetFilters,
  isMobile,
  onClose,
}) => {
  const handleSliderChange = (event, newValue) => {
    onFilterChange({ priceRange: newValue });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({ [name]: value });
  };

  return (
    <Paper
      elevation={isMobile ? 0 : 2}
      sx={{
        p: 3,
        borderRadius: isMobile ? 0 : "12px",
        height: "100%", // Allow sidebar to potentially scroll if content overflows
        overflowY: "auto",
        borderRight: isMobile ? "none" : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isMobile ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <FilterAltIcon color="primary" /> Filters
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Price Range */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={filters.priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          getAriaLabel={() => "Price range"}
          min={0}
          max={50000000} // Adjust max based on your data
          step={100000} // Adjust step
          marks={priceMarks}
          valueLabelFormat={formatPriceLabel}
          sx={{ mt: 4 }} // Add margin top for labels
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="caption">
            {formatPriceLabel(filters.priceRange[0])}
          </Typography>
          <Typography variant="caption">
            {formatPriceLabel(filters.priceRange[1])}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 3 }} />

      {/* Bedrooms */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="bedrooms-label">Bedrooms</InputLabel>
        <Select
          labelId="bedrooms-label"
          id="bedrooms-select"
          name="bedrooms"
          value={filters.bedrooms}
          label="Bedrooms"
          onChange={handleSelectChange}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5+</MenuItem>
        </Select>
      </FormControl>

      {/* Bathrooms */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="bathrooms-label">Bathrooms</InputLabel>
        <Select
          labelId="bathrooms-label"
          id="bathrooms-select"
          name="bathrooms"
          value={filters.bathrooms}
          label="Bathrooms"
          onChange={handleSelectChange}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3+</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ my: 3 }} />

      {/* Property Type */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="propertyType-label">Property Type</InputLabel>
        <Select
          labelId="propertyType-label"
          id="propertyType-select"
          name="propertyType"
          value={filters.propertyType}
          label="Property Type"
          onChange={handleSelectChange}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value="apartment">Apartment</MenuItem>
          <MenuItem value="house">House</MenuItem>
          <MenuItem value="condo">Condo</MenuItem>
          <MenuItem value="land">Land</MenuItem>
          {/* Add other types as needed */}
        </Select>
      </FormControl>

      {/* Reset Button */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onResetFilters}
        sx={{ mt: 2, borderRadius: "8px", textTransform: "none" }}
      >
        Reset Filters
      </Button>
    </Paper>
  );
};

export default FilterSidebar;
