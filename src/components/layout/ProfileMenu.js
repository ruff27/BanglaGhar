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
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ user, onLogout }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();

  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);
  const go = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Account">
        <IconButton onClick={handleOpen} sx={{ p: 0, ml: 2 }}>
          <Avatar sx={{ bgcolor: "#2B7B8C" }}>
            {user?.name?.charAt(0).toUpperCase() || <AccountCircleIcon />}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 180 } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => go("/user-profile")}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={() => go("/saved")}>
          <ListItemIcon>
            <FavoriteIcon fontSize="small" />
          </ListItemIcon>
          Saved Properties
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onLogout();
            handleClose();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "#d32f2f" }} />
          </ListItemIcon>
          <span style={{ color: "#d32f2f" }}>Logout</span>
        </MenuItem>
      </Menu>
    </>
  );
}
