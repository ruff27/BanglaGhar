import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SellIcon from "@mui/icons-material/Sell";
import { styled } from "@mui/material/styles";

const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: "#0B1F23",
  fontWeight: 500,
  textTransform: "none",
  "&:hover": { backgroundColor: "rgba(43,123,140,0.08)" },
}));
const DropdownNavButton = styled(NavButton)({});
const ActiveNavButton = styled(NavButton)({
  color: "#2B7B8C",
  backgroundColor: "rgba(43,123,140,0.08)",
});
const LoginButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: "#2B7B8C",
  border: "2px solid #2B7B8C",
  textTransform: "none",
}));

export default function DesktopNav({
  navLinks,
  activeLink,
  onNavigate,
  onLogin,
  isLoggedIn,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const handlePropertiesClick = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);
  const handleSelect = (mode) => {
    navigate(`/properties/${mode}`);
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", ml: "auto", mr: 2 }}>
      {navLinks.map((link) =>
        link.hasDropdown ? (
          <Box key={link.id}>
            <DropdownNavButton
              onClick={handlePropertiesClick}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                fontWeight: location.pathname.startsWith("/properties")
                  ? 600
                  : 500,
              }}
            >
              {link.label}
            </DropdownNavButton>
            <Menu
              anchorEl={anchor}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <MenuItem onClick={() => handleSelect("buy")}>
                <HomeWorkIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "#2B7B8C" }}
                />
                Buy
              </MenuItem>
              <MenuItem onClick={() => handleSelect("rent")}>
                <ApartmentIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "#2B7B8C" }}
                />
                Rent
              </MenuItem>
              <MenuItem onClick={() => handleSelect("sold")}>
                <SellIcon fontSize="small" sx={{ mr: 1, color: "#2B7B8C" }} />
                Sold
              </MenuItem>
            </Menu>
          </Box>
        ) : activeLink === link.id ? (
          <ActiveNavButton
            key={link.id}
            component={RouterLink}
            to={link.path}
            onClick={() => onNavigate(link.path)}
          >
            {link.label}
          </ActiveNavButton>
        ) : (
          <NavButton
            key={link.id}
            component={RouterLink}
            to={link.path}
            onClick={() => onNavigate(link.path)}
          >
            {link.label}
          </NavButton>
        )
      )}
      {!isLoggedIn && <LoginButton onClick={onLogin}>Login</LoginButton>}
    </Box>
  );
}
