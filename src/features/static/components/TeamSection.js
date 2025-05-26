import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const TeamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  height: "100%",
  textAlign: "left",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
}));

const TeamSection = () => {
  const { t } = useTranslation();
  const teamMembers = t("team_section.members", { returnObjects: true });

  return (
    <Box sx={{ py: 6 }}>
      <Typography variant="h4" component="h2" fontWeight={700} align="center" gutterBottom>
        {t("team_section.title")}
      </Typography>
      <Grid container spacing={4} sx={{ mt: 3 }}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <TeamCard elevation={3}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {member.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {member.role}
              </Typography>
              <Typography variant="body2">{member.description}</Typography>
            </TeamCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TeamSection;