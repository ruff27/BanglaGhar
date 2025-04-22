// src/components/layout/ProfileMenu.js

import React, { useState } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  ListItemText,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"; // Import admin icon
// Link is not needed if using navigate directly in 'go' function
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import { useTranslation } from "react-i18next";
import myListings from "../../features/profile/hooks/useMyListings"; // Adjust path if needed
import HomeWorkIcon from "@mui/icons-material/HomeWork"; // Import icon for My Listings

// Use the corrected prop name 'handleLogout'
export default function ProfileMenu({ handleLogout }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user info from context (includes isAdmin)
  const { t } = useTranslation();

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
      handleLogout();
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title="Account">
        <IconButton onClick={handleOpen} sx={{ p: 0, ml: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {/* Use displayName first, fallback to name, then icon */}
            {(
              user?.displayName?.charAt(0) || user?.name?.charAt(0)
            )?.toUpperCase() || <AccountCircleIcon />}
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
            overflow: "visible",
            "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* Standard User Links */}
        <MenuItem onClick={() => go("/user-profile")}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("nav_profile")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => go("/my-listings")}>
          <ListItemIcon>
            <HomeWorkIcon fontSize="small" /> {/* Or other suitable icon */}
          </ListItemIcon>
          <ListItemText>My Listings</ListItemText>{" "}
          {/* Add translation key if needed */}
        </MenuItem>

        <MenuItem onClick={() => go("/saved")}>
          <ListItemIcon>
            <FavoriteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("nav_saved")}</ListItemText>
        </MenuItem>

        {/* --- Conditional Admin Link --- */}
        {user?.isAdmin && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => go("/admin/pending-approvals")}>
              {" "}
              {/* Link to admin section */}
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Admin Dashboard</ListItemText>{" "}
              {/* Or use t('nav_admin') */}
            </MenuItem>
          </>
        )}
        {/* --- End Conditional Admin Link --- */}

        <Divider sx={{ my: 0.5 }} />
        {/* Logout Link */}
        <MenuItem onClick={triggerLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>{t("nav_logout")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
