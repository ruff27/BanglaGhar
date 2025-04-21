// src/components/layout/DesktopNav.js
import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
// No longer need useAuth here as logic is passed down

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow:
    variant === "contained" ? "0 4px 14px rgba(43, 123, 140, 0.25)" : "none",
  transition: "all 0.3s ease",
  fontSize: "0.9rem",
  ...(variant === "contained" && {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(43, 123, 140, 0.3)",
    },
  }),
}));

// Accept onListPropertyClick prop from Navbar
const DesktopNav = ({
  navLinks,
  activeLink,
  handleNavigate,
  onListPropertyClick,
}) => {
  const navigate = useNavigate(); // Still needed for property dropdown
  const { t } = useTranslation();
  const [anchorElProperties, setAnchorElProperties] = useState(null);
  const openProperties = Boolean(anchorElProperties);

  const handleClickProperties = (event) =>
    setAnchorElProperties(event.currentTarget);
  const handleCloseProperties = () => setAnchorElProperties(null);
  const handlePropertyLink = (mode) => {
    // Use handleNavigate passed down for consistency if needed, or navigate directly
    navigate(`/properties/${mode}`);
    handleCloseProperties();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {navLinks.map((link) =>
        link.id === "properties" ? (
          <Box key={link.id}>
            <Button
              // ... (Properties dropdown button setup remains the same) ...
              id="properties-button"
              aria-controls={openProperties ? "properties-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openProperties ? "true" : undefined}
              onClick={handleClickProperties}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                color: "text.primary",
                textTransform: "none",
                fontWeight: activeLink === link.id ? 600 : 500,
                fontSize: "0.95rem",
                borderRadius: "8px",
                px: 1.5,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {link.label}
            </Button>
            <Menu
              // ... (Properties menu setup remains the same) ...
              id="properties-menu"
              anchorEl={anchorElProperties}
              open={openProperties}
              onClose={handleCloseProperties}
              MenuListProps={{ "aria-labelledby": "properties-button" }}
              PaperProps={{ elevation: 3, sx: { borderRadius: 2 } }}
            >
              <MenuItem
                onClick={() => handlePropertyLink("buy")}
                sx={{ fontSize: "0.95rem" }}
              >
                {t("nav_buy")}
              </MenuItem>
              <MenuItem
                onClick={() => handlePropertyLink("rent")}
                sx={{ fontSize: "0.95rem" }}
              >
                {t("nav_rent")}
              </MenuItem>
              <MenuItem
                onClick={() => handlePropertyLink("sold")}
                sx={{ fontSize: "0.95rem" }}
              >
                {t("nav_sold")}
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            // ... (Other nav links remain the same) ...
            key={link.id}
            component={RouterLink}
            to={link.path}
            sx={{
              color: "text.primary",
              textTransform: "none",
              fontWeight: activeLink === link.id ? 600 : 500,
              fontSize: "0.95rem",
              borderRadius: "8px",
              px: 1.5,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {link.label}
          </Button>
        )
      )}
      {/* Use the passed onListPropertyClick handler */}
      <StyledButton
        variant="contained"
        color="primary"
        onClick={onListPropertyClick} // Use the handler from props
        sx={{ ml: 2 }}
      >
        {t("list_property")}
      </StyledButton>
    </Box>
  );
};

export default DesktopNav;
