import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink, useLocation } from "react-router-dom"; // Import useLocation
// Import necessary icons if passed via navLinks or define here
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactsIcon from "@mui/icons-material/Contacts";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import AddBusinessIcon from "@mui/icons-material/AddBusiness"; // Example for List Property
import SellIcon from "@mui/icons-material/Sell"; // Example for Buy/Rent/Sold
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// --- Re-introduce styling from original Navbar.js ---
const DrawerItem = styled(ListItemButton)(({ theme, selected }) => ({
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  marginBottom: theme.spacing(0.5),
  borderRadius: "8px",
  margin: theme.spacing(0, 1), // Add horizontal margin
  backgroundColor: selected ? theme.palette.action.selected : "transparent",
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.action.selected
      : theme.palette.action.hover,
  },
  // Style for the icon when selected
  "& .MuiListItemIcon-root": {
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary, // Use primary color when selected
    minWidth: "40px", // Original minWidth
  },
  // Style for the text when selected
  "& .MuiListItemText-primary": {
    fontWeight: selected ? 600 : 500, // Original fontWeight logic
    color: selected ? theme.palette.primary.main : theme.palette.text.primary, // Use primary color when selected
  },
}));
// --- End of re-introduced styling ---

const MobileDrawer = ({
  mobileOpen,
  handleDrawerToggle,
  navLinks,
  activeLink,
  handleNavigate,
}) => {
  const drawerWidth = 260;
  const location = useLocation(); // Get location object using the hook

  const handleLinkClick = (path) => {
    handleNavigate(path);
    handleDrawerToggle(); // Close drawer on link click
  };

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }} // Better open performance on mobile.
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: drawerWidth,
          borderTopRightRadius: 16, // Original radius
          borderBottomRightRadius: 16,
          boxShadow: 3, // Add some shadow
          border: "none", // Remove default border if needed
        },
      }}
    >
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Match logo style from Navbar */}
          <Typography
            variant="h5"
            onClick={() => handleLinkClick("/")}
            sx={{
              cursor: "pointer",
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            BanglaGhor
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
      </Box>
      <List sx={{ px: 1 }}>
        {" "}
        {/* Add padding to list container */}
        {/* Main Nav Links */}
        {navLinks.map(
          (link) =>
            link.id !== "properties" && ( // Render non-dropdown links directly
              <ListItem key={link.id} disablePadding>
                {/* Use DrawerItem styled component */}
                <DrawerItem
                  component={RouterLink}
                  to={link.path}
                  selected={activeLink === link.id} // Use activeLink prop passed down
                  onClick={handleDrawerToggle} // Close drawer on link click
                >
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.label} />
                </DrawerItem>
              </ListItem>
            )
        )}
        {/* Properties Links (Buy/Rent/Sold) */}
        <Divider sx={{ my: 1 }} />
        <Typography
          variant="caption"
          sx={{ pl: 3, color: "text.secondary", textTransform: "uppercase" }}
        >
          Properties
        </Typography>
        <ListItem disablePadding>
          {/* Use location object from the hook */}
          <DrawerItem
            selected={location.pathname.startsWith("/properties/buy")}
            onClick={() => handleLinkClick("/properties/buy")}
          >
            <ListItemIcon>
              <StorefrontIcon />
            </ListItemIcon>
            <ListItemText primary="Buy" />
          </DrawerItem>
        </ListItem>
        <ListItem disablePadding>
          {/* Use location object from the hook */}
          <DrawerItem
            selected={location.pathname.startsWith("/properties/rent")}
            onClick={() => handleLinkClick("/properties/rent")}
          >
            <ListItemIcon>
              <SellIcon />
            </ListItemIcon>
            <ListItemText primary="Rent" />
          </DrawerItem>
        </ListItem>
        <ListItem disablePadding>
          {/* Use location object from the hook */}
          <DrawerItem
            selected={location.pathname.startsWith("/properties/sold")}
            onClick={() => handleLinkClick("/properties/sold")}
          >
            <ListItemIcon>
              <CheckCircleOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="Sold" />
          </DrawerItem>
        </ListItem>
        {/* List Property Button */}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <DrawerItem onClick={() => handleLinkClick("/list-property")}>
            <ListItemIcon>
              <AddBusinessIcon />
            </ListItemIcon>
            <ListItemText primary="List Your Property" />
          </DrawerItem>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default MobileDrawer;
