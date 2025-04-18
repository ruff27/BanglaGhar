import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Import Hook and Step Components
import useListingForm from "./hooks/useListingForm";
import Step1_Details from "./components/Step1_Details";
import Step2_Location from "./components/Step2_Location";
import Step3_Features from "./components/Step3_Features";
import Step4_Images from "./components/Step4_Images";
import Step5_Review from "./components/Step5_Review";

// Styled components (if any were defined in the original ListProperty.js, like StyledPaper)
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(43, 123, 140, 0.1)", // Example shadow
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  // Example Button style
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
}));

/**
 * ListPropertyPage Component
 *
 * Container for the multi-step property listing form.
 * Uses the useListingForm hook for state and logic.
 * Renders the appropriate step component based on the active step.
 */
const ListPropertyPage = () => {
  const {
    activeStep,
    steps,
    formData,
    features,
    images,
    errors,
    loadingAI,
    loadingSubmit,
    snackbar,
    handleChange,
    handleFeatureChange,
    handleImageUpload,
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
    validateStep,
  } = useListingForm();

  // Function to render the content for the current step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Step1_Details
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            generateDescription={generateDescription}
            loadingAI={loadingAI}
          />
        );
      case 1:
        return (
          <Step2_Location
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <Step3_Features
            features={features}
            handleFeatureChange={handleFeatureChange}
          />
        );
      case 3:
        return (
          <Step4_Images
            images={images}
            handleImageUpload={handleImageUpload}
            errors={errors}
          />
        );
      case 4:
        return (
          <Step5_Review
            formData={formData}
            features={features}
            images={images}
          />
        );
      default:
        throw new Error("Unknown step");
    }
  };

  return (
    <Container maxWidth="md">
      {" "}
      {/* Adjust maxWidth as needed */}
      <StyledPaper>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          List Your Property
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Render current step content */}
        <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loadingSubmit} // Disable back on first step or during submit
            onClick={handleBack}
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Back
          </Button>
          <StyledButton
            variant="contained"
            color="primary"
            disabled={loadingSubmit} // Disable next/submit during submission
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
          >
            {loadingSubmit ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              "Submit Property"
            ) : (
              "Continue"
            )}
          </StyledButton>
        </Box>
      </StyledPaper>
      {/* Submission Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListPropertyPage;
