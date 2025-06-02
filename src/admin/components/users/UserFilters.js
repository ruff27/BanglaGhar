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
    <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Search by Name/Email"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: "250px" }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Approval Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter-select"
            value={filterStatus}
            label="Approval Status"
            onChange={onFilterStatusChange}
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
