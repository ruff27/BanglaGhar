import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { styled } from "@mui/material/styles";

// Styled component (can be shared if needed)
const AnimatedBox = styled(Box)(({ theme }) => ({
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
  height: "100%", // Ensure boxes have same height if needed
}));

/**
 * MissionSection Component
 * Displays the Mission and Vision statements for the About Us page.
 */
const MissionSection = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Grid container spacing={4} justifyContent="center">
        {/* Mission */}
        <Grid item xs={12} md={5}>
          <AnimatedBox>
            <Paper
              elevation={2}
              sx={{ p: 4, borderRadius: "12px", height: "100%" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <HandshakeIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Our Mission
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                To simplify the property transaction process in Bangladesh by
                providing a transparent, efficient, and trustworthy platform
                connecting buyers, sellers, and renters with verified listings
                and reliable information.
              </Typography>
            </Paper>
          </AnimatedBox>
        </Grid>
        {/* Vision */}
        <Grid item xs={12} md={5}>
          <AnimatedBox>
            <Paper
              elevation={2}
              sx={{ p: 4, borderRadius: "12px", height: "100%" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <HomeWorkIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h3" fontWeight={600}>
                  Our Vision
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                To be the leading and most innovative real estate portal in
                Bangladesh, empowering individuals and families to find their
                perfect home or investment property with ease and confidence.
              </Typography>
            </Paper>
          </AnimatedBox>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MissionSection;
