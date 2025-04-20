// src/features/Properties/components/SortDropdown.js
import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import SortIcon from "@mui/icons-material/SortRounded";
import { useTranslation } from "react-i18next";

const SortDropdown = ({ sortBy, onSortChange }) => {
  const { t } = useTranslation();

  const handleSortChange = (event) => {
    onSortChange(event.target.value);
  };

  const sortOptions = [
    { value: "price_asc", labelKey: "sort_price_asc" },
    { value: "price_desc", labelKey: "sort_price_desc" },
    { value: "date_desc", labelKey: "Date: Newest First" },
    { value: "date_asc", labelKey: "Date: Oldest First" },
    { value: "area_desc", labelKey: "sort_area_desc" },
    { value: "area_asc", labelKey: "sort_area_asc" },
  ];

  // Define a default sort value consistent with usePropertyFilters initialization
  const defaultSortValue = "date_desc"; // Or "price_asc" if that was your intended default

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="sort-by-label">{t("sort_by")}</InputLabel>
      <Select
        labelId="sort-by-label"
        id="sort-by-select"
        // --- Provide fallback value ---
        value={sortBy || defaultSortValue} // Use default if sortBy is undefined/null/empty
        // --- End modification ---
        label={t("sort_by")}
        onChange={handleSortChange}
        startAdornment={<SortIcon sx={{ mr: 1, color: "action.active" }} />}
        sx={{ borderRadius: "8px" }}
      >
        {sortOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
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
