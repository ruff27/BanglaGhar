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
  Badge, // Import Badge for future unread count
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; //
import FavoriteIcon from "@mui/icons-material/Favorite"; //
import LogoutIcon from "@mui/icons-material/Logout"; //
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"; //
import ChatIcon from "@mui/icons-material/Chat"; // Import Chat icon
import { useNavigate } from "react-router-dom"; //
import { useAuth } from "../../context/AuthContext"; //
import { useTranslation } from "react-i18next"; //
// import myListings from "../../features/profile/hooks/useMyListings"; // This import seems unused in the provided ProfileMenu.js
import HomeWorkIcon from "@mui/icons-material/HomeWork"; //
// import { useChatContext } from '../../features/chat/context/ChatContext'; // For unread count later

export default function ProfileMenu({ handleLogout }) {
  //
  const [anchor, setAnchor] = useState(null); //
  const navigate = useNavigate(); //
  const { user } = useAuth(); //
  const { t } = useTranslation(); //
  // const { unreadMessagesCount } = useChatContext(); // Placeholder for future unread count

  const handleOpen = (e) => setAnchor(e.currentTarget); //
  const handleClose = () => setAnchor(null); //

  const go = (path) => {
    //
    navigate(path); //
    handleClose(); //
  };

  const triggerLogout = () => {
    //
    if (handleLogout) {
      //
      handleLogout(); //
    }
    handleClose(); //
  };

  return (
    <>
      <Tooltip title="Account">
        {" "}
        {/* */}
        <IconButton onClick={handleOpen} sx={{ p: 0, ml: 2 }}>
          {" "}
          {/* */}
          {/* Avatar with unread badge (badge invisible if count is 0) */}
          <Badge
            badgeContent={0} // Replace with unreadMessagesCount later
            color="error"
            overlap="circular"
            variant="dot" // Use "dot" for a subtle indicator, or number for count
            invisible={true} // Set to 'unreadMessagesCount < 1' later
          >
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {" "}
              {/* */}
              {//
              (user?.displayName?.charAt(0) || user?.name?.charAt(0)) //
                ?.toUpperCase() || <AccountCircleIcon />}{" "}
              {/* */}
            </Avatar>
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu //
        anchorEl={anchor} //
        open={Boolean(anchor)} //
        onClose={handleClose} //
        PaperProps={{
          //
          elevation: 3, //
          sx: {
            //
            mt: 1.5, //
            minWidth: 200, // Increased minWidth slightly for new item with badge
            overflow: "visible", //
            "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 }, //
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} //
        transformOrigin={{ vertical: "top", horizontal: "right" }} //
      >
        <MenuItem onClick={() => go("/user-profile")}>
          {" "}
          {/* */}
          <ListItemIcon>
            {" "}
            {/* */}
            <AccountCircleIcon fontSize="small" /> {/* */}
          </ListItemIcon>
          <ListItemText>{t("nav_profile")}</ListItemText> {/* */}
        </MenuItem>
        <MenuItem onClick={() => go("/my-listings")}>
          {" "}
          {/* */}
          <ListItemIcon>
            {" "}
            {/* */}
            <HomeWorkIcon fontSize="small" /> {/* */}
          </ListItemIcon>
          <ListItemText>{t("my_listings", "My Listings")}</ListItemText>{" "}
          {/* Added t() for consistency */}
        </MenuItem>
        <MenuItem onClick={() => go("/saved")}>
          {" "}
          {/* */}
          <ListItemIcon>
            {" "}
            {/* */}
            <FavoriteIcon fontSize="small" /> {/* */}
          </ListItemIcon>
          <ListItemText>{t("nav_saved")}</ListItemText> {/* */}
        </MenuItem>
        {/* New Chat/Messages Link */}
        <MenuItem onClick={() => go("/chat")}>
          <ListItemIcon>
            {/* Replace 0 with actual unreadMessagesCount later */}
            <Badge
              badgeContent={0}
              color="error"
              variant="dot"
              invisible={true}
            >
              <ChatIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText>{t("nav_chat", "Chat")}</ListItemText>{" "}
          {/* Ensure "nav_chat" is in your i18n files */}
        </MenuItem>
        {user?.isAdmin && ( //
          <>
            <Divider sx={{ my: 0.5 }} /> {/* */}
            <MenuItem onClick={() => go("/admin/pending-approvals")}>
              {" "}
              {/* */}
              <ListItemIcon>
                {" "}
                {/* */}
                <AdminPanelSettingsIcon fontSize="small" /> {/* */}
              </ListItemIcon>
              <ListItemText>
                {t("admin_dashboard", "Admin Dashboard")}
              </ListItemText>{" "}
              {/* Added t() */}
            </MenuItem>
          </>
        )}
        <Divider sx={{ my: 0.5 }} /> {/* */}
        <MenuItem onClick={triggerLogout} sx={{ color: "error.main" }}>
          {" "}
          {/* */}
          <ListItemIcon>
            {" "}
            {/* */}
            <LogoutIcon fontSize="small" sx={{ color: "error.main" }} /> {/* */}
          </ListItemIcon>
          <ListItemText>{t("nav_logout")}</ListItemText> {/* */}
        </MenuItem>
      </Menu>
    </>
  );
}
