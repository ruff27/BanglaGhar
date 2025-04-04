import React from "react";
import { Button, ButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ButtonGroup
      size="small"
      variant="outlined"
      sx={{ position: "absolute", top: 10, right: 10 }}
    >
      <Button onClick={() => changeLanguage("en")}>EN</Button>
      <Button onClick={() => changeLanguage("bn")}>BN</Button>
    </ButtonGroup>
  );
};

export default LanguageToggle;
