// src/admin/components/users/UserFilters.js
import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const UserFilters = ({
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterStatusChange,
}) => {
  return (
    // Match original Paper styling
    <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
      {/* Match original Box layout */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap", // Keep wrap for responsiveness
        }}
      >
        {/* Match original TextField styling */}
        <TextField
          label="Search by Name/Email"
          variant="outlined" // Keep original variant
          size="small" // Keep original size
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          // Match original sx for flexibility
          sx={{ flexGrow: 1, minWidth: "250px" }}
        />
        {/* Match original FormControl/Select styling */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Approval Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter-select" // Add id if needed
            value={filterStatus}
            label="Approval Status"
            onChange={onFilterStatusChange}
            // No specific sx needed here based on original
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="not_started">Not Started</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default UserFilters;
