import React from "react";
import { Box, Container, Typography, Button, Grid, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Assuming dhaka2.jpg is in public/pictures
const heroImageUrl = `${process.env.PUBLIC_URL}/pictures/dhaka2.jpg`;

// Re-introducing StyledButton definition similar to original HomePage.js
// Consider moving this to a shared styles file if used elsewhere
const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow:
    variant === "contained" ? "0 4px 14px rgba(43, 123, 140, 0.25)" : "none",
  transition: "all 0.3s ease",
  fontSize: "1.05rem", // Added from previous attempt
  ...(variant === "contained" && {
    backgroundColor: theme.palette.primary.main, // Use theme color
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark, // Darken on hover
      transform: "translateY(-3px)",
      boxShadow: "0 8px 20px rgba(43, 123, 140, 0.3)",
    },
  }),
  ...(variant === "outlined" && {
    borderColor: theme.palette.primary.main, // Use theme color
    color: theme.palette.primary.main, // Use theme color
    // backgroundColor: alpha(theme.palette.primary.main, 0.05), // Optional light bg
    "&:hover": {
      backgroundColor: theme.palette.action.hover, // Standard hover
      borderColor: theme.palette.primary.dark,
      transform: "translateY(-3px)", // Optional lift
    },
  }),
}));

/**
 * HeroSection Component
 *
 * Displays the main hero banner with title, subtitle, and action buttons.
 * Styling reverted to match the original HomePage design (gradient background, image on side).
 */
const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Hook for internationalization

  return (
    // Outer Box with gradient background from original file
    <Box
      sx={{
        background: `linear-gradient(160deg, #EFF9FE 60%, rgba(139, 198, 206, 0.4) 100%)`,
        pt: { xs: 8, md: 12 }, // Adjusted padding top
        pb: { xs: 8, md: 10 }, // Adjusted padding bottom
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circle element from original file */}
      <Box
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(43, 123, 140, 0.05)",
          top: -200,
          right: -100,
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl">
        {" "}
        {/* Use xl like original */}
        <Grid container spacing={4} alignItems="center">
          {/* Text Content Column */}
          <Grid item xs={12} md={6} sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" }, // Match original size
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.2,
                color: "#0B1F23", // Original text color
              }}
            >
              {t("hero_title")}{" "}
              <Box component="span" sx={{ color: "#2B7B8C" }}>
                {" "}
                {/* Original highlight color */}
                {t("home_translated")}
              </Box>{" "}
              {t("in_bangladesh")}
            </Typography>

            <Typography
              variant="subtitle1" // Match original variant
              sx={{
                fontSize: { xs: "1.1rem", md: "1.25rem" }, // Match original size
                mb: 4,
                color: "#0B1F23", // Original text color
                opacity: 0.8,
                maxWidth: "650px",
              }}
            >
              {t("hero_subtitle")}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              // Align buttons left on medium+ screens
              justifyContent={{ xs: "center", md: "flex-start" }}
            >
              <StyledButton
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/properties/rent")}
              >
                {t("explore_properties")}
              </StyledButton>
              <StyledButton
                variant="outlined"
                size="large"
                onClick={() => navigate("/list-property")}
              >
                {t("list_property")}
              </StyledButton>
            </Stack>
          </Grid>

          {/* Hero Image Column (visible on medium+ screens) */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {" "}
            {/* Hide on xs */}
            <Box
              component="img"
              src={heroImageUrl}
              alt="Modern home in Bangladesh"
              sx={{
                width: "100%",
                maxWidth: "600px", // Max width for image
                height: "auto",
                maxHeight: "400px", // Max height for image
                objectFit: "cover",
                borderRadius: "16px", // Rounded corners
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)", // Shadow
                // Optional perspective effect from original
                transform: "perspective(1000px) rotateY(-5deg)",
                transition: "all 0.5s ease",
                "&:hover": {
                  transform: "perspective(1000px) rotateY(0deg)",
                },
                display: "block", // Ensure image behaves like a block
                mx: "auto", // Center if needed within grid item
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
