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
  Badge,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChatContext } from "../../features/chat/context/ChatContext";
import { useTranslation } from "react-i18next";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

export default function ProfileMenu({ handleLogout }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalUnreadMessages, isChatLoading } = useChatContext();
  const { t } = useTranslation();

  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const go = (path) => {
    navigate(path);
    handleClose();
  };

  const triggerLogout = () => {
    if (handleLogout) {
      handleLogout();
    }
    handleClose();
  };

  const badgeInvisible = isChatLoading || totalUnreadMessages < 1;
  const badgeContent = isChatLoading ? 0 : totalUnreadMessages; 

  return (
    <>
      <Tooltip title={t("account_tooltip", "Account")}>
        <IconButton onClick={handleOpen} sx={{ p: 0, ml: 2 }}>
          <Badge
            badgeContent={badgeContent}
            color="error"
            overlap="circular"
            invisible={badgeInvisible}
          >
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {(
                user?.displayName?.charAt(0) ||
                user?.name?.charAt(0) ||
                "U"
              )
                ?.toUpperCase()}
            </Avatar>
          </Badge>
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
            minWidth: 220, 
            overflow: "visible",
            "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => go("/user-profile")}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("nav_profile")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => go("/my-listings")}>
          <ListItemIcon>
            <HomeWorkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("my_listings", "My Listings")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => go("/saved")}>
          <ListItemIcon>
            <FavoriteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("nav_saved")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => go("/chat")}>
          <ListItemIcon>
            <Badge
              badgeContent={badgeContent}
              color="error"
              invisible={badgeInvisible}
            >
              <ChatIcon fontSize="small" />
            </Badge>
          </ListItemIcon>
          <ListItemText>{t("nav_chat", "Chat")}</ListItemText>
        </MenuItem>
        {user?.isAdmin && [
          <Divider sx={{ my: 0.5 }} key="admin-divider" />,
          <MenuItem
            onClick={() => go("/admin/pending-approvals")}
            key="admin-dashboard-link"
          >
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {t("admin_dashboard", "Admin Dashboard")}
            </ListItemText>
          </MenuItem>,
        ]}
        <Divider sx={{ my: 0.5 }} />
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
