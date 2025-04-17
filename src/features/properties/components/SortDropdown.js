import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import SortIcon from "@mui/icons-material/SortRounded";

/**
 * SortDropdown Component
 * Renders a dropdown for selecting property sort order.
 */
const SortDropdown = ({ sortBy, onSortChange }) => {
  const handleSortChange = (event) => {
    onSortChange(event.target.value);
  };

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="sort-by-label">Sort By</InputLabel>
      <Select
        labelId="sort-by-label"
        id="sort-by-select"
        value={sortBy}
        label="Sort By"
        onChange={handleSortChange}
        startAdornment={<SortIcon sx={{ mr: 1, color: "action.active" }} />}
        sx={{ borderRadius: "8px" }}
      >
        <MenuItem value="price_asc">Price: Low to High</MenuItem>
        <MenuItem value="price_desc">Price: High to Low</MenuItem>
        <MenuItem value="date_desc">Date: Newest First</MenuItem>
        <MenuItem value="date_asc">Date: Oldest First</MenuItem>
        <MenuItem value="area_desc">Area: Largest First</MenuItem>
        <MenuItem value="area_asc">Area: Smallest First</MenuItem>
      </Select>
    </FormControl>
  );
};

export default SortDropdown;
