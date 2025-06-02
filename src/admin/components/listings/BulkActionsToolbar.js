import React from "react";
import { Toolbar, Typography, Tooltip, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const BulkActionsToolbar = ({ numSelected, onDeleteSelected, isLoading }) => {
  if (numSelected === 0) {
    return null;
  }

  return (
    <Paper sx={{ width: "100%", mb: 2 }} elevation={1}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          bgcolor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.secondary.lighter // Use theme colors if defined, or fallback
              : theme.palette.secondary.darker,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>

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
