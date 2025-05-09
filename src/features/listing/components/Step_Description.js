// src/features/ListPropertyPage/components/Step_Description.js
import React from "react";
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

  return (
    <Box>
      {/* <Typography variant="h6" gutterBottom>
        {t("step_description", "Property Description")}
      </Typography> */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="description"
            name="description" // Matches formData key
            label={t("property_description", "Description")}
            fullWidth
            multiline
            rows={6} // Increased rows for better editing
            variant="outlined"
            value={formData.description || ""} // Ensure controlled component
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={generateDescription} // Trigger AI generation
              disabled={loadingAI}
              startIcon={
                loadingAI ? <CircularProgress size={16} /> : <AutoFixHighIcon />
              }
              sx={{ textTransform: "none" }}
            >
              {loadingAI
                ? t("sending", "Generating...")
                : t("generate_ai", "Generate with AI")}
            </Button>
          </Box>
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
