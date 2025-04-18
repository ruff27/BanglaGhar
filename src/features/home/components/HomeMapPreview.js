import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material"; // Moved Paper import here
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Import the NEW MapComponent from its correct refactored location
import MapComponent from "../../map/components/MapComponent"; // Corrected path

/**
 * HomeMapPreview Component
 *
 * Displays a preview of the Bangladesh map on the home page.
 */
const HomeMapPreview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Hook for internationalization

  return (
    <Box sx={{ py: 6, backgroundColor: "#f8f9fa" /* Light background */ }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          fontWeight={600}
          gutterBottom
          align="center"
        >
          {t("explore_on_map_title", "Explore Properties on Map")}{" "}
          {/* Example key */}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          {t(
            "explore_on_map_subtitle",
            "Find properties visually in your desired locations across Bangladesh."
          )}{" "}
          {/* Example key */}
        </Typography>
        <Paper
          elevation={3} // Add elevation for depth
          sx={{
            height: { xs: "300px", sm: "400px", md: "500px" }, // Responsive height
            width: "100%",
            borderRadius: "12px",
            overflow: "hidden", // Ensures map corners are rounded
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            mb: 3,
          }}
        >
          {/* Render the new MapComponent */}
          {/* Pass minimal props needed for a preview, or none if it defaults okay */}
          <MapComponent
            properties={[]} // Pass empty array or fetched featured properties if needed
            mapCenter={[23.8103, 90.4125]} // Default center
            mapZoom={7} // Default zoom
            // readOnly={true} // Maybe disable interactions
            // userLocation={null} // Don't show user location in preview
            // onMarkerClick={() => {}} // Disable marker clicks
          />
        </Paper>
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/map")} // Navigate to the full map page route
            sx={{ borderRadius: "8px", textTransform: "none", px: 3, py: 1 }}
          >
            {t("open_full_map", "Open Full Map")} {/* Example key */}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Removed Paper import from here

export default HomeMapPreview;
