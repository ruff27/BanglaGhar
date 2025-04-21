import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  Snackbar,
  Alert,
  styled,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next"; // Import useTranslation

// Import the new hook and components
import useContactForm from "./hooks/useContactForm";
import ContactInfo from "./components/ContactInfo";
import ContactForm from "./components/ContactForm";

// --- Styled Components ---
const WavePattern = styled(Box)(({ theme }) => ({
  // ... (styling kept as is)
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "100px", // Adjust height as needed
  // Complex SVG background - consider performance on complex pages
  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='0.25' fill='%232B7B8C'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='0.5' fill='%232B7B8C'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%232B7B8C'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundSize: "cover",
  opacity: 0.1,
  zIndex: 0,
}));

const MapContainer = styled(Box)(({ theme }) => ({
  // ... (styling kept as is)
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  height: "100%",
  minHeight: "350px", // Ensure minimum height for map visibility
}));

const FAQCard = styled(Card)(({ theme }) => ({
  // ... (styling kept as is)
  height: "100%",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)", // Slightly less lift than info cards
    boxShadow: `0 8px 15px ${
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.15)"
        : "rgba(43, 123, 140, 0.15)"
    }`,
  },
  backgroundColor: theme.palette.background.paper,
  borderRadius: "12px",
}));

// --- Data (Retained from original for Page Sections) ---
// Use translation keys for FAQ content
const faqKeys = [
  { questionKey: "faq_q1", answerKey: "faq_a1" },
  { questionKey: "faq_q2", answerKey: "faq_a2" },
  { questionKey: "faq_q3", answerKey: "faq_a3" },
  { questionKey: "faq_q4", answerKey: "faq_a4" },
];

/**
 * ContactPage Container
 */
const ContactPage = () => {
  const theme = useTheme();
  const { t } = useTranslation(); // Initialize translation
  const {
    formData,
    formErrors,
    isSubmitting,
    snackbar,
    handleChange,
    handleSubmit,
    handleCloseSnackbar,
  } = useContactForm();

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        overflow: "hidden",
      }}
    >
      <WavePattern />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              color: theme.palette.primary.main,
              position: "relative",
              display: "inline-block",
              mb: 3,
              "&::after": {
                /* Underline effect */
              },
            }}
          >
            {t("contact_title")} {/* Applied */}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "700px", mx: "auto" }}
          >
            {t("contact_subtitle")} {/* Applied */}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <ContactInfo />{" "}
            {/* Assumes translations are handled inside ContactInfo */}
          </Grid>
          <Grid item xs={12} md={8}>
            <ContactForm
              formData={formData}
              formErrors={formErrors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            <Box mt={4}>
              <Paper
                elevation={3}
                sx={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <MapContainer>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.833519939074!2d90.4069779153943!3d23.78899069321744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70b540e2a9f%3A0x3a5fca6ac96a40b0!2sBanani%20Model%20Town%2C%20Dhaka%201213!5e0!3m2!1sen!2sbd!4v1678886400000!5m2!1sen!2sbd" // REPLACE with correct embed URL
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="BanglaGhor Office Location"
                  ></iframe>
                </MapContainer>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        <Box mt={8}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="medium"
            sx={{ mb: 4 }}
          >
            {t("faq")} {/* Applied */}
          </Typography>
          <Grid container spacing={3}>
            {faqKeys.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <FAQCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      component="h4"
                      fontWeight="medium"
                      gutterBottom
                    >
                      {t(faq.questionKey)} {/* Applied */}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {t(faq.answerKey)} {/* Applied */}
                    </Typography>
                  </CardContent>
                </FAQCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box mt={8} textAlign="center">
          <Typography variant="h5" gutterBottom fontWeight="medium">
            {t("office_hours")} {/* Applied */}
          </Typography>
          <Divider
            sx={{
              width: "60px",
              height: "3px",
              backgroundColor: theme.palette.primary.main,
              margin: "12px auto 24px",
            }}
          />
          <Grid container justifyContent="center" spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: "12px" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {t("weekdays")} {/* Applied */}
                </Typography>
                <Typography variant="body1">9:00 AM - 6:00 PM</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: "12px" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {t("saturdays")} {/* Applied */}
                </Typography>
                <Typography variant="body1">10:00 AM - 5:00 PM</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: "12px" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {t("fridays_holidays")} {/* Applied */}
                </Typography>
                <Typography variant="body1">{t("closed")}</Typography>{" "}
                {/* Applied */}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {/* Assume message is simple or translated in hook */}
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;
