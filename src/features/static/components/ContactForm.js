import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  styled,
  CircularProgress,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { useTranslation } from "react-i18next"; // Import useTranslation

// --- Styled Components ---
const ContactTextField = styled(TextField)(({ theme }) => ({
  // ... (styling kept as is)
  marginBottom: theme.spacing(2), // Keep consistent spacing
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      // Default border
      // borderColor: theme.palette.divider, // Example: Subtle border
    },
    "&:hover fieldset": {
      // borderColor: theme.palette.text.secondary, // Example: Border on hover
    },
    "&.Mui-focused fieldset": {
      // Border when focused
      borderColor: theme.palette.primary.main,
      borderWidth: "1px", // Ensure focus border width is standard
    },
  },
}));

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  // ... (styling kept as is)
  backgroundColor: theme.palette.primary.main,
  color: "white",
  padding: "12px 24px",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.05)", // Subtle scale on hover
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    cursor: "not-allowed", // Indicate disabled state
  },
}));

/**
 * ContactForm Component
 */
const ContactForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <Paper
      elevation={3}
      sx={(theme) => ({
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${
          theme.palette.background.paper
        } 0%, ${
          theme.palette.mode === "dark"
            ? "rgba(40, 40, 40, 0.9)"
            : "rgba(239, 249, 254, 0.9)"
        } 100%)`,
        boxShadow: `0 10px 30px ${
          theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.2)"
            : "rgba(43, 123, 140, 0.1)"
        }`,
        position: "relative",
        overflow: "hidden",
        height: "100%",
      })}
    >
      <Box
        sx={(theme) => ({
          /* Decorative corner */
        })}
      />

      <Typography
        variant="h5"
        component="h3"
        gutterBottom
        fontWeight="medium"
        sx={{ mb: 3, position: "relative", zIndex: 1 }}
      >
        {t("send_us_message")} {/* Applied */}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label={t("name")} // Applied
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              error={!!formErrors.name}
              helperText={formErrors.name || " "}
              inputProps={{ "aria-label": t("name") }} // Applied
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label={t("email")} // Applied
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              error={!!formErrors.email}
              helperText={formErrors.email || " "}
              inputProps={{ "aria-label": t("email") }} // Applied
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label="Phone Number (Optional)" // Kept as is, no key
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              error={!!formErrors.phone}
              helperText={formErrors.phone || " "}
              inputProps={{ "aria-label": "Phone Number" }} // Kept as is
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label="Subject" // Kept as is, no key
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              variant="outlined"
              error={!!formErrors.subject}
              helperText={formErrors.subject || " "}
              inputProps={{ "aria-label": "Subject" }} // Kept as is
            />
          </Grid>
          <Grid item xs={12}>
            <ContactTextField
              fullWidth
              label="Your Message" // Kept as is, no key
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              multiline
              rows={4}
              variant="outlined"
              error={!!formErrors.message}
              helperText={formErrors.message || " "}
              inputProps={{ "aria-label": "Your Message" }} // Kept as is
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <StyledSubmitButton
            type="submit"
            variant="contained"
            endIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Send />
              )
            }
            disabled={isSubmitting}
          >
            {/* Applied */}
            {isSubmitting ? t("sending") : t("send_message")}
          </StyledSubmitButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ContactForm;
