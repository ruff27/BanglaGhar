import React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * CallToAction Component
 *
 * Displays a final call-to-action section encouraging user engagement.
 */
const CallToAction = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Hook for internationalization

  return (
    <Box sx={{ bgcolor: "primary.main", color: "white", py: { xs: 6, md: 8 } }}>
      {" "}
      {/* Responsive padding */}
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography
              variant="h4" // Adjusted variant for better hierarchy
              component="h2"
              fontWeight={700} // Bolder
              gutterBottom
              sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }} // Responsive font size
            >
              {t("start_journey")}
            </Typography>
            <Typography
              variant="h6" // Use h6 for subtitle
              sx={{
                fontWeight: 400,
                opacity: 0.9,
                mb: { xs: 3, md: 0 },
                fontSize: { xs: "1.1rem", md: "1.2rem" }, // Responsive font size
              }}
            >
              {t("journey_description")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "center", md: "right" } }} // Center button on mobile
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/contact")}
              sx={{
                bgcolor: "white",
                color: "primary.main", // Use theme color
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none", // Keep normal case
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  transform: "translateY(-2px)", // Subtle lift effect
                  boxShadow: "0 6px 15px rgba(255, 255, 255, 0.15)", // Softer shadow
                },
              }}
            >
              {t("contact_us")}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CallToAction;
