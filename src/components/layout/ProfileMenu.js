import React, { useState } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite"; // Assuming you have a Saved page route
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth to get user info directly if needed

// Correct the expected prop name from onLogout to handleLogout
export default function ProfileMenu({ handleLogout }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user info from context

  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  // Helper function to navigate and close menu
  const go = (path) => {
    navigate(path);
    handleClose();
  };

  // Function to call the passed handleLogout prop and close the menu
  const triggerLogout = () => {
    if (handleLogout) {
      // Check if the prop exists before calling
      handleLogout();
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title="Account">
        <IconButton onClick={handleOpen} sx={{ p: 0, ml: 2 }}>
          {/* Display user's first initial or a default icon */}
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {" "}
            {/* Use theme color */}
            {user?.name?.charAt(0).toUpperCase() || <AccountCircleIcon />}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 180,
            overflow: "visible", // Allow potential box shadow/effects
            "& .MuiAvatar-root": {
              // Example styling if needed
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            // Add arrow pointer if desired (more complex styling)
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* Link to User Profile Page */}
        <MenuItem onClick={() => go("/profile")}>
          {" "}
          {/* Updated path based on UserProfile.js likely route */}
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        {/* Link to Saved Properties Page */}
        <MenuItem onClick={() => go("/saved")}>
          <ListItemIcon>
            <FavoriteIcon fontSize="small" />
          </ListItemIcon>
          Saved Properties
        </MenuItem>
        <Divider sx={{ my: 0.5 }} /> {/* Add margin to divider */}
        {/* Logout Menu Item */}
        <MenuItem
          onClick={triggerLogout} // Call the corrected triggerLogout function
          sx={{ color: "error.main" }} // Use theme error color for text too
        >
          <ListItemIcon>
            {/* Use theme error color */}
            <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
