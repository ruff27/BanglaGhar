import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card, // Keep imports used by sections retained here (FAQ, Hours)
  CardContent, // Keep imports used by sections retained here
  Divider, // Keep imports used by sections retained here
  useMediaQuery,
  Snackbar,
  Alert,
  styled,
} from "@mui/material";
import { useTheme } from "@mui/material/styles"; // Keep useTheme if used by retained sections

// Import the new hook and components
import useContactForm from "./hooks/useContactForm";
import ContactInfo from "./components/ContactInfo";
import ContactForm from "./components/ContactForm";

// --- Styled Components (Retained from original for Page Layout/Sections) ---

// Styled component for the wave pattern background effect
const WavePattern = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "100px", // Adjust height as needed
  // Complex SVG background - consider performance on complex pages
  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='0.25' fill='%232B7B8C'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='0.5' fill='%232B7B8C'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%232B7B8C'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundSize: "cover",
  opacity: 0.1, // Keep opacity low
  zIndex: 0, // Ensure it's behind content
}));

// Map container styling
const MapContainer = styled(Box)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  height: "100%",
  minHeight: "350px", // Ensure minimum height for map visibility
}));

// Card styling used for FAQ section
const FAQCard = styled(Card)(({ theme }) => ({
  // Renamed to avoid conflict if ContactCard wasn't moved
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

// FAQ content
const faqContent = [
  {
    question: "How do I schedule a property viewing?",
    answer:
      "You can schedule a property viewing by filling out our contact form, calling our office, or sending us an email with your preferred date and time.",
  },
  {
    question: "What areas do you serve in Bangladesh?",
    answer:
      "We currently serve major cities including Dhaka, Chittagong, Sylhet, Rajshahi, and Khulna, with plans to expand to other regions soon.",
  },
  {
    question: "Do you handle commercial properties?",
    answer:
      "Yes, we handle both residential and commercial properties. Our experts can help you find the perfect space for your business needs.",
  },
  {
    question: "What documents do I need for property registration?",
    answer:
      "Property registration typically requires national ID, TIN certificate, passport-sized photos, and property documents. Our team will guide you through the process.",
  },
];

// --- Main Page Component ---

/**
 * ContactPage Container
 * The main page component for the Contact Us section.
 * It uses the useContactForm hook and renders ContactInfo, ContactForm,
 * Map, FAQ, and Office Hours sections.
 */
const ContactPage = () => {
  const theme = useTheme();
  // Use media queries if needed for layout adjustments not handled by Grid
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Use the custom hook to get form state and handlers
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
      {/* Render the wave pattern background */}
      <WavePattern />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Page Header */}
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
                // Underline effect
                content: '""',
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "4px",
                backgroundColor: theme.palette.primary.main,
                borderRadius: "2px",
              },
            }}
          >
            Get in Touch
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary" // Use theme's secondary text color
            sx={{ maxWidth: "700px", mx: "auto" }}
          >
            Find your perfect home in Bangladesh. Our real estate experts are
            ready to assist you every step of the way.
          </Typography>
        </Box>

        {/* Main Content Grid (Info + Form/Map) */}
        <Grid container spacing={4}>
          {/* Left Column: Contact Info */}
          <Grid item xs={12} md={4}>
            <ContactInfo /> {/* Render the imported ContactInfo component */}
          </Grid>

          {/* Right Column: Form and Map */}
          <Grid item xs={12} md={8}>
            {/* Render the imported ContactForm component */}
            <ContactForm
              formData={formData}
              formErrors={formErrors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />

            {/* Office Location Map (Retained from original) */}
            <Box mt={4}>
              <Paper
                elevation={3}
                sx={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <MapContainer>
                  {/* IMPORTANT: Replace with a valid Google Maps Embed API src or use a library like react-leaflet */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.833519939074!2d90.4069779153943!3d23.78899069321744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70b540e2a9f%3A0x3a5fca6ac96a40b0!2sBanani%20Model%20Town%2C%20Dhaka%201213!5e0!3m2!1sen!2sbd!4v1678886400000!5m2!1sen!2sbd" // Example Banani embed URL - REPLACE
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

        {/* FAQs Section (Retained from original) */}
        <Box mt={8}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="medium"
            sx={{ mb: 4 }}
          >
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={3}>
            {faqContent.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <FAQCard>
                  {" "}
                  {/* Use renamed FAQCard */}
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      component="h4"
                      fontWeight="medium"
                      gutterBottom
                    >
                      {faq.question}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </CardContent>
                </FAQCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Office Hours Section (Retained from original) */}
        <Box mt={8} textAlign="center">
          <Typography variant="h5" gutterBottom fontWeight="medium">
            Our Office Hours
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
                  Weekdays
                </Typography>
                <Typography variant="body1">9:00 AM - 6:00 PM</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: "12px" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Saturdays
                </Typography>
                <Typography variant="body1">10:00 AM - 5:00 PM</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: "12px" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Fridays & Holidays
                </Typography>
                <Typography variant="body1">Closed</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Success/Error Message Snackbar (State managed by hook) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000} // Keep duration reasonable
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {/* Ensure Alert is imported */}
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled" // Use filled variant for better visibility
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;
