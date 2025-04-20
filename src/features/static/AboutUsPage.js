import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import { styled } from "@mui/material/styles"; // Import styled if needed for intro section

// Import Section Components
import MissionSection from "./components/MissionSection";
import ValuesSection from "./components/ValuesSection";
import TeamSection from "./components/TeamSection";
import AboutCTASection from "./components/AboutCTASection";

// Example: Styled component for the intro section background if needed
const IntroBackground = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 2),
  backgroundColor: theme.palette.grey[100], // Example background
  textAlign: "center",
}));

/**
 * AboutUsPage Component
 *
 * Container for the About Us page content.
 * Renders different sections imported from components.
 */
const AboutUsPage = () => {
  return (
    <Box>
      {/* Optional: Intro Section */}
      <IntroBackground>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight={700} gutterBottom>
            About BanglaGhor
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Connecting you with your perfect property in Bangladesh. Learn more
            about our journey, values, and the team dedicated to simplifying
            your real estate experience.
          </Typography>
        </Container>
      </IntroBackground>

      {/* Render Section Components */}
      <Container maxWidth="lg">
        {" "}
        {/* Use lg for wider content sections */}
        <MissionSection />
        <Divider sx={{ my: 4 }} />
        <ValuesSection />
        {/* No divider needed if ValuesSection has its own background */}
        <TeamSection />
      </Container>

      {/* Final CTA Section */}
      <AboutCTASection />
    </Box>
  );
};

export default AboutUsPage;
