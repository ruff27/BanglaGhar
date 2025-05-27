// src/features/ListPropertyPage/components/Step_Description.js
import React, { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  FormHelperText,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // AI Icon
import { useTranslation } from "react-i18next";

const Step_Description = ({
  formData,
  errors,
  handleChange,
  generateDescription,
  loadingAI,
}) => {
  const { t } = useTranslation();
  // New state for Bangla and English AI descriptions
  const [aiDescriptionEn, setAIDescriptionEn] = useState("");
  const [aiDescriptionBn, setAIDescriptionBn] = useState("");
  const [selectedLang, setSelectedLang] = useState("");

  // Handler for AI generation in English
  const handleGenerateEn = async () => {
    if (generateDescription) {
      const desc = await generateDescription("en");
      setAIDescriptionEn(desc || "");
    }
  };
  // Handler for AI generation in Bangla
  const handleGenerateBn = async () => {
    if (generateDescription) {
      const desc = await generateDescription("bn");
      setAIDescriptionBn(desc || "");
    }
  };
  // Handler for selecting a description
  const handleSelectDescription = (desc, lang) => {
    handleChange({ target: { name: "description", value: desc } });
    setSelectedLang(lang);
  };

  return (
    <Box>
      {/* <Typography variant="h6" gutterBottom>
        {t("step_description", "Property Description")}
      </Typography> */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="description"
            name="description"
            label={t("property_description", "Description")}
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={formData.description || ""}
            onChange={handleChange}
            error={!!errors.description}
            helperText={
              errors.description ||
              t(
                "description_helper",
                "Describe the property's key features, condition, and surroundings. You can also use the AI generator."
              )
            }
          />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleGenerateEn}
              disabled={loadingAI}
              startIcon={
                loadingAI ? <CircularProgress size={16} /> : <AutoFixHighIcon />
              }
              sx={{ textTransform: "none" }}
            >
              {loadingAI
                ? t("sending", "Generating...")
                : t("generate_ai_en", "Generate with AI (English)")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleGenerateBn}
              disabled={loadingAI}
              startIcon={
                loadingAI ? <CircularProgress size={16} /> : <AutoFixHighIcon />
              }
              sx={{ textTransform: "none" }}
            >
              {loadingAI
                ? t("sending", "Generating...")
                : t("generate_ai_bn", "Generate with AI (Bangla)")}
            </Button>
          </Box>
          {/* Show AI-generated descriptions with selection */}
          {(aiDescriptionEn || aiDescriptionBn) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("choose_description", "Choose a generated description:")}
              </Typography>
              {aiDescriptionEn && (
                <Box
                  sx={{
                    mb: 1,
                    p: 1,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                  }}
                >
                  <input
                    type="radio"
                    checked={selectedLang === "en"}
                    onChange={() => handleSelectDescription(aiDescriptionEn, "en")}
                    id="desc-en"
                  />
                  <label htmlFor="desc-en" style={{ marginLeft: 8 }}>
                    <b>{t("english", "English")}</b>
                  </label>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {aiDescriptionEn}
                  </Typography>
                </Box>
              )}
              {aiDescriptionBn && (
                <Box
                  sx={{
                    mb: 1,
                    p: 1,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                  }}
                >
                  <input
                    type="radio"
                    checked={selectedLang === "bn"}
                    onChange={() => handleSelectDescription(aiDescriptionBn, "bn")}
                    id="desc-bn"
                  />
                  <label htmlFor="desc-bn" style={{ marginLeft: 8 }}>
                    <b>{t("bangla", "Bangla")}</b>
                  </label>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {aiDescriptionBn}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          {/* Optionally show AI error specifically here if needed */}
          {errors.description?.includes("Failed to generate") && (
            <FormHelperText error sx={{ mt: 1 }}>
              {errors.description}
            </FormHelperText>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step_Description;
