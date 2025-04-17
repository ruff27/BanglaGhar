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
  Alert, // Added Snackbar, Alert
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles"; // Ensure alpha is imported if needed by sub-components passed down
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom"; // Added RouterLink
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";
import LanguageToggle from "../common/LanguageToggle";
// Import icons for navLinks if defined here (or pass them down)
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactsIcon from "@mui/icons-material/Contacts";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

// --- Re-introduce styling from original Navbar.js ---

// 1. HideOnScroll component (if used in original)
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// 2. NavbarContainer styled component (matches original)
const NavbarContainer = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.9), // Use theme background with alpha
  backdropFilter: "blur(10px)",
  boxShadow: "inset 0px -1px 1px #E5E5E5", // Match original shadow
  color: theme.palette.text.primary, // Use theme text color
}));

// --- End of re-introduced styling ---

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [logoutSnackbar, setLogoutSnackbar] = useState(false); // State for logout notification

  // Define nav links data (add icons as used in original MobileDrawer)
  const navLinks = [
    { id: "home", label: "Home", path: "/", icon: <HomeIcon /> },
    {
      id: "properties",
      label: "Properties",
      path: "/properties/rent",
      icon: <HomeWorkIcon />,
    }, // Path is placeholder for dropdown trigger
    { id: "about", label: "About Us", path: "/about", icon: <InfoIcon /> },
    {
      id: "contact",
      label: "Contact",
      path: "/contact",
      icon: <ContactsIcon />,
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    // More robust active link detection
    if (currentPath === "/") setActiveLink("home");
    else if (currentPath.startsWith("/properties")) setActiveLink("properties");
    else if (currentPath.startsWith("/about")) setActiveLink("about");
    else if (currentPath.startsWith("/contact")) setActiveLink("contact");
    else setActiveLink(""); // No active link
  }, [location.pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleNavigate = (path) => navigate(path);

  const handleLogout = () => {
    logout();
    setLogoutSnackbar(true); // Show snackbar on logout
    navigate("/");
  };

  const handleCloseLogoutSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setLogoutSnackbar(false);
  };

  return (
    <>
      {/* Use HideOnScroll and NavbarContainer */}
      <HideOnScroll>
        <NavbarContainer position="sticky">
          {/* Use Container for max width and centering */}
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
              {/* Logo/Brand */}
              <Typography
                variant="h5" // Adjusted variant
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

              {/* Desktop Navigation & Actions */}
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
                />
                <LanguageToggle />
                {isLoggedIn ? (
                  <ProfileMenu handleLogout={handleLogout} />
                ) : (
                  // Use RouterLink for login button for consistency
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: "text.primary", // Use theme text color
                      ml: 1,
                      textTransform: "none",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    Login
                  </Button>
                )}
              </Box>

              {/* Mobile Menu Button & Actions */}
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  alignItems: "center",
                }}
              >
                <LanguageToggle />
                {isLoggedIn && <ProfileMenu handleLogout={handleLogout} />}
                <IconButton
                  size="large"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                  color="inherit" // Use inherit color
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
        handleNavigate={handleNavigate}
        // Pass other necessary props like isLoggedIn for conditional rendering inside drawer
      />

      {/* Logout success snackbar (from original) */}
      <Snackbar
        open={logoutSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseLogoutSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseLogoutSnackbar}
          severity="success"
          variant="filled" // Make it stand out more
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          Successfully logged out!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
