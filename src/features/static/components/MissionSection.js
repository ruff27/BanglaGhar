import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; 

const AnimatedBox = styled(Box)(({ theme }) => ({
  
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
  height: "100%", 
}));

/**
 * MissionSection Component
 */
const MissionSection = () => {
  const { t } = useTranslation();

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
                  {t("mission_section.mission_title")} {/* <-- Kept as is, no key found */}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {/* Kept as is, no key found */}
                {t("mission_section.mission_text")}
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
                  {t("mission_section.vision_title")}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {/* Kept as is, no key found */}
                {t("mission_section.vision_text")}
              </Typography>
            </Paper>
          </AnimatedBox>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MissionSection;