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
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { useTranslation } from "react-i18next"; // Import useTranslation

const ProfileDisplay = ({ profileData }) => {
  const { t } = useTranslation(); // Initialize translation
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
        Account Information {/* <-- Kept as is, no key found */}
      </Typography>
      <List dense disablePadding>
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PersonIcon color="action" />
          </ListItemIcon>
          {/* Applied translation */}
          <ListItemText
            primary={t("Display Name")} // Consider using a specific translation key
            // Show displayName, fallback to Cognito name, then placeholder
            secondary={profileData.displayName || profileData.name || "-"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EmailIcon color="action" />
          </ListItemIcon>
          {/* Applied translation */}
          <ListItemText
            primary={t("email")}
            secondary={profileData.email || "-"}
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <FingerprintIcon color="action" />
          </ListItemIcon>
          <ListItemText
            // Applied translation
            primary={t("user_id")}
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
          {/* Applied translation */}
          <ListItemText primary={t("email_verified")} />
          <Chip
            // Applied translation
            label={isVerified ? t("yes") : t("no")}
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
