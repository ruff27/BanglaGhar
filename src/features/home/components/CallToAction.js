import React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CallToAction = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box sx={{ bgcolor: "primary.main", color: "white", py: { xs: 6, md: 8 } }}>
      {" "}
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography
              variant="h4" 
              component="h2"
              fontWeight={700} 
              gutterBottom
              sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }} 
            >
              {t("start_journey")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                opacity: 0.9,
                mb: { xs: 3, md: 0 },
                fontSize: { xs: "1.1rem", md: "1.2rem" }, 
              }}
            >
              {t("journey_description")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "center", md: "right" } }} 
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/contact")}
              sx={{
                bgcolor: "white",
                color: "primary.main", 
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none", 
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  transform: "translateY(-2px)", 
                  boxShadow: "0 6px 15px rgba(255, 255, 255, 0.15)",
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
