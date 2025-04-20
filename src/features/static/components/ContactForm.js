import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  styled,
  CircularProgress, // Import CircularProgress
} from "@mui/material";
import { Send } from "@mui/icons-material"; // Import Send icon

// --- Styled Components (Copied from original contact.js) ---

// TextField styling
const ContactTextField = styled(TextField)(({ theme }) => ({
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
  // Style labels if needed
  // '& label.Mui-focused': {
  //   color: theme.palette.primary.main,
  // },
}));

// Submit button styling
const StyledSubmitButton = styled(Button)(({ theme }) => ({
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

// --- Component ---

/**
 * ContactForm Component
 * Renders the contact form fields and handles submission via props.
 * @param {object} props - Component props
 * @param {object} props.formData - Current form data (name, email, phone, subject, message)
 * @param {object} props.formErrors - Validation errors for fields
 * @param {function} props.handleChange - Function to handle input changes
 * @param {function} props.handleSubmit - Function to handle form submission
 * @param {boolean} props.isSubmitting - Boolean indicating if the form is currently submitting
 */
const ContactForm = ({
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isSubmitting,
}) => {
  return (
    // Use Paper for elevation and background styling consistent with original
    <Paper
      elevation={3}
      sx={(theme) => ({
        // Use sx prop with theme access
        p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${
          theme.palette.background.paper
        } 0%, ${
          theme.palette.mode === "dark"
            ? "rgba(40, 40, 40, 0.9)"
            : "rgba(239, 249, 254, 0.9)"
        } 100%)`, // Adjusted gradient for theme
        boxShadow: `0 10px 30px ${
          theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.2)"
            : "rgba(43, 123, 140, 0.1)"
        }`, // Adjusted shadow
        position: "relative",
        overflow: "hidden", // Keep overflow hidden for corner effect
        height: "100%", // Ensure Paper takes full height if needed in Grid
      })}
    >
      {/* Decorative corner element from original */}
      <Box
        sx={(theme) => ({
          position: "absolute",
          top: 0,
          right: 0,
          width: { xs: "100px", sm: "150px" }, // Responsive size
          height: { xs: "100px", sm: "150px" },
          background: `linear-gradient(135deg, transparent 0%, ${theme.palette.primary.main}22 100%)`, // Use theme primary with opacity
          borderRadius: "0 0 0 100%",
          zIndex: 0, // Ensure it's behind content
        })}
      />

      {/* Form Title */}
      <Typography
        variant="h5"
        component="h3" // Correct semantic heading level
        gutterBottom
        fontWeight="medium"
        sx={{ mb: 3, position: "relative", zIndex: 1 }} // Ensure title is above corner element
      >
        Send Us a Message
      </Typography>

      {/* Form Element */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Grid container spacing={2}>
          {/* Name Field */}
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              error={!!formErrors.name} // Show error state if error exists
              helperText={formErrors.name || " "} // Show error message or space to prevent layout shift
              inputProps={{ "aria-label": "Your Name" }} // Accessibility
            />
          </Grid>
          {/* Email Field */}
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              error={!!formErrors.email}
              helperText={formErrors.email || " "}
              inputProps={{ "aria-label": "Email Address" }}
            />
          </Grid>
          {/* Phone Field */}
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label="Phone Number (Optional)" // Label as optional if it is
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              error={!!formErrors.phone} // Optional validation
              helperText={formErrors.phone || " "}
              inputProps={{ "aria-label": "Phone Number" }}
            />
          </Grid>
          {/* Subject Field */}
          <Grid item xs={12} sm={6}>
            <ContactTextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              variant="outlined"
              error={!!formErrors.subject}
              helperText={formErrors.subject || " "}
              inputProps={{ "aria-label": "Subject" }}
            />
          </Grid>
          {/* Message Field */}
          <Grid item xs={12}>
            <ContactTextField
              fullWidth
              label="Your Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              multiline
              rows={4} // Adjust rows as needed
              variant="outlined"
              error={!!formErrors.message}
              helperText={formErrors.message || " "}
              inputProps={{ "aria-label": "Your Message" }}
            />
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <StyledSubmitButton
            type="submit"
            variant="contained"
            // Use endIcon for loading indicator or send icon
            endIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Send />
              )
            }
            disabled={isSubmitting} // Disable button during submission
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </StyledSubmitButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ContactForm;
