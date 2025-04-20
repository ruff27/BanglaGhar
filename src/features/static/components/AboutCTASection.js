import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * AboutCTASection Component
 * Displays the final Call to Action section on the About Us page.
 */
const AboutCTASection = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: "center", py: 6, backgroundColor: "#f8f9fa" }}>
      <Box
        sx={{
          maxWidth: "800px",
          mx: "auto",
          p: 4,
          borderRadius: 4,
          // backgroundColor: 'rgba(43, 123, 140, 0.05)', // Optional subtle background
        }}
      >
        <Typography variant="h4" component="h2" fontWeight={600} gutterBottom>
          Ready to Find Your Dream Property?
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: "700px", mx: "auto" }}
        >
          Take the first step toward your next home with Bangladesh's most
          trusted real estate partner.
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
            onClick={() => navigate("/properties/rent")} // Default to rent
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "8px", // Consistent radius
              fontSize: "1.05rem",
              textTransform: "none",
            }}
          >
            Browse Properties
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
            Contact Us
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default AboutCTASection;
