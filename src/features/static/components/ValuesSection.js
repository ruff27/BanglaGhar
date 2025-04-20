import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; // Import useTranslation

const ValueCard = styled(Paper)(({ theme }) => ({
  // ... (styling kept as is)
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

const coreValues = [
  // Kept titles and descriptions as is, no keys found
  {
    icon: <VerifiedIcon fontSize="large" color="primary" />,
    title: "Trust & Transparency",
    description:
      "Building confidence through verified listings and clear communication.",
  },
  {
    icon: <FavoriteIcon fontSize="large" color="primary" />,
    title: "Customer Focus",
    description: "Prioritizing user needs and providing exceptional support.",
  },
  {
    icon: <ApartmentIcon fontSize="large" color="primary" />,
    title: "Innovation",
    description:
      "Continuously improving our platform with cutting-edge technology.",
  },
];

/**
 * ValuesSection Component
 */
const ValuesSection = () => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box sx={{ py: 6, backgroundColor: "rgba(43, 123, 140, 0.03)" }}>
      <Typography
        variant="h4"
        component="h2"
        fontWeight={700}
        align="center"
        gutterBottom
      >
        Our Core Values {/* <-- Kept as is, no key found */}
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
        {coreValues.map((value, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ValueCard elevation={2}>
              <Box sx={{ mb: 2 }}>{value.icon}</Box>
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
