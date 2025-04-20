import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Import Section Components
import MissionSection from "./components/MissionSection";
import ValuesSection from "./components/ValuesSection";
import TeamSection from "./components/TeamSection";
import AboutCTASection from "./components/AboutCTASection";

// Example: Styled component for the intro section background if needed
const IntroBackground = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 2),
  backgroundColor: theme.palette.grey[100],
  textAlign: "center",
}));

/**
 * AboutUsPage Component
 */
const AboutUsPage = () => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box>
      <IntroBackground>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight={700} gutterBottom>
            {/* Applied translation using nav_about key, consider a more specific key if needed */}
            {t("nav_about")} BanglaGhor
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            {/* Kept intro text as is, no specific key found */}
            Connecting you with your perfect property in Bangladesh. Learn more
            about our journey, values, and the team dedicated to simplifying
            your real estate experience.
          </Typography>
        </Container>
      </IntroBackground>

      <Container maxWidth="lg">
        <MissionSection />
        <Divider sx={{ my: 4 }} />
        <ValuesSection />
        <TeamSection />
      </Container>

      <AboutCTASection />
    </Box>
  );
};

export default AboutUsPage;
