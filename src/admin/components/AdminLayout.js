// src/admin/components/AdminLayout.js
// Updated color scheme for a cohesive dark admin dashboard
// citeturn5file0

import React, { useState } from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";

const drawerWidth = 240;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = () => logout();

  const adminNavItems = [
    // dashboard
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    // pending approvals
    {
      text: "Pending Approvals",
      icon: <PendingActionsIcon />,
      path: "/admin/pending-approvals",
    },
    // manage users
    { text: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
    // manage listings
    { text: "Manage Listings", icon: <ListAltIcon />, path: "/admin/listings" },
  ];

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ backgroundColor: theme.palette.primary.dark }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ color: theme.palette.primary.contrastText }}
        >
          Admin Menu
        </Typography>
      </Toolbar>
      <Divider
        sx={{ borderColor: alpha(theme.palette.primary.contrastText, 0.2) }}
      />
      <List sx={{ flexGrow: 1 }}>
        {adminNavItems.map((item) => {
          const isSelected = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isSelected}
                onClick={mobileOpen ? handleDrawerToggle : undefined}
                sx={{
                  minHeight: 48,
                  justifyContent: "initial",
                  px: 2.5,
                  backgroundColor: isSelected
                    ? alpha(theme.palette.primary.main, 0.2)
                    : "inherit",
                  "& .MuiListItemIcon-root, & .MuiListItemText-root": {
                    color: isSelected
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 3, color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: "inherit" }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider
        sx={{ borderColor: alpha(theme.palette.primary.contrastText, 0.2) }}
      />
      <List sx={{ mt: "auto" }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: "initial",
              px: 2.5,
              "& .MuiListItemIcon-root, & .MuiListItemText-root": {
                color: theme.palette.text.secondary,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 3, color: "inherit" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: "inherit" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
        }}
        elevation={1}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography
            variant="body2"
            sx={{ mr: 1.5, color: theme.palette.primary.contrastText }}
          >
            Welcome, {user?.userName || user?.email || "Admin"}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="admin navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
              borderRight: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
              borderRight:
                "1px solid " + alpha(theme.palette.primary.contrastText, 0.2),
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
