import React from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Link,
  styled,
} from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
  WhatsApp,
  Facebook,
  Instagram,
  LinkedIn,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next"; // Import useTranslation

// --- Styled Components ---
const ContactCard = styled(Card)(({ theme }) => ({
  // ... (styling kept as is)
  height: "100%",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 12px 20px ${
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(43, 123, 140, 0.2)"
    }`, // Adjusted shadow color for theme
  },
  backgroundColor: theme.palette.background.paper,
  borderRadius: "12px", // Consistent border radius
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  // ... (styling kept as is)
  backgroundColor: theme.palette.primary.main,
  color: "white",
  margin: theme.spacing(0.5), // Adjusted margin for better spacing
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.15)",
  },
  "&:focus": {
    // Added focus style for accessibility
    outline: `2px solid ${theme.palette.primary.light}`,
    outlineOffset: "2px",
  },
}));

// --- Data ---
const socialLinks = [
  {
    icon: <Facebook />,
    label: "Facebook",
    url: "https://facebook.com/banglaghor",
  },
  {
    icon: <Instagram />,
    label: "Instagram",
    url: "https://instagram.com/banglaghor",
  },
  {
    icon: <LinkedIn />,
    label: "LinkedIn",
    url: "https://linkedin.com/company/banglaghor",
  },
  { icon: <WhatsApp />, label: "WhatsApp", url: "https://wa.me/8801234567890" },
];

/**
 * ContactInfo Component
 */
const ContactInfo = () => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Grid container spacing={3} direction="column">
      {/* Phone Card */}
      <Grid item>
        <ContactCard>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={1.5}>
              <Phone color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="h6" component="h3">
                {t("call_us")} {/* Applied */}
              </Typography>
            </Box>
            {/* Phone numbers kept as is */}
            <Link
              href="tel:+8801234567890"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                display: "block",
                mb: 0.5,
                "&:hover": { color: "primary.main" },
              }}
            >
              +880 1234-567890
            </Link>
            <Link
              href="tel:+8801987654321"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                display: "block",
                "&:hover": { color: "primary.main" },
              }}
            >
              +880 1987-654321
            </Link>
          </CardContent>
        </ContactCard>
      </Grid>

      {/* Email Card */}
      <Grid item>
        <ContactCard>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={1.5}>
              <Email color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="h6" component="h3">
                {t("email_us")} {/* Applied */}
              </Typography>
            </Box>
            {/* Emails kept as is */}
            <Link
              href="mailto:info@banglaghor.com"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                display: "block",
                mb: 0.5,
                "&:hover": { color: "primary.main" },
              }}
            >
              info@banglaghor.com
            </Link>
            <Link
              href="mailto:sales@banglaghor.com"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                display: "block",
                "&:hover": { color: "primary.main" },
              }}
            >
              sales@banglaghor.com
            </Link>
          </CardContent>
        </ContactCard>
      </Grid>

      {/* Address Card */}
      <Grid item>
        <ContactCard>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={1.5}>
              <LocationOn color="primary" sx={{ mr: 1.5 }} />
              <Typography variant="h6" component="h3">
                {t("visit_us")} {/* Applied */}
              </Typography>
            </Box>
            {/* Address kept as is */}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              House #42, Road #11, Banani
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Dhaka 1213, Bangladesh
            </Typography>
          </CardContent>
        </ContactCard>
      </Grid>

      {/* Social Media Card */}
      <Grid item>
        <ContactCard>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={1.5}>
              <Typography variant="h6" component="h3">
                {t("connect_with_us")} {/* Applied */}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center" flexWrap="wrap">
              {socialLinks.map((social) => (
                <AnimatedIconButton
                  key={social.label}
                  aria-label={social.label} // Kept label as is for aria
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label} // Kept label as is for title
                >
                  {social.icon}
                </AnimatedIconButton>
              ))}
            </Box>
          </CardContent>
        </ContactCard>
      </Grid>
    </Grid>
  );
};

export default ContactInfo;
