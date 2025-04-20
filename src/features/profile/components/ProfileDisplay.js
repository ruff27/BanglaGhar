import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FingerprintIcon from "@mui/icons-material/Fingerprint"; // Changed icon for SUB

const ProfileDisplay = ({ profileData }) => {
  if (!profileData) return null;

  const isVerified = profileData.email_verified === "true";

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        mt: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1.5, pl: 1 }}>
        Account Information
      </Typography>
      <List dense disablePadding>
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PersonIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="Name" secondary={profileData.name || "-"} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EmailIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="Email" secondary={profileData.email || "-"} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <FingerprintIcon color="action" />
          </ListItemIcon>
          <ListItemText
            primary="User ID"
            secondary={profileData.sub || "-"}
            secondaryTypographyProps={{
              sx: { wordBreak: "break-all", fontSize: "0.8rem" },
            }}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <VerifiedUserIcon color={isVerified ? "success" : "action"} />
          </ListItemIcon>
          <ListItemText primary="Email Verified" />
          <Chip
            label={isVerified ? "Verified" : "Not Verified"}
            color={isVerified ? "success" : "warning"}
            size="small"
            variant="outlined"
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default ProfileDisplay;
