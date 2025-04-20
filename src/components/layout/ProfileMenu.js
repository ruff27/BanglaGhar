import React, { useState } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  ListItemText, // Import ListItemText
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import { useTranslation } from "react-i18next"; // Import useTranslation

// Use the corrected prop name 'handleLogout'
export default function ProfileMenu({ handleLogout }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user info from context
  const { t } = useTranslation(); // Initialize translation

  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  // Helper function to navigate and close menu
  const go = (path) => {
    // console.log(`ProfileMenu: Navigating to ${path}`); // Keep console log for now
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
        {" "}
        {/* <-- Kept as is, no key found */}
        <IconButton onClick={handleOpen} sx={{ p: 0, ml: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
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
            overflow: "visible",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* *** FIX: Use the correct path "/user-profile" *** */}
        <MenuItem onClick={() => go("/user-profile")}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          {/* Applied translation */}
          <ListItemText>{t("nav_profile")}</ListItemText>
        </MenuItem>
        {/* Ensure "/saved" route exists in App.js */}
        <MenuItem onClick={() => go("/saved")}>
          <ListItemIcon>
            <FavoriteIcon fontSize="small" />
          </ListItemIcon>
          {/* Applied translation */}
          <ListItemText>{t("nav_saved")}</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={triggerLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          {/* Applied translation */}
          <ListItemText>{t("nav_logout")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
