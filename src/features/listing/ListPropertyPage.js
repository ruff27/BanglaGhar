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
import { useTranslation } from "react-i18next"; // Import useTranslation

// Import Hook and Step Components
import useListingForm from "./hooks/useListingForm";
import Step1_Details from "./components/Step1_Details";
import Step2_Location from "./components/Step2_Location";
import Step3_Features from "./components/Step3_Features";
import Step4_Images from "./components/Step4_Images";
import Step5_Review from "./components/Step5_Review";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(43, 123, 140, 0.1)",
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: "none",
}));

/**
 * ListPropertyPage Component
 */
const ListPropertyPage = () => {
  const { t } = useTranslation(); // Initialize translation
  const {
    activeStep,
    steps, // Assuming steps = ['Details', 'Location', 'Features', 'Images', 'Review'] or similar
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
      <StyledPaper>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          {t("list_your_property")} {/* Applied translation */}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {/* Stepper labels are likely defined in useListingForm hook and might not have direct keys */}
          {/* Keeping original labels unless specific keys are provided/found */}
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
            disabled={activeStep === 0 || loadingSubmit}
            onClick={handleBack}
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Back {/* <-- Kept as is, no key found */}
          </Button>
          <StyledButton
            variant="contained"
            color="primary"
            disabled={loadingSubmit}
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
          >
            {loadingSubmit ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              t("submit_property") // Applied translation
            ) : (
              t("continue") // Applied translation
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
        {/* Snackbar message comes from hook state, assumed to be translated there or simple english */}
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
