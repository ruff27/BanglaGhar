import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import TranslateIcon from "@mui/icons-material/Translate";
import { useTranslation } from "react-i18next";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    console.log("Clicked, anchorEl:", event.currentTarget); // ✅ helpful debug
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (lang) => {
    if (lang) i18n.changeLanguage(lang);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Change Language">
        <IconButton onClick={handleClick}>
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 120,
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <MenuItem onClick={() => handleClose("en")}>
          <ListItemIcon>
            <TranslateIcon fontSize="small" />
          </ListItemIcon>
          English
        </MenuItem>
        <MenuItem onClick={() => handleClose("bn")}>
          <ListItemIcon>
            <TranslateIcon fontSize="small" />
          </ListItemIcon>
          বাংলা
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageToggle;
