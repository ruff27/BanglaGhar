// src/features/Properties/components/FilterSidebar.js

import React from "react";
import {
  Box,
  Slider,
  Typography,
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
import { useTranslation } from "react-i18next";

// Helper to format numbers into Bangladeshi units
function formatPriceLabel(value) {
  if (value >= 10_000_000) {
    const cr = value / 10_000_000;
    return `৳${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
  }
  if (value >= 100_000) {
    const lk = value / 100_000;
    return `৳${lk % 1 === 0 ? lk : lk.toFixed(1)} L`;
  }
  return `৳${value.toLocaleString()}`;
}

const BASELINE = 1; // for log scaling (avoid log(0))
const MAX_PRICE = 50_000_000; // 5 Crore (end of scale)

// Map actual price → slider percent (0–100)
const toPercent = (price) =>
  price <= BASELINE
    ? 0
    : ((Math.log(price) - Math.log(BASELINE)) /
        (Math.log(MAX_PRICE) - Math.log(BASELINE))) *
      100;

// Map slider percent → actual price
const fromPercent = (pct) =>
  pct <= 0
    ? 0
    : Math.round(
        Math.exp(
          Math.log(BASELINE) +
            (pct / 100) * (Math.log(MAX_PRICE) - Math.log(BASELINE))
        )
      );

// Only show 0% and 100% marks
const priceMarks = [
  { value: 0, label: "৳0" },
  { value: 100, label: formatPriceLabel(MAX_PRICE) },
];

const FilterSidebar = ({
  filters = {},
  onFilterChange,
  onResetFilters,
  isMobile,
  onClose,
}) => {
  const { t } = useTranslation();

  // Derive slider positions from current filter values
  const percentRange =
    Array.isArray(filters.priceRange) && filters.priceRange.length === 2
      ? [toPercent(filters.priceRange[0]), toPercent(filters.priceRange[1])]
      : [0, 100];

  const handleSliderChange = (_evt, newPctRange) => {
    const newPrices = newPctRange.map(fromPercent);
    onFilterChange({ priceRange: newPrices });
  };

  const handleSelectChange = (evt) => {
    const { name, value } = evt.target;
    onFilterChange({ [name]: value });
  };

  return (
    <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", gap: 1 }}>
          <FilterAltIcon color="primary" /> {t("filters")}
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small" aria-label={t("close")}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Price Range (log scale) */}
      <Box sx={{ mb: 3, px: 1 }}>
        <Typography
          id="price-range-label"
          gutterBottom
          sx={{ mb: 1, fontWeight: "medium" }}
        >
          {t("price")}
        </Typography>
        <Slider
          value={percentRange}
          onChange={handleSliderChange}
          min={0}
          max={100}
          marks={priceMarks}
          valueLabelDisplay="auto"
          valueLabelFormat={(pct) => formatPriceLabel(fromPercent(pct))}
          aria-labelledby="price-range-label"
          sx={{
            "& .MuiSlider-markLabel": {
              top: 28,
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
            },
          }}
        />
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Bedrooms */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
        <InputLabel id="bedrooms-label">{t("bedrooms")}</InputLabel>
        <Select
          labelId="bedrooms-label"
          name="bedrooms"
          value={filters.bedrooms || "any"}
          label={t("bedrooms")}
          onChange={handleSelectChange}
        >
          <MenuItem value="any">{t("any")}</MenuItem>
          {[1, 2, 3, 4].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
          <MenuItem value={5}>5+</MenuItem>
        </Select>
      </FormControl>

      {/* Bathrooms */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
        <InputLabel id="bathrooms-label">{t("bathrooms")}</InputLabel>
        <Select
          labelId="bathrooms-label"
          name="bathrooms"
          value={filters.bathrooms || "any"}
          label={t("bathrooms")}
          onChange={handleSelectChange}
        >
          <MenuItem value="any">{t("any")}</MenuItem>
          {[1, 2].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
          <MenuItem value={3}>3+</MenuItem>
        </Select>
      </FormControl>
      <Divider sx={{ my: 2 }} />

      {/* Property Type */}
      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
        <InputLabel id="propertyType-label">{t("property_type")}</InputLabel>
        <Select
          labelId="propertyType-label"
          name="propertyType"
          value={filters.propertyType || "any"}
          label={t("property_type")}
          onChange={handleSelectChange}
        >
          {["any", "apartment", "house", "condo", "land", "commercial"].map(
            (opt) => (
              <MenuItem key={opt} value={opt}>
                {opt === "any" ? t("any") : t(opt)}
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>

      {/* Reset */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onResetFilters}
        sx={{ borderRadius: "8px", textTransform: "none" }}
      >
        {t("reset_filters")}
      </Button>
    </Box>
  );
};

export default FilterSidebar;
