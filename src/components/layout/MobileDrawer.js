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
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";
import { styled } from "@mui/material/styles";

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
}));
const DrawerItem = styled(ListItem)(({ theme, active }) => ({
  margin: theme.spacing(0.5, 0),
  borderRadius: "8px",
  backgroundColor: active ? "rgba(43,123,140,0.08)" : "transparent",
}));

export default function MobileDrawer({
  open,
  onToggle,
  navLinks,
  activeLink,
  onNavigate,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onToggle}
      ModalProps={{ keepMounted: true }}
      sx={{ "& .MuiDrawer-paper": { width: 260 } }}
    >
      <DrawerHeader>
        <Typography variant="h6">BanglaGhor</Typography>
        <IconButton onClick={onToggle}>
          <CloseIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <DrawerItem key={link.id} active={activeLink === link.id ? 1 : 0}>
            <ListItemButton
              component={RouterLink}
              to={link.path}
              selected={activeLink === link.id}
              onClick={() => {
                onNavigate(link.path);
                onToggle();
              }}
            >
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </DrawerItem>
        ))}
        <Divider sx={{ my: 1 }} />
      </List>
    </Drawer>
  );
}
