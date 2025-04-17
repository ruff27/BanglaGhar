import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, IconButton, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";
import LanguageToggle from "../common/LanguageToggle";
import logo from "../../pictures/logo.png";
import HideOnScroll from "./HideOnScroll";

const NavbarContainer = styled(AppBar)({
  backgroundColor: "#EFF9FE",
  backdropFilter: "blur(8px)",
  boxShadow: "0 4px 12px rgba(43,123,140,0.1)",
});
const Logo = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  marginRight: theme.spacing(2),
}));
const LogoText = styled("span")(({ theme }) => ({
  color: "#2B7B8C",
  fontWeight: 800,
  marginLeft: theme.spacing(1),
  fontSize: "1.5rem",
}));

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  const navLinks = [
    { id: "home", label: t("nav_home"), path: "/", icon: <MenuIcon /> },
    {
      id: "properties",
      label: t("nav_properties"),
      path: "/properties",
      icon: <MenuIcon />,
      hasDropdown: true,
    },
    { id: "about", label: t("nav_about"), path: "/about", icon: <MenuIcon /> },
    {
      id: "contact",
      label: t("nav_contact"),
      path: "/contact",
      icon: <MenuIcon />,
    },
  ];

  // sync activeLink with URL
  useEffect(() => {
    const p = location.pathname;
    if (p === "/" || p.startsWith("/home")) setActiveLink("home");
    else if (p.startsWith("/properties")) setActiveLink("properties");
    else if (p.startsWith("/about")) setActiveLink("about");
    else if (p.startsWith("/contact")) setActiveLink("contact");
  }, [location.pathname]);

  const handleNavigate = (path) => navigate(path);
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <HideOnScroll>
        <NavbarContainer position="sticky">
          <Container maxWidth="xl">
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <Logo onClick={() => navigate("/")}>
                <img src={logo} alt="Logo" width={36} height={36} />
                <LogoText>BanglaGhor</LogoText>
              </Logo>

              {/* Desktop */}
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                }}
              >
                <DesktopNav
                  navLinks={navLinks}
                  activeLink={activeLink}
                  onNavigate={handleNavigate}
                  onLogin={() => navigate("/login")}
                  isLoggedIn={isLoggedIn}
                />
                <LanguageToggle />
                {isLoggedIn ? (
                  <ProfileMenu user={user} onLogout={handleLogout} />
                ) : null}
              </Box>

              {/* Mobile */}
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  alignItems: "center",
                }}
              >
                <LanguageToggle />
                {isLoggedIn && (
                  <ProfileMenu user={user} onLogout={handleLogout} />
                )}
                <IconButton onClick={() => setMobileOpen((open) => !open)}>
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </NavbarContainer>
      </HideOnScroll>

      <MobileDrawer
        open={mobileOpen}
        onToggle={() => setMobileOpen((open) => !open)}
        navLinks={navLinks}
        activeLink={activeLink}
        onNavigate={(path) => {
          navigate(path);
          setMobileOpen(false);
        }}
      />
    </>
  );
}
