import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Import team member images
const person1 = `${process.env.PUBLIC_URL}/pictures/Person1.jpg`;
const person2 = `${process.env.PUBLIC_URL}/pictures/Person2.jpg`;
const person3 = `${process.env.PUBLIC_URL}/pictures/Person3.jpg`;

const TeamMemberCard = styled(Card)(({ theme }) => ({
  // ... (styling kept as is)
  textAlign: "center",
  padding: theme.spacing(3, 2),
  borderRadius: "12px",
  height: "100%",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(43, 123, 140, 0.1)",
  },
}));

const teamMembers = [
  // Kept names and roles as is (specific data)
  { name: "Ankit Malik", role: "Founder & CEO", img: person2 },
  { name: "Nur e Siam", role: "Lead Developer", img: person3 },
  { name: "Aaradhya Lamsal", role: "Marketing Head", img: person1 },
];

/**
 * TeamSection Component
 */
const TeamSection = () => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Box sx={{ py: 6 }}>
      <Typography
        variant="h4"
        component="h2"
        fontWeight={700}
        align="center"
        gutterBottom
      >
        Meet Our Team {/* <-- Kept as is, no key found */}
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <TeamMemberCard>
              <Avatar
                alt={member.name}
                src={member.img}
                sx={{ width: 100, height: 100, margin: "0 auto 16px auto" }}
              />
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {member.name}
                </Typography>
                <Typography color="primary" variant="body1">
                  {member.role}
                </Typography>
              </CardContent>
            </TeamMemberCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TeamSection;
