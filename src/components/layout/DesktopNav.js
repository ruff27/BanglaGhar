import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom"; // Removed useLocation as activeLink is passed
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { styled } from "@mui/material/styles"; // Import styled
import { useTranslation } from "react-i18next"; // Import useTranslation

// Re-introduce StyledButton definition (consider moving to shared location later)
const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow:
    variant === "contained" ? "0 4px 14px rgba(43, 123, 140, 0.25)" : "none",
  transition: "all 0.3s ease",
  fontSize: "0.9rem", // Adjusted size slightly for navbar
  ...(variant === "contained" && {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      transform: "translateY(-2px)", // Less lift
      boxShadow: "0 6px 16px rgba(43, 123, 140, 0.3)",
    },
  }),
  // Add other variants if needed
}));

const DesktopNav = ({ navLinks, activeLink, handleNavigate }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation
  const [anchorElProperties, setAnchorElProperties] = useState(null);
  const openProperties = Boolean(anchorElProperties);

  const handleClickProperties = (event) =>
    setAnchorElProperties(event.currentTarget);
  const handleCloseProperties = () => setAnchorElProperties(null);
  const handlePropertyLink = (mode) => {
    navigate(`/properties/${mode}`);
    handleCloseProperties();
  };

  return (
    // Match original Box styling for desktop links
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {navLinks.map((link) =>
        link.id === "properties" ? (
          <Box key={link.id}>
            <Button
              id="properties-button"
              aria-controls={openProperties ? "properties-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openProperties ? "true" : undefined}
              onClick={handleClickProperties}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                color: "text.primary", // Use theme text color
                textTransform: "none",
                fontWeight: activeLink === link.id ? 600 : 500, // Active link styling
                fontSize: "0.95rem",
                borderRadius: "8px",
                px: 1.5, // Adjust padding
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {link.label} {/* Label is already translated in Navbar.js */}
            </Button>
            <Menu
              id="properties-menu"
              anchorEl={anchorElProperties}
              open={openProperties}
              onClose={handleCloseProperties}
              MenuListProps={{ "aria-labelledby": "properties-button" }}
              PaperProps={{ elevation: 3, sx: { borderRadius: 2 } }} // Style menu paper
            >
              <MenuItem
                onClick={() => handlePropertyLink("buy")}
                sx={{ fontSize: "0.95rem" }}
              >
                {t("nav_buy")} {/* Applied translation */}
              </MenuItem>
              <MenuItem
                onClick={() => handlePropertyLink("rent")}
                sx={{ fontSize: "0.95rem" }}
              >
                {t("nav_rent")} {/* Applied translation */}
              </MenuItem>
              <MenuItem
                onClick={() => handlePropertyLink("sold")}
                sx={{ fontSize: "0.95rem" }}
              >
                {t("nav_sold")} {/* Applied translation */}
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            key={link.id}
            component={RouterLink}
            to={link.path}
            sx={{
              color: "text.primary", // Use theme text color
              textTransform: "none",
              fontWeight: activeLink === link.id ? 600 : 500, // Active link styling
              fontSize: "0.95rem",
              borderRadius: "8px",
              px: 1.5, // Adjust padding
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {link.label} {/* Label is already translated in Navbar.js */}
          </Button>
        )
      )}
      {/* Use StyledButton for List Property */}
      <StyledButton
        variant="contained"
        color="primary"
        onClick={() => navigate("/list-property")}
        sx={{ ml: 2 }} // Margin left
      >
        {t("list_property")} {/* Applied translation */}
      </StyledButton>
    </Box>
  );
};

export default DesktopNav;
