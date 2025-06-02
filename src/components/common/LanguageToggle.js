import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Button } from "@mui/material";

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const handleToggle = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  const getLabel = () => {
    return i18n.language === "en" ? "বাংলা" : "English";
  };

  return (
    <Box>
      <Button
        onClick={handleToggle}
        sx={{
          textTransform: "none",
          color: "text.primary",
          fontWeight: 600,
        }}
      >
        {getLabel()}
      </Button>
    </Box>
  );
};

export default LanguageToggle;
