import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Button,
  useScrollTrigger,
  Slide,
  Container,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Badge,
  ListItemText,
  Avatar,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { styled, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../context/AuthContext";
import { useChatContext } from "../../features/chat/context/ChatContext";
import { getConversationsSummary as fetchConversationsSummaryForMenu } from "../../features/chat/services/chatService";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";
import LanguageToggle from "../common/LanguageToggle";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactsIcon from "@mui/icons-material/Contacts";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { useTranslation } from "react-i18next";
import UploadIdModal from "../../features/profile/components/UploadIdModal";
import Logo from '../../pictures/logo.png';


function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const NavbarContainer = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.9), //
  backdropFilter: "blur(10px)",
  boxShadow: "inset 0px -1px 1px #E5E5E5",
  color: theme.palette.text.primary,
}));

const Navbar = () => {
  const { isLoggedIn, user, logout, idToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [logoutSnackbar, setLogoutSnackbar] = useState(false);
  const [uploadIdModalOpen, setUploadIdModalOpen] = useState(false);

  const {
    totalUnreadMessages,
    unreadCounts,
    selectConversation,
    isChatLoading,
    detailedUnreadConversations,
    updateDetailedUnreadConversations,
  } = useChatContext();

  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [isFetchingMenuDetails, setIsFetchingMenuDetails] = useState(false);

  const navLinks = [
    { id: "home", label: t("nav_home"), path: "/", icon: <HomeIcon /> },
    {
      id: "properties",
      label: t("nav_properties"),
      path: "/properties/rent",
      icon: <HomeWorkIcon />,
    },
    { id: "about", label: t("nav_about"), path: "/about", icon: <InfoIcon /> },
    {
      id: "contact",
      label: t("nav_contact"),
      path: "/contact",
      icon: <ContactsIcon />,
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === "/") setActiveLink("home");
    else if (currentPath.startsWith("/properties")) setActiveLink("properties");
    else if (currentPath.startsWith("/about")) setActiveLink("about");
    else if (currentPath.startsWith("/contact")) setActiveLink("contact");
    else if (currentPath.startsWith("/list-property")) setActiveLink("");
    else setActiveLink("");
  }, [location.pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenUploadModal = () => setUploadIdModalOpen(true);
  const handleCloseUploadModal = () => setUploadIdModalOpen(false);

  const handleNavigate = (path) => {
    if (path === "/list-property") {
      handleListPropertyClick();
    } else {
      navigate(path);
    }
  };

  const handleListPropertyClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    switch (user.approvalStatus) {
      case "approved":
        navigate("/list-property");
        break;
      case "pending":
        alert(t("listing_pending_approval"));
        break;
      case "rejected":
        alert(t("listing_rejected_contact_support"));
        break;
      case "not_started":
      default:
        handleOpenUploadModal();
        break;
    }
  };

  const handleLogout = () => {
    logout();
    setLogoutSnackbar(true);
    navigate("/");
  };

  const handleCloseLogoutSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setLogoutSnackbar(false);
  };

  const handleNotificationIconClick = async (event) => {
    setNotificationAnchorEl(event.currentTarget);
    if (
      isLoggedIn &&
      idToken &&
      user?._id &&
      Object.keys(unreadCounts).length > 0
    ) {
      setIsFetchingMenuDetails(true);
      try {
        const summary = await fetchConversationsSummaryForMenu(idToken);
        updateDetailedUnreadConversations(summary, unreadCounts, user._id);
      } catch (error) {
        console.error(
          "Error fetching conversation details for notification menu:",
          error
        );
      } finally {
        setIsFetchingMenuDetails(false);
      }
    } else if (Object.keys(unreadCounts).length === 0) {
      // If there are no unread counts, clear detailed list
      updateDetailedUnreadConversations([], {}, user?._id || "");
    }
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationItemClick = (conversationId) => {
    selectConversation({ _id: conversationId });
    navigate(`/chat/${conversationId}`);
    handleNotificationMenuClose();
  };

  return (
    <>
      <HideOnScroll>
        <NavbarContainer position="sticky">
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
              <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <Box
                  component="img"
                  src={Logo}
                  alt="BanglaGhor Logo"
                  sx={{
                    height: { xs: 30, sm: 35, md: 40 },
                    marginRight: '10px',
                    objectFit: 'contain',
                  }}
                />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontWeight: 700,
                    color: "black",
                    textDecoration: "none",
                    cursor: "pointer",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  BanglaGhor
                </Typography>
              </RouterLink>

              {/* Desktop Navigation Area */}
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <DesktopNav
                  navLinks={navLinks}
                  activeLink={activeLink}
                  handleNavigate={handleNavigate}
                  onListPropertyClick={handleListPropertyClick}
                />
                {isLoggedIn && (
                  <IconButton
                    color="inherit"
                    onClick={handleNotificationIconClick}
                    disabled={isChatLoading && totalUnreadMessages === 0}
                    aria-label="show new notifications"
                    id="notification-button"
                  >
                    <Badge
                      badgeContent={isChatLoading ? "..." : totalUnreadMessages}
                      color="error"
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                )}
                <LanguageToggle />
                {isLoggedIn ? (
                  <ProfileMenu handleLogout={handleLogout} />
                ) : (
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: "text.primary",
                      ml: 1,
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {t("nav_login")}
                  </Button>
                )}
              </Box>
              {/* Mobile Navigation Area */}
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {isLoggedIn && (
                  <IconButton
                    color="inherit"
                    onClick={handleNotificationIconClick}
                    disabled={isChatLoading && totalUnreadMessages === 0}
                    aria-label="show new notifications"
                  >
                    <Badge
                      badgeContent={isChatLoading ? "..." : totalUnreadMessages}
                      color="error"
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                )}
                <LanguageToggle />
                {isLoggedIn ? (
                  <ProfileMenu handleLogout={handleLogout} />
                ) : (
                  <Button
                    component={RouterLink}
                    to="/login"
                    size="small"
                    sx={{
                      color: "text.primary",
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {t("nav_login")}
                  </Button>
                )}
                <IconButton
                  size="large"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                  color="inherit"
                  sx={{ ml: isLoggedIn ? 0 : "auto" }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </NavbarContainer>
      </HideOnScroll>

      {/* Notification Dropdown Menu */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        MenuListProps={{ "aria-labelledby": "notification-button" }}
        PaperProps={{
          elevation: 3,
          style: { maxHeight: 400, width: "320px", borderRadius: "8px" },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box
          sx={{
            pt: 1,
            pb: 0.5,
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {isFetchingMenuDetails && (
          <MenuItem disabled>
            <ListItemText primary="Loading..." sx={{ textAlign: "center" }} />
          </MenuItem>
        )}
        {!isFetchingMenuDetails && detailedUnreadConversations.length === 0 && (
          <MenuItem disabled>
            <ListItemText
              primary="No new messages"
              sx={{ textAlign: "center", color: "text.secondary" }}
            />
          </MenuItem>
        )}
        {!isFetchingMenuDetails &&
          detailedUnreadConversations.map((convo) => (
            <MenuItem
              key={convo.id}
              onClick={() => handleNotificationItemClick(convo.id)}
              sx={{ alignItems: "flex-start", py: 1.2 }}
            >
              <Avatar
                src={convo.profilePictureUrl}
                sx={{
                  width: 36,
                  height: 36,
                  mr: 1.5,
                  mt: 0.5,
                  fontSize: "1rem",
                }}
              >
                {convo.displayName?.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    component="span"
                  >
                    {convo.displayName}
                    {convo.count > 1 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                      >
                        {" "}
                        ({convo.count})
                      </Typography>
                    )}
                  </Typography>
                }
                secondary={convo.lastMessageText}
                primaryTypographyProps={{ noWrap: true, sx: { mb: 0.2 } }}
                secondaryTypographyProps={{ noWrap: true, fontSize: "0.8rem" }}
              />
            </MenuItem>
          ))}
      </Menu>

      <MobileDrawer
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        navLinks={navLinks}
        activeLink={activeLink}
        handleNavigate={handleNavigate}
        onListPropertyClick={handleListPropertyClick}
      />
      <UploadIdModal
        open={uploadIdModalOpen}
        onClose={handleCloseUploadModal}
      />
      <Snackbar
        open={logoutSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseLogoutSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseLogoutSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          {t("logout_successful", "Successfully logged out!")}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
