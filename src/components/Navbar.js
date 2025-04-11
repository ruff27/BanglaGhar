import React, { useState, useEffect } from "react";
import LanguageToggle from "./LanguageToggle"; // correct path from components
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  useMediaQuery,
  Slide,
  useScrollTrigger,
  Tooltip,
  Badge,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactsIcon from "@mui/icons-material/Contacts";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SellIcon from "@mui/icons-material/Sell";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
// Import the logo directly
import logo from "../pictures/logo.png";
// Import auth context
import { useAuth } from "../pages/AuthContext";
//Import React i18
import { useTranslation } from "react-i18next";

// Custom styled components with enhanced design
const NavbarContainer = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#EFF9FE",
  boxShadow: "0 4px 12px rgba(43, 123, 140, 0.1)",
  position: "sticky",
  backdropFilter: "blur(8px)",
  borderBottom: "1px solid rgba(43, 123, 140, 0.08)",
  transition: "all 0.3s ease",
}));

const Logo = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(2),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: "#2B7B8C",
  fontWeight: 800,
  fontSize: "1.8rem",
  letterSpacing: "0.5px",
  backgroundImage: "linear-gradient(135deg, #2B7B8C 0%, #348F9C 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginLeft: theme.spacing(1),
  fontFamily: "'Poppins', sans-serif",
}));

const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: "#0B1F23",
  fontWeight: 500,
  fontSize: "1rem",
  textTransform: "none",
  padding: theme.spacing(1, 2),
  borderRadius: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.08)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(43, 123, 140, 0.1)",
  },
}));

const DropdownNavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: "#0B1F23",
  fontWeight: 500,
  fontSize: "1rem",
  textTransform: "none",
  padding: theme.spacing(1, 2),
  borderRadius: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.08)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(43, 123, 140, 0.1)",
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: "#2B7B8C",
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  padding: theme.spacing(1, 2),
  borderRadius: "8px",
  border: "2px solid #2B7B8C",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.08)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(43, 123, 140, 0.1)",
  },
}));

const ActiveNavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: "#2B7B8C",
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  padding: theme.spacing(1, 2),
  borderRadius: "8px",
  backgroundColor: "rgba(43, 123, 140, 0.08)",
  boxShadow: "0 4px 8px rgba(43, 123, 140, 0.1)",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "6px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "20px",
    height: "3px",
    backgroundColor: "#2B7B8C",
    borderRadius: "10px",
  },
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.12)",
    transform: "translateY(-2px)",
  },
}));

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  backgroundColor: alpha("#EFF9FE", 0.8),
  borderRadius: "12px",
  border: "1px solid rgba(43, 123, 140, 0.15)",
  boxShadow: "0 2px 6px rgba(43, 123, 140, 0.05)",
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: "100%",
  maxWidth: "300px",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 10px rgba(43, 123, 140, 0.1)",
    border: "1px solid rgba(43, 123, 140, 0.3)",
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
  display: "flex",
  alignItems: "center",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2B7B8C",
}));

const StyledInputBase = styled("input")(({ theme }) => ({
  padding: theme.spacing(1.5, 1.5, 1.5, 0),
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  transition: theme.transitions.create("width"),
  width: "100%",
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  color: "#0B1F23",
  fontSize: "0.95rem",
  "&::placeholder": {
    color: "#BFBBB8",
    opacity: 0.7,
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: "300px",
    backgroundColor: "#EFF9FE",
    color: "#0B1F23",
    borderTopLeftRadius: "20px",
    borderBottomLeftRadius: "20px",
    boxShadow: "-5px 0 15px rgba(0, 0, 0, 0.05)",
    padding: theme.spacing(2, 0),
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 3),
  justifyContent: "space-between",
  borderBottom: "1px solid rgba(191, 187, 184, 0.1)",
  marginBottom: theme.spacing(2),
}));

const DrawerItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: "12px",
  margin: theme.spacing(0.8, 2),
  padding: theme.spacing(1.2, 2),
  color: active ? "#2B7B8C" : "#0B1F23",
  backgroundColor: active ? "rgba(43, 123, 140, 0.08)" : "transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.05)",
    transform: "translateX(5px)",
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  color: "#2B7B8C",
  backgroundColor: "rgba(43, 123, 140, 0.05)",
  borderRadius: "10px",
  padding: theme.spacing(1),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.1)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(43, 123, 140, 0.15)",
  },
}));

const ProfileButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  padding: theme.spacing(0.5, 1),
  borderRadius: "12px",
  marginLeft: theme.spacing(1),
  transition: "all 0.2s ease",
  border: "1px solid rgba(43, 123, 140, 0.15)",
  "&:hover": {
    backgroundColor: "rgba(43, 123, 140, 0.05)",
    border: "1px solid rgba(43, 123, 140, 0.3)",
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#2B7B8C",
    color: "white",
    fontWeight: "bold",
    boxShadow: "0 0 0 2px #EFF9FE",
  },
}));

// Hide navbar on scroll with smoother animation
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    threshold: 100, // Only hide after scrolling 100px
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation(); //Initialise translation

  // Use the auth context
  const { isLoggedIn, user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [propertiesAnchorEl, setPropertiesAnchorEl] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [logoutSnackbar, setLogoutSnackbar] = useState(false);

  const propertiesMenuOpen = Boolean(propertiesAnchorEl);
  const profileOpen = Boolean(profileAnchor);

  // Use location to determine active link
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("home");

  // Update active link based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/home") {
      setActiveLink("home");
    } else if (path.includes("/properties")) {
      setActiveLink("properties");
    } else if (path.includes("/about")) {
      setActiveLink("about");
    } else if (path.includes("/contact")) {
      setActiveLink("contact");
    }
  }, [location]);

  const navLinks = [
    { id: "home", label: t("nav_home"), path: "/", icon: <HomeIcon /> },
    {
      id: "properties",
      label: t("nav_properties"),
      path: "/properties",
      icon: <HomeWorkIcon />,
      hasDropdown: true,
    },
    { id: "about", label: t("nav_about"), path: "/about", icon: <InfoIcon /> },
    {
      id: "contact",
      label: t("nav_contact"),
      path: "/contact",
      icon: <ContactsIcon />,
    },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavLinkClick = (linkId) => {
    setActiveLink(linkId);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handlePropertiesClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setPropertiesAnchorEl(propertiesAnchorEl ? null : event.currentTarget);
  };

  const handlePropertiesClose = () => {
    setPropertiesAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setProfileAnchor(null);
    setLogoutSnackbar(true);

    // Redirect to home page after logout
    navigate("/");
  };

  // Close logout snackbar
  const handleCloseLogoutSnackbar = () => {
    setLogoutSnackbar(false);
  };

  // Handle login button click
  const handleLoginClick = () => {
    navigate("/login");
  };

  // Change navbar style when scrolling
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <HideOnScroll>
        <NavbarContainer
          sx={{
            boxShadow: scrolled
              ? "0 4px 20px rgba(43, 123, 140, 0.15)"
              : "0 4px 12px rgba(43, 123, 140, 0.05)",
            py: scrolled ? 0.5 : 1,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{ minHeight: { xs: "64px", md: "70px" } }}
            >
              {/* Logo and brand text */}
              <Logo>
                <Link
                  to="/"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="BanglaGhor Logo"
                    sx={{
                      width: 40,
                      height: 40,
                      display: { xs: "none", sm: "block" },
                    }}
                  />
                  <LogoText variant="h6">BanglaGhor</LogoText>
                </Link>
              </Logo>

              {/* Desktop navigation */}
              {!isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    ml: "auto",
                    mr: 2,
                  }}
                >
                  {navLinks.map((link) =>
                    link.hasDropdown ? (
                      <Box key={link.id}>
                        <DropdownNavButton
                          id="properties-dropdown-button"
                          aria-controls={
                            propertiesMenuOpen ? "properties-menu" : undefined
                          }
                          aria-haspopup="true"
                          aria-expanded={
                            propertiesMenuOpen ? "true" : undefined
                          }
                          onClick={handlePropertiesClick}
                          endIcon={<KeyboardArrowDownIcon />}
                          sx={{
                            backgroundColor: propertiesMenuOpen
                              ? "rgba(43, 123, 140, 0.08)"
                              : "transparent",
                          }}
                        >
                          {link.label}
                        </DropdownNavButton>
                        <Menu
                          id="properties-menu"
                          anchorEl={propertiesAnchorEl}
                          open={propertiesMenuOpen}
                          onClose={handlePropertiesClose}
                          onClick={handlePropertiesClose}
                          MenuListProps={{
                            "aria-labelledby": "properties-dropdown-button",
                          }}
                          PaperProps={{
                            elevation: 3,
                            sx: {
                              mt: 1.5,
                              borderRadius: "12px",
                              minWidth: "200px",
                              boxShadow: "0 8px 16px rgba(43, 123, 140, 0.15)",
                              "& .MuiList-root": {
                                padding: theme.spacing(1),
                              },
                            },
                          }}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                          }}
                        >
                          <MenuItem
                            component={Link}
                            to="/properties/buy"
                            onClick={handlePropertiesClose}
                            sx={{ borderRadius: "8px", py: 1 }}
                          >
                            <ListItemIcon>
                              <HomeWorkIcon
                                fontSize="small"
                                sx={{ color: "#2B7B8C" }}
                              />
                            </ListItemIcon>
                            <ListItemText>{t("nav_buy")}</ListItemText>
                          </MenuItem>
                          <MenuItem
                            component={Link}
                            to="/properties/rent"
                            onClick={handlePropertiesClose}
                            sx={{ borderRadius: "8px", py: 1 }}
                          >
                            <ListItemIcon>
                              <ApartmentIcon
                                fontSize="small"
                                sx={{ color: "#2B7B8C" }}
                              />
                            </ListItemIcon>
                            <ListItemText>{t("nav_rent")}</ListItemText>
                          </MenuItem>
                          <MenuItem
                            component={Link}
                            to="/properties/sold"
                            onClick={handlePropertiesClose}
                            sx={{ borderRadius: "8px", py: 1 }}
                          >
                            <ListItemIcon>
                              <SellIcon
                                fontSize="small"
                                sx={{ color: "#2B7B8C" }}
                              />
                            </ListItemIcon>
                            <ListItemText>{t("nav_sold")}</ListItemText>
                          </MenuItem>
                        </Menu>
                      </Box>
                    ) : activeLink === link.id ? (
                      <ActiveNavButton
                        key={link.id}
                        component={Link}
                        to={link.path}
                        onClick={() => handleNavLinkClick(link.id)}
                      >
                        {link.label}
                      </ActiveNavButton>
                    ) : (
                      <NavButton
                        key={link.id}
                        component={Link}
                        to={link.path}
                        onClick={() => handleNavLinkClick(link.id)}
                      >
                        {link.label}
                      </NavButton>
                    )
                  )}

                  {/* Login/Logout Button */}
                  {isLoggedIn ? null : ( // Already logged in - show profile
                    // Not logged in - show login button
                    <LoginButton
                      onClick={handleLoginClick}
                      startIcon={<LoginIcon />}
                    >
                      {t("nav_login")}
                    </LoginButton>
                  )}
                </Box>
              )}

              {/* Action icons */}
              <IconContainer>
                {/* Profile Button - Only show if logged in */}
                {!isMobile && isLoggedIn && (
                  <ProfileButton onClick={handleProfileClick}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: "#2B7B8C",
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : "A"}{" "}
                      {/* Dynamic initial */}
                    </Avatar>
                    <Box sx={{ ml: 1, display: { xs: "none", md: "block" } }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, lineHeight: 1.2 }}
                      >
                        {user?.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#BFBBB8", lineHeight: 1 }}
                      >
                        Account
                      </Typography>
                    </Box>
                    <KeyboardArrowDownIcon
                      sx={{ ml: 0.5, fontSize: "1.2rem", color: "#BFBBB8" }}
                    />
                  </ProfileButton>
                )}

                {/* Profile Menu */}
                <Menu
                  anchorEl={profileAnchor}
                  open={profileOpen}
                  onClose={handleProfileClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      borderRadius: "12px",
                      overflow: "visible",
                      minWidth: "200px",
                      boxShadow: "0 8px 16px rgba(43, 123, 140, 0.15)",
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                      },
                      "& .MuiList-root": {
                        padding: theme.spacing(1),
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleProfileClose}
                    sx={{ borderRadius: "8px" }}
                  >
                    <ListItemIcon>
                      <AccountCircleIcon
                        fontSize="small"
                        sx={{ color: "#2B7B8C" }}
                      />
                    </ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/saved"
                    onClick={handleProfileClose}
                    sx={{ borderRadius: "8px" }}
                  >
                    <ListItemIcon>
                      <FavoriteIcon
                        fontSize="small"
                        sx={{ color: "#2B7B8C" }}
                      />
                    </ListItemIcon>
                    <ListItemText>Saved Properties</ListItemText>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout} sx={{ borderRadius: "8px" }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: "#d32f2f" }} />
                    </ListItemIcon>
                    <ListItemText sx={{ color: "#d32f2f" }}>
                      {t("nav_logout")}
                    </ListItemText>
                  </MenuItem>
                </Menu>

                <LanguageToggle />

                {/* Mobile menu button */}
                {isMobile && (
                  <IconButton
                    edge="end"
                    onClick={handleDrawerToggle}
                    sx={{
                      color: "#2B7B8C",
                      backgroundColor: "rgba(43, 123, 140, 0.05)",
                      borderRadius: "10px",
                      ml: 1,
                      "&:hover": {
                        backgroundColor: "rgba(43, 123, 140, 0.1)",
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
              </IconContainer>
            </Toolbar>
          </Container>

          {/* Mobile drawer */}
          <MobileDrawer
            anchor="right"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            variant="temporary"
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
          >
            <DrawerHeader>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#2B7B8C" }}
              >
                BanglaGhor
              </Typography>
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  color: "#2B7B8C",
                  borderRadius: "10px",
                  backgroundColor: "rgba(43, 123, 140, 0.05)",
                  "&:hover": {
                    backgroundColor: "rgba(43, 123, 140, 0.1)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DrawerHeader>

            {/* Mobile Search removed */}

            <Divider sx={{ opacity: 0.5 }} />

            {/* User Info in Drawer */}
            {isLoggedIn ? (
              <Box sx={{ px: 3, py: 2 }}>
                <DrawerItem
                  button
                  onClick={() => {
                    setProfileAnchor(
                      profileAnchor
                        ? null
                        : document.getElementById("mobile-user-item")
                    );
                  }}
                  id="mobile-user-item"
                  sx={{ my: 0 }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#2B7B8C",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      mr: 2,
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}{" "}
                    {/* Dynamic initial */}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#BFBBB8" }}>
                      Logged In
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon
                    sx={{
                      color: "#BFBBB8",
                      transform: Boolean(profileAnchor)
                        ? "rotate(180deg)"
                        : "rotate(0)",
                      transition: "transform 0.3s",
                    }}
                  />
                </DrawerItem>

                <Collapse
                  in={Boolean(profileAnchor)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ mt: 1 }}>
                    <ListItem
                      button
                      component={Link}
                      to="/profile"
                      sx={{ pl: 6, py: 1, borderRadius: "8px", mx: 2, my: 0.5 }}
                      onClick={() => {
                        setProfileAnchor(null);
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: "35px" }}>
                        <AccountCircleIcon
                          fontSize="small"
                          sx={{ color: "#2B7B8C" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={t("nav_profile")} />
                    </ListItem>
                    <ListItem
                      button
                      component={Link}
                      to="/saved"
                      sx={{ pl: 6, py: 1, borderRadius: "8px", mx: 2, my: 0.5 }}
                      onClick={() => {
                        setProfileAnchor(null);
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: "35px" }}>
                        <FavoriteIcon
                          fontSize="small"
                          sx={{ color: "#2B7B8C" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={t("nav_saved")} />
                    </ListItem>
                    <ListItem
                      button
                      sx={{ pl: 6, py: 1, borderRadius: "8px", mx: 2, my: 0.5 }}
                      onClick={() => {
                        setProfileAnchor(null);
                        setDrawerOpen(false);
                        handleLogout();
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: "35px" }}>
                        <LogoutIcon
                          fontSize="small"
                          sx={{ color: "#d32f2f" }}
                        />
                      </ListItemIcon>
                      <ListItemText sx={{ color: "#d32f2f" }}>
                        {t("nav_logout")}
                      </ListItemText>
                    </ListItem>
                  </List>
                </Collapse>
              </Box>
            ) : (
              // Login button for mobile when not logged in
              <Box sx={{ px: 3, py: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<LoginIcon />}
                  component={Link}
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderWidth: "2px",
                    "&:hover": {
                      borderWidth: "2px",
                      backgroundColor: "rgba(43, 123, 140, 0.05)",
                    },
                  }}
                >
                  Login
                </Button>
              </Box>
            )}

            <Divider sx={{ opacity: 0.5, mb: 1 }} />

            {/* Navigation Items */}
            <List sx={{ pt: 1 }}>
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <React.Fragment key={link.id}>
                    <DrawerItem
                      button
                      onClick={() => {
                        if (link.hasDropdown) {
                          setPropertiesAnchorEl(
                            propertiesAnchorEl
                              ? null
                              : document.getElementById(
                                  "mobile-properties-item"
                                )
                          );
                        } else {
                          handleNavLinkClick(link.id);
                        }
                      }}
                      id="mobile-properties-item"
                    >
                      <ListItemIcon
                        sx={{
                          color: activeLink === link.id ? "#2B7B8C" : "#BFBBB8",
                          minWidth: "40px",
                          "& .MuiSvgIcon-root": {
                            fontSize: "1.25rem",
                          },
                        }}
                      >
                        {link.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={link.label}
                        primaryTypographyProps={{
                          fontWeight: activeLink === link.id ? 600 : 500,
                          fontSize: "1rem",
                        }}
                      />
                      <KeyboardArrowDownIcon
                        sx={{
                          color: "#BFBBB8",
                          transform: Boolean(propertiesAnchorEl)
                            ? "rotate(180deg)"
                            : "rotate(0)",
                          transition: "transform 0.3s",
                        }}
                      />
                    </DrawerItem>

                    <Collapse
                      in={Boolean(propertiesAnchorEl)}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          component={Link}
                          to="/properties/buy"
                          sx={{
                            pl: 6,
                            py: 1,
                            borderRadius: "8px",
                            mx: 2,
                            my: 0.5,
                          }}
                          onClick={() => {
                            setPropertiesAnchorEl(null);
                            handleNavLinkClick(link.id);
                            setDrawerOpen(false);
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: "35px" }}>
                            <HomeWorkIcon
                              fontSize="small"
                              sx={{ color: "#2B7B8C" }}
                            />
                          </ListItemIcon>
                          <ListItemText primary="Buy" />
                        </ListItem>
                        <ListItem
                          button
                          component={Link}
                          to="/properties/rent"
                          sx={{
                            pl: 6,
                            py: 1,
                            borderRadius: "8px",
                            mx: 2,
                            my: 0.5,
                          }}
                          onClick={() => {
                            setPropertiesAnchorEl(null);
                            handleNavLinkClick(link.id);
                            setDrawerOpen(false);
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: "35px" }}>
                            <ApartmentIcon
                              fontSize="small"
                              sx={{ color: "#2B7B8C" }}
                            />
                          </ListItemIcon>
                          <ListItemText primary="Rent" />
                        </ListItem>
                        <ListItem
                          button
                          component={Link}
                          to="/properties/sold"
                          sx={{
                            pl: 6,
                            py: 1,
                            borderRadius: "8px",
                            mx: 2,
                            my: 0.5,
                          }}
                          onClick={() => {
                            setPropertiesAnchorEl(null);
                            handleNavLinkClick(link.id);
                            setDrawerOpen(false);
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: "35px" }}>
                            <SellIcon
                              fontSize="small"
                              sx={{ color: "#2B7B8C" }}
                            />
                          </ListItemIcon>
                          <ListItemText primary="Sold" />
                        </ListItem>
                      </List>
                    </Collapse>
                  </React.Fragment>
                ) : (
                  <DrawerItem
                    key={link.id}
                    active={activeLink === link.id ? 1 : 0}
                    onClick={() => handleNavLinkClick(link.id)}
                    button
                    component={Link}
                    to={link.path}
                  >
                    <ListItemIcon
                      sx={{
                        color: activeLink === link.id ? "#2B7B8C" : "#BFBBB8",
                        minWidth: "40px",
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.25rem",
                        },
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        fontWeight: activeLink === link.id ? 600 : 500,
                        fontSize: "1rem",
                      }}
                    />
                  </DrawerItem>
                )
              )}
            </List>
          </MobileDrawer>
        </NavbarContainer>
      </HideOnScroll>

      {/* Logout success snackbar */}
      <Snackbar
        open={logoutSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseLogoutSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseLogoutSnackbar}
          severity="success"
          sx={{
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(43, 123, 140, 0.2)",
          }}
        >
          Successfully logged out!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
