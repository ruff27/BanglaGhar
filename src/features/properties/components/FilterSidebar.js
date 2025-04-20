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
import { useTranslation } from "react-i18next"; // Import useTranslation

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
  if (value === MAX_PRICE) return `৳${(MAX_PRICE / 10000000).toFixed(0)}Cr+`;
  if (value >= 10000000) return `৳${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `৳${(value / 100000).toFixed(0)}L`;
  return `৳${value.toLocaleString()}`;
}

/**
 * FilterSidebar Component
 */
const FilterSidebar = ({
  filters,
  onFilterChange,
  onResetFilters,
  isMobile,
  onClose,
}) => {
  const { t } = useTranslation(); // Initialize translation

  const priceRange =
    Array.isArray(filters?.priceRange) && filters.priceRange.length === 2
      ? filters.priceRange
      : [MIN_PRICE, MAX_PRICE];

  const handleSliderChange = (event, newValue) => {
    if (newValue[0] > newValue[1] || newValue[1] < newValue[0]) return;
    onFilterChange({ priceRange: newValue });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({ [name]: value });
  };

  return (
    <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <FilterAltIcon color="primary" /> Filters{" "}
          {/* <-- Kept as is, no key */}
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small" aria-label={t("close")}>
            {" "}
            {/* Using close key for aria-label */}
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Price Range */}
      <Box sx={{ mb: 3, px: 1 }}>
        <Typography
          id="price-range-label"
          gutterBottom
          sx={{ mb: 1, fontWeight: "medium" }}
        >
          Price Range {/* <-- Kept as is, no key */}
        </Typography>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          getAriaLabelledBy="price-range-label"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={500000}
          marks={priceMarks}
          valueLabelFormat={formatPriceLabel}
          disableSwap
        />
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
        <InputLabel id="bedrooms-label">{t("bedrooms")}</InputLabel>{" "}
        {/* Applied */}
        <Select
          labelId="bedrooms-label"
          id="bedrooms-select"
          name="bedrooms"
          value={filters.bedrooms || "any"}
          label={t("bedrooms")} // Applied
          onChange={handleSelectChange}
        >
          {/* Applied */}
          <MenuItem value="any">{t("any")}</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5+</MenuItem>
        </Select>
      </FormControl>

      {/* Bathrooms */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
        <InputLabel id="bathrooms-label">{t("bathrooms")}</InputLabel>{" "}
        {/* Applied */}
        <Select
          labelId="bathrooms-label"
          id="bathrooms-select"
          name="bathrooms"
          value={filters.bathrooms || "any"}
          label={t("bathrooms")} // Applied
          onChange={handleSelectChange}
        >
          {/* Applied */}
          <MenuItem value="any">{t("any")}</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3+</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Property Type */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
        <InputLabel id="propertyType-label">{t("property_type")}</InputLabel>{" "}
        {/* Applied */}
        <Select
          labelId="propertyType-label"
          id="propertyType-select"
          name="propertyType"
          value={filters.propertyType || "any"}
          label={t("property_type")} // Applied
          onChange={handleSelectChange}
        >
          {/* Applied */}
          <MenuItem value="any">{t("any")}</MenuItem>
          <MenuItem value="apartment">{t("apartment")}</MenuItem>
          <MenuItem value="house">{t("house")}</MenuItem>
          <MenuItem value="condo">{t("condo")}</MenuItem>
          <MenuItem value="land">{t("land")}</MenuItem>
          {/* Add other types if keys exist */}
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
        {t("reset_filters")} {/* Applied */}
      </Button>
    </Box>
  );
};

export default FilterSidebar;
