// src/components/layout/Navbar.js
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
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";
import LanguageToggle from "../common/LanguageToggle";
// Import icons
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactsIcon from "@mui/icons-material/Contacts";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { useTranslation } from "react-i18next";
// Import the UploadIdModal
import UploadIdModal from "../../features/profile/components/UploadIdModal"; // Adjust path

// --- Styling Components (Keep existing HideOnScroll, NavbarContainer) ---
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
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: "blur(10px)",
  boxShadow: "inset 0px -1px 1px #E5E5E5",
  color: theme.palette.text.primary,
}));
// --- End Styling ---

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth(); // Get user object which includes approvalStatus
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [logoutSnackbar, setLogoutSnackbar] = useState(false);
  // --- State for Upload ID Modal ---
  const [uploadIdModalOpen, setUploadIdModalOpen] = useState(false);

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

  // --- Handlers for Upload ID Modal ---
  const handleOpenUploadModal = () => setUploadIdModalOpen(true);
  const handleCloseUploadModal = () => setUploadIdModalOpen(false);

  // --- Modified Navigation Logic ---
  const handleNavigate = (path) => {
    if (path === "/list-property") {
      // Check approval status before navigating
      handleListPropertyClick();
    } else {
      navigate(path);
    }
  };

  // --- Logic for "List Property" click ---
  const handleListPropertyClick = () => {
    if (!user) {
      // Should ideally not happen if the button is shown only when logged in
      navigate("/login");
      return;
    }

    console.log("Checking approval status:", user.approvalStatus); // Debug log

    switch (user.approvalStatus) {
      case "approved":
        navigate("/list-property");
        break;
      case "pending":
        alert("Your listing request is pending admin approval."); // Use Snackbar for better UX later
        break;
      case "rejected":
        alert(
          "Your listing request has been rejected. Please contact support."
        );
        break;
      case "not_started":
      default:
        // Open the upload ID modal
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

  return (
    <>
      <HideOnScroll>
        <NavbarContainer position="sticky">
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
              {/* Logo */}
              <Typography
                variant="h5"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  color: "inherit",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                BanglaGhor
              </Typography>
              {/* Desktop Nav */}
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
                  // Pass the combined handler
                  handleNavigate={handleNavigate}
                  // Pass the specific list property handler for direct use
                  onListPropertyClick={handleListPropertyClick}
                />
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
              {/* // Mobile Nav Trigger & Actions */}
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  alignItems: "center",
                  gap: 0.5, // Add some gap if needed
                }}
              >
                <LanguageToggle />
                {isLoggedIn ? (
                  // If logged in, show ProfileMenu
                  <ProfileMenu handleLogout={handleLogout} />
                ) : (
                  // If not logged in, show Login button
                  <Button
                    component={RouterLink}
                    to="/login"
                    size="small" // Adjust size for mobile if needed
                    sx={{
                      color: "text.primary",
                      // ml: 1, // Use gap in Box instead of margin if preferred
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "action.hover" },
                      // Add padding if needed for better touch target
                      // p: 1
                    }}
                  >
                    {t("nav_login")}
                  </Button>
                )}
                {/* Keep the MenuIcon to open the drawer */}
                <IconButton
                  size="large"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                  color="inherit"
                  sx={{ ml: "auto" }} // Push icon to the right if Login button is present
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </NavbarContainer>
      </HideOnScroll>

      {/* Mobile Drawer */}
      <MobileDrawer
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        navLinks={navLinks}
        activeLink={activeLink}
        // Pass the combined handler
        handleNavigate={handleNavigate}
        // Pass the specific list property handler for direct use
        onListPropertyClick={handleListPropertyClick}
      />

      {/* Render the Upload ID Modal */}
      <UploadIdModal
        open={uploadIdModalOpen}
        onClose={handleCloseUploadModal}
      />

      {/* Logout Snackbar */}
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
          Successfully logged out!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
