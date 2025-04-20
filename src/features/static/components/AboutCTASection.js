import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation

/**
 * AboutCTASection Component
 */
const AboutCTASection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box sx={{ textAlign: "center", py: 6, backgroundColor: "#f8f9fa" }}>
      <Box sx={{ maxWidth: "800px", mx: "auto", p: 4, borderRadius: 4 }}>
        <Typography variant="h4" component="h2" fontWeight={600} gutterBottom>
          Ready to Find Your Dream Property? {/* <-- Kept as is, no key */}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: "700px", mx: "auto" }}
        >
          Take the first step toward your next home with Bangladesh's most
          trusted real estate partner. {/* <-- Kept as is, no key */}
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={() => navigate("/properties/rent")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              fontSize: "1.05rem",
              textTransform: "none",
            }}
          >
            {t("explore_properties")} {/* Applied */}
          </Button>
          <Button
            variant="outlined"
            size="large"
            color="primary"
            onClick={() => navigate("/contact")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              fontSize: "1.05rem",
              textTransform: "none",
            }}
          >
            {t("contact_us")} {/* Applied */}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default AboutCTASection;
