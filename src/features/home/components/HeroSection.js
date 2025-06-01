import React from "react";
import { Box, Container, Typography, Button, Grid, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const heroImageUrl = `${process.env.PUBLIC_URL}/pictures/dhaka2.jpg`;
const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
  boxShadow:
    variant === "contained" ? "0 4px 14px rgba(43, 123, 140, 0.25)" : "none",
  transition: "all 0.3s ease",
  fontSize: "1.05rem", 
  ...(variant === "contained" && {
    backgroundColor: theme.palette.primary.main, 
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark, 
      transform: "translateY(-3px)",
      boxShadow: "0 8px 20px rgba(43, 123, 140, 0.3)",
    },
  }),
  ...(variant === "outlined" && {
    borderColor: theme.palette.primary.main, 
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.action.hover, 
      borderColor: theme.palette.primary.dark,
      transform: "translateY(-3px)", 
    },
  }),
}));


const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); 

  return (
    <Box
      sx={{
        background: `linear-gradient(160deg, #EFF9FE 60%, rgba(139, 198, 206, 0.4) 100%)`,
        pt: { xs: 8, md: 12 }, 
        pb: { xs: 8, md: 10 }, 
        position: "relative",
        overflow: "hidden",
      }}
    >
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
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6} sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem" }, 
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.2,
                color: "#0B1F23",
              }}
            >
              {t("hero_title")}{" "}
              <Box component="span" sx={{ color: "#2B7B8C" }}>
                {" "}
                {t("home_translated")}
              </Box>{" "}
              {t("in_bangladesh")}
            </Typography>

            <Typography
              variant="subtitle1" 
              sx={{
                fontSize: { xs: "1.1rem", md: "1.25rem" }, 
                mb: 4,
                color: "#0B1F23", 
                opacity: 0.8,
                maxWidth: "650px",
              }}
            >
              {t("hero_subtitle")}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
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
                maxWidth: "600px", 
                height: "auto",
                maxHeight: "400px", 
                objectFit: "cover",
                borderRadius: "16px", 
                boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
                transform: "perspective(1000px) rotateY(-5deg)",
                transition: "all 0.5s ease",
                "&:hover": {
                  transform: "perspective(1000px) rotateY(0deg)",
                },
                display: "block", 
                mx: "auto", 
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
