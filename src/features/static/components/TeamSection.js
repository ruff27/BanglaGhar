import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

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

const teamMembers = [
  {
    name: "Nur E Siam",
    role: "Team Lead",
    description:
      "Oversaw the entire project. Responsible for language translation and contributed significantly to UI development.",
  },
  {
    name: "Ruffin Remad",
    role: "Project Manager & UI Developer",
    description:
      "Managed project backlog, coordinated team tasks, assisted with language translation and UI development.",
  },
  {
    name: "Ankit Malik",
    role: "Backend Lead",
    description:
      "Handled MongoDB setup and Netlify integration. Led backend architecture and authored the deployment documentation.",
  },
  {
    name: "Aaradhya",
    role: "Lead UI Developer",
    description: "Focused on user interface design and integrated the map functionality.",
  },
  {
    name: "Shivam",
    role: "Backend Developer",
    description: "Implemented the property uploading and listing features.",
  },
  {
    name: "Prabesh",
    role: "AWS Developer",
    description: "Managed AWS Cognito-based user authentication and security flows.",
  },
  {
    name: "Ashim",
    role: "AWS Deployment Specialist",
    description: "Oversaw deployment pipelines and AWS infrastructure setup.",
  },
];

const TeamSection = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Typography variant="h4" component="h2" fontWeight={700} align="center" gutterBottom>
        Meet Our Team
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
