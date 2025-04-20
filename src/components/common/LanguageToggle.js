import React from "react";
import { useTranslation } from "react-i18next";
import { FormControlLabel, Switch, Typography, Box } from "@mui/material";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const isBangla = i18n.language === "bn";

  const handleToggle = () => {
    const newLang = isBangla ? "en" : "bn";
    i18n.changeLanguage(newLang);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography
        variant="body2"
        color={!isBangla ? "primary" : "textSecondary"}
      >
        ENG
      </Typography>
      <Switch
        checked={isBangla}
        onChange={handleToggle}
        color="primary"
        size="small"
      />
      <Typography
        variant="body2"
        color={isBangla ? "primary" : "textSecondary"}
      >
        BAN
      </Typography>
    </Box>
  );
};

export default LanguageToggle;
