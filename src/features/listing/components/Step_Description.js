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
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { theme } from "./../../../styles/theme";
import { useTranslation } from "react-i18next";

const Step_Description = ({
  formData,
  errors,
  handleChange,
  generateDescription, // This is the function from useListingForm
  loadingAI,
}) => {
  const { t } = useTranslation();
  const [aiDescriptionEn, setAIDescriptionEn] = useState("");
  const [aiDescriptionBn, setAIDescriptionBn] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [userPrompt, setUserPrompt] = useState(""); // New state for user's extra details

  const handleUserPromptChange = (event) => {
    setUserPrompt(event.target.value);
  };

  const handleGenerate = async (lang) => {
    if (generateDescription) {
      // Pass the userPrompt to the generateDescription function
      const desc = await generateDescription(lang, userPrompt);
      if (desc) {
        if (lang === "en") {
          setAIDescriptionEn(desc);
        } else if (lang === "bn") {
          setAIDescriptionBn(desc);
        }
      }
    }
  };

  const handleSelectDescription = (desc, lang) => {
    handleChange({ target: { name: "description", value: desc } });
    setSelectedLang(lang);
  };

  return (
    <Box>
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
                "description_helper_manual",
                "Describe the property or use the AI generator below. You can add specific points for the AI in the text box."
              )
            }
          />
        </Grid>

        {/* New TextField for user's additional prompt */}
        <Grid item xs={12}>
          <TextField
            id="userPrompt"
            name="userPrompt"
            label={t(
              "ai_custom_prompt_label",
              "Optional: Specific details for AI (e.g., mention the quiet neighborhood, or the recent kitchen renovation)"
            )}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={userPrompt}
            onChange={handleUserPromptChange}
            helperText={t(
              "ai_custom_prompt_helper",
              "Provide any key points or style you want the AI to focus on."
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleGenerate("en")} // Updated
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
              onClick={() => handleGenerate("bn")} // Updated
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
        </Grid>

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
                  border: `1px solid ${
                    selectedLang === "en" ? theme.palette.primary.main : "#ccc"
                  }`, // Example: Highlight if selected
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => handleSelectDescription(aiDescriptionEn, "en")}
              >
                <input
                  type="radio"
                  checked={selectedLang === "en"}
                  onChange={() => {}} // Radio is controlled by Box click
                  readOnly
                  id="desc-en"
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="desc-en">
                  <b>{t("english", "English")}</b>
                </label>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, pl: 3 /* Indent text */ }}
                >
                  {aiDescriptionEn}
                </Typography>
              </Box>
            )}
            {aiDescriptionBn && (
              <Box
                sx={{
                  mb: 1,
                  p: 1,
                  border: `1px solid ${
                    selectedLang === "bn" ? theme.palette.primary.main : "#ccc"
                  }`, // Example: Highlight if selected
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => handleSelectDescription(aiDescriptionBn, "bn")}
              >
                <input
                  type="radio"
                  checked={selectedLang === "bn"}
                  onChange={() => {}} // Radio is controlled by Box click
                  readOnly
                  id="desc-bn"
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="desc-bn">
                  <b>{t("bangla", "Bangla")}</b>
                </label>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, pl: 3 /* Indent text */ }}
                >
                  {aiDescriptionBn}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {errors.description?.includes("Failed to generate") && (
          <FormHelperText error sx={{ mt: 1 }}>
            {errors.description}
          </FormHelperText>
        )}
      </Grid>
    </Box>
  );
};
// Make sure to import 'theme' if you use it for highlighting selected:
// import { useTheme } from '@mui/material/styles';
// and then inside the component: const theme = useTheme();

export default Step_Description;
