import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useTranslation } from "react-i18next";

// Import Auth Hook
import { useAuth } from "./../../context/AuthContext"; // Adjust path as needed

// Import Listing Form Hook and Step Components
import useListingForm from "./hooks/useListingForm";
import Step1_Details from "./components/Step1_Details";
import Step2_Location from "./components/Step2_Location";
import Step3_Features from "./components/Step3_Features";
import Step_Bangladesh_Details from "./components/Step_Bangladesh_Details"; // New
import Step4_Images from "./components/Step4_Images"; // Original Step 4 is now Image Upload
import Step_Description from "./components/Step_Description"; // New
import Step5_Review from "./components/Step5_Review"; // Original Step 5 is now Review

// Styled components (keep as is)
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
 * ListPropertyPage Component - Updated
 */
const ListPropertyPage = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useAuth(); // Get user and login status
  const navigate = useNavigate();

  const {
    activeStep,
    steps, // Get updated steps from the hook
    formData,
    features, // Get standard features state
    images,
    errors,
    loadingAI,
    loadingSubmit,
    snackbar,
    handleChange,
    handleFeatureChange, // Pass standard features handler
    handleImageUpload,
    removeImageByIndex, // Pass image removal handler
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
    // validateStep, // No longer needed directly in this component
  } = useListingForm();

  // --- Login Enforcement ---
  useEffect(() => {
    // Redirect to login if not logged in (adjust path if needed)
    // Give a brief moment for auth state to potentially initialize
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        console.log("User not logged in, redirecting to login.");
        navigate("/login", { state: { from: "/list-property" } }); // Redirect and pass origin
      }
    }, 200); // Small delay to allow auth context to initialize
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  // --- Function to render the content for the current step - Updated ---
  const getStepContent = (step) => {
    // Determine if the Features step (index 2) should be rendered
    const isLandOrCommercial =
      formData.propertyType === "land" ||
      formData.propertyType === "commercial";
    if (step === 2 && isLandOrCommercial) {
      // Should not happen if handleNext/handleBack logic is correct, but acts as a fallback
      console.warn("Attempted to render Features step for land/commercial.");
      return (
        <Typography>Features not applicable for this property type.</Typography>
      );
    }

    switch (step) {
      case 0: // Basic Info
        return (
          <Step1_Details
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            // Removed generateDescription and loadingAI props from here
          />
        );
      case 1: // Location
        return (
          <Step2_Location
            formData={formData}
            errors={errors}
            handleChange={handleChange}
          />
        );
      case 2: // Features (Standard) - Rendered only if not land/commercial
        return (
          <Step3_Features
            features={features} // Pass the separate features state
            handleFeatureChange={handleFeatureChange} // Pass the specific handler
            formData={formData} // Pass formData to potentially disable based on type again
          />
        );
      case 3: // Specific Details (BD Context) - New Step
        return (
          <Step_Bangladesh_Details
            formData={formData} // Pass full formData (includes nested bangladeshDetails)
            errors={errors.bangladeshDetails || {}} // Pass nested errors
            handleChange={handleChange} // Use the main handler
          />
        );
      case 4: // Upload Photos
        return (
          <Step4_Images
            images={images}
            handleImageUpload={handleImageUpload} // Pass the correct handler
            removeImageByIndex={removeImageByIndex} // Pass remove handler
            errors={errors}
          />
        );
      case 5: // Description - New Step
        return (
          <Step_Description
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            generateDescription={generateDescription} // Pass AI generator
            loadingAI={loadingAI} // Pass loading state
          />
        );
      case 6: // Review
        return (
          <Step5_Review // Using original component name, but it's the last step now
            formData={formData}
            features={features} // Pass standard features
            images={images}
            // No direct handlers needed for review usually
          />
        );
      default:
        console.error("Unknown step index:", step);
        throw new Error("Unknown step");
    }
  };

  // Show loading or message while checking auth or if not logged in
  if (!isLoggedIn) {
    // You might want a more sophisticated loading state here
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Checking authentication...</Typography>
      </Container>
    );
  }

  // Render the form stepper if logged in
  return (
    <Container maxWidth="md">
      <StyledPaper>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          {t("list_your_property")}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
            // Optional: Mark skipped steps visually?
            // const isSkipped = index === 2 && (formData.propertyType === 'land' || formData.propertyType === 'commercial');
            // if (isSkipped) {
            //     stepProps.completed = false; // Or handle skipped state if Stepper supports it well
            // }
            return (
              <Step key={label} {...stepProps}>
                {/* Use translation keys for step labels if available */}
                <StepLabel {...labelProps}>
                  {t(`step_${label.toLowerCase().replace(" ", "_")}`, label)}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Render current step content */}
        <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loadingSubmit}
            onClick={handleBack} // Updated handler
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            {t("back", "Back")}
          </Button>
          <StyledButton
            variant="contained"
            color="primary"
            disabled={loadingSubmit || loadingAI} // Disable if AI is running too
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext // Updated handlers
            }
          >
            {loadingSubmit ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              t("submit_property")
            ) : (
              t("continue")
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
