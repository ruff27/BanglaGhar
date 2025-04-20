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
import CloseIcon from "@mui/icons-material/Close";

// Define Min/Max Price for slider consistency
const MIN_PRICE = 0;
const MAX_PRICE = 50000000; // 5 Cr - Adjust if your data max is different

// Simplified price marks - only values, no labels to prevent overlap
const priceMarks = [
  { value: MIN_PRICE },
  { value: 10000000 }, // 1 Cr
  { value: 25000000 }, // 2.5 Cr
  { value: MAX_PRICE },
];

// Formatting function for slider tooltip and labels below
function formatPriceLabel(value) {
  if (value === MAX_PRICE) return `৳${(MAX_PRICE / 10000000).toFixed(0)}Cr+`; // Show '+' for max value
  if (value >= 10000000) return `৳${(value / 10000000).toFixed(1)}Cr`; // 1.0Cr, 2.5Cr etc.
  if (value >= 100000) return `৳${(value / 100000).toFixed(0)}L`; // 10L, 25L etc.
  // if (value >= 1000) return `৳${(value / 1000).toFixed(0)}k`; // Optional: Add 'k' for thousands
  return `৳${value.toLocaleString()}`; // Default format for smaller numbers
}

/**
 * FilterSidebar Component
 * Renders controls for filtering properties.
 */
const FilterSidebar = ({
  filters,
  onFilterChange,
  onResetFilters,
  isMobile,
  onClose,
}) => {
  // Ensure filters.priceRange is always an array of two numbers
  const priceRange =
    Array.isArray(filters?.priceRange) && filters.priceRange.length === 2
      ? filters.priceRange
      : [MIN_PRICE, MAX_PRICE]; // Default range if invalid

  const handleSliderChange = (event, newValue) => {
    // Prevent slider handles from crossing
    if (newValue[0] > newValue[1] || newValue[1] < newValue[0]) return;
    onFilterChange({ priceRange: newValue });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({ [name]: value });
  };

  return (
    // Use Box instead of Paper if no elevation/border needed in mobile drawer
    <Box
      sx={{
        p: 2, // Consistent padding
        height: "100%",
        overflowY: "auto", // Allow scrolling if content overflows
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1, // Reduced margin
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
          <IconButton onClick={onClose} size="small" aria-label="Close filters">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} /> {/* Reduced margin */}
      {/* Price Range */}
      <Box sx={{ mb: 3, px: 1 }}>
        {" "}
        {/* Add slight horizontal padding */}
        <Typography
          id="price-range-label"
          gutterBottom
          sx={{ mb: 1, fontWeight: "medium" }}
        >
          {" "}
          {/* Add ID for aria */}
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto" // Tooltip on hover/drag
          getAriaLabelledBy="price-range-label" // Accessibility
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={500000} // Example step: 5 Lakh - Adjust as needed
          marks={priceMarks} // Use simplified marks (or set to `true` for just dots)
          valueLabelFormat={formatPriceLabel} // Format tooltip value
          disableSwap // Prevent handles from swapping places
          sx={
            {
              // Removed mt: 4 - handled by Typography margin now
              // Add specific styling if needed
            }
          }
        />
        {/* Labels below slider */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="caption">
            {formatPriceLabel(priceRange[0])}
          </Typography>
          <Typography variant="caption">
            {formatPriceLabel(priceRange[1])}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      {/* Bedrooms */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
        {" "}
        {/* Use outlined variant, smaller size */}
        <InputLabel id="bedrooms-label">Bedrooms</InputLabel>
        <Select
          labelId="bedrooms-label"
          id="bedrooms-select"
          name="bedrooms"
          value={filters.bedrooms || "any"} // Default to 'any' if undefined
          label="Bedrooms"
          onChange={handleSelectChange}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5+</MenuItem>{" "}
          {/* Value '5' will be parsed in hook */}
        </Select>
      </FormControl>
      {/* Bathrooms */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
        <InputLabel id="bathrooms-label">Bathrooms</InputLabel>
        <Select
          labelId="bathrooms-label"
          id="bathrooms-select"
          name="bathrooms"
          value={filters.bathrooms || "any"}
          label="Bathrooms"
          onChange={handleSelectChange}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3+</MenuItem>{" "}
          {/* Value '3' will be parsed in hook */}
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />
      {/* Property Type */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
        <InputLabel id="propertyType-label">Property Type</InputLabel>
        <Select
          labelId="propertyType-label"
          id="propertyType-select"
          name="propertyType"
          value={filters.propertyType || "any"}
          label="Property Type"
          onChange={handleSelectChange}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value="apartment">Apartment</MenuItem>
          <MenuItem value="house">House</MenuItem>
          <MenuItem value="condo">Condo</MenuItem>
          <MenuItem value="land">Land</MenuItem>
          {/* Add other types based on your actual data */}
        </Select>
      </FormControl>
      {/* Reset Button */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onResetFilters}
        sx={{ borderRadius: "8px", textTransform: "none" }}
      >
        Reset Filters
      </Button>
    </Box>
  );
};

export default FilterSidebar;
