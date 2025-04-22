// src/admin/components/listings/ListingFilters.js
import React from "react";
import {
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const PROPERTY_TYPES = ["apartment", "house", "condo", "land", "commercial"];
const LISTING_TYPES = ["rent", "buy", "sold"];
const VISIBILITY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Visible", value: "false" },
  { label: "Hidden", value: "true" },
];
const FEATURED_OPTIONS = [
  { label: "All", value: "" },
  { label: "Featured", value: "true" },
  { label: "Not Featured", value: "false" },
];

const ListingFilters = ({
  searchTerm,
  filterPropertyType,
  filterListingType,
  filterVisibility,
  filterFeatured,
  onSearchChange,
  onFilterChange, // Use generic handler from hook
  setFilterPropertyType, // Expect setters from hook
  setFilterListingType,
  setFilterVisibility,
  setFilterFeatured,
}) => {
  return (
    // Match original Paper styling
    <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
      {/* Match original Grid container props */}
      <Grid container spacing={2} alignItems="center">
        {/* Match original Grid item and TextField props */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Search Title/Location/Creator"
            size="small" // Keep original size
            fullWidth // Keep original prop
            value={searchTerm}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {/* Match original Grid item and Select props */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="property-type-filter-label">
              Property Type
            </InputLabel>
            <Select
              labelId="property-type-filter-label"
              value={filterPropertyType}
              label="Property Type"
              onChange={onFilterChange(setFilterPropertyType)} // Use generic handler + setter
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              {PROPERTY_TYPES.map((type) => (
                <MenuItem
                  key={type}
                  value={type}
                  sx={{ textTransform: "capitalize" }}
                >
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {/* Match original Grid item and Select props */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="listing-type-filter-label">Listing Type</InputLabel>
            <Select
              labelId="listing-type-filter-label"
              value={filterListingType}
              label="Listing Type"
              onChange={onFilterChange(setFilterListingType)}
            >
              <MenuItem value="">
                <em>All Modes</em>
              </MenuItem>
              {LISTING_TYPES.map((type) => (
                <MenuItem
                  key={type}
                  value={type}
                  sx={{ textTransform: "capitalize" }}
                >
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {/* Match original Grid item and Select props */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="visibility-filter-label">Visibility</InputLabel>
            <Select
              labelId="visibility-filter-label"
              value={filterVisibility}
              label="Visibility"
              onChange={onFilterChange(setFilterVisibility)}
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {/* Match original Grid item and Select props */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="featured-filter-label">Featured</InputLabel>
            <Select
              labelId="featured-filter-label"
              value={filterFeatured}
              label="Featured"
              onChange={onFilterChange(setFilterFeatured)}
            >
              {FEATURED_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ListingFilters;
