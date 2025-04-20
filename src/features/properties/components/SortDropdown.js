import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import SortIcon from "@mui/icons-material/SortRounded";
import { useTranslation } from "react-i18next"; // Import useTranslation

/**
 * SortDropdown Component
 */
const SortDropdown = ({ sortBy, onSortChange }) => {
  const { t } = useTranslation(); // Initialize translation

  const handleSortChange = (event) => {
    onSortChange(event.target.value);
  };

  // Define sort options with translation keys
  const sortOptions = [
    { value: "price_asc", labelKey: "sort_price_asc" },
    { value: "price_desc", labelKey: "sort_price_desc" },
    { value: "date_desc", labelKey: "Date: Newest First" }, // <-- Kept as is, no key
    { value: "date_asc", labelKey: "Date: Oldest First" }, // <-- Kept as is, no key
    { value: "area_desc", labelKey: "sort_area_desc" },
    { value: "area_asc", labelKey: "sort_area_asc" },
  ];

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="sort-by-label">{t("sort_by")}</InputLabel> {/* Applied */}
      <Select
        labelId="sort-by-label"
        id="sort-by-select"
        value={sortBy}
        label={t("sort_by")} // Applied
        onChange={handleSortChange}
        startAdornment={<SortIcon sx={{ mr: 1, color: "action.active" }} />}
        sx={{ borderRadius: "8px" }}
      >
        {/* Iterate over options and translate labels */}
        {sortOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {/* Apply t() if key starts with 'sort_', otherwise use hardcoded label */}
            {option.labelKey.startsWith("sort_")
              ? t(option.labelKey)
              : option.labelKey}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SortDropdown;
