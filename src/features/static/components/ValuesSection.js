import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const ValueCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  borderRadius: "12px",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(43, 123, 140, 0.15)",
  },
}));

const ValuesSection = () => {
  const { t } = useTranslation();
  const values = t("values_section.values", { returnObjects: true });

  const icons = [
    <VerifiedIcon fontSize="large" color="primary" />,
    <FavoriteIcon fontSize="large" color="primary" />,
    <ApartmentIcon fontSize="large" color="primary" />,
  ];

  return (
    <Box sx={{ py: 6, backgroundColor: "rgba(43, 123, 140, 0.03)" }}>
      <Typography
        variant="h4"
        component="h2"
        fontWeight={700}
        align="center"
        gutterBottom
      >
        {t("values_section.title")}
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
        {values.map((value, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ValueCard elevation={2}>
              <Box sx={{ mb: 2 }}>{icons[index]}</Box>
              <Typography
                variant="h6"
                component="h3"
                fontWeight={600}
                gutterBottom
              >
                {value.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {value.description}
              </Typography>
            </ValueCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ValuesSection;