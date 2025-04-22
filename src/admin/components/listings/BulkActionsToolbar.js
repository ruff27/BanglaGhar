// src/admin/components/listings/BulkActionsToolbar.js
import React from "react";
import { Toolbar, Typography, Tooltip, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const BulkActionsToolbar = ({ numSelected, onDeleteSelected, isLoading }) => {
  // Hide completely if nothing selected (matches original implicit behavior)
  if (numSelected === 0) {
    return null;
  }

  return (
    // Match original Paper styling
    <Paper sx={{ width: "100%", mb: 2 }} elevation={1}>
      {/* Match original Toolbar styling */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          // Match original background color logic
          bgcolor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.secondary.lighter // Use theme colors if defined, or fallback
              : theme.palette.secondary.darker,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Match original Typography */}
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit" // Keep original color
          variant="subtitle1" // Keep original variant
          component="div"
        >
          {numSelected} selected
        </Typography>

        {/* Match original Tooltip and IconButton */}
        <Tooltip title="Delete Selected">
          <span>
            <IconButton onClick={onDeleteSelected} disabled={isLoading}>
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Toolbar>
    </Paper>
  );
};

export default BulkActionsToolbar;
