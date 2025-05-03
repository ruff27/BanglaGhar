// src/features/listing/ListPropertyPage.js

import React, { useEffect, useState } from "react"; // Keep useEffect if needed elsewhere, otherwise remove
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
  CircularProgress, // Keep if used for loadingSubmit/loadingAI
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Import Auth Hook - Still needed to get user info for the form hook
import { useAuth } from "./../../context/AuthContext";

// Import Listing Form Hook and Step Components
import useListingForm from "./hooks/useListingForm";
import Step1_Details from "./components/Step1_Details";
import Step2_Location from "./components/Step2_Location";
import Step3_Features from "./components/Step3_Features";
import Step_Bangladesh_Details from "./components/Step_Bangladesh_Details";
import Step4_Images from "./components/Step4_Images";
import Step_Description from "./components/Step_Description";
import Step5_Review from "./components/Step5_Review";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

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

const ListPropertyPage = () => {
  const { t } = useTranslation();
  // const { user, isLoggedIn } = useAuth(); // isLoggedIn is no longer needed here
  const navigate = useNavigate(); // Keep navigate if used elsewhere
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);

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
    removeImageByIndex,
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
  } = useListingForm();

  const handleCancelListing = () => {
    setCancelConfirmOpen(true); // Open the dialog instead of navigating directly
  };

  const confirmCancelListing = () => {
    setCancelConfirmOpen(false); // Close the dialog
    navigate("/home"); // Navigate to the home page or dashboard
  };

  const closeCancelConfirmDialog = () => {
    setCancelConfirmOpen(false);
  };

  // --- Function to render the content for the current step - Updated ---
  const getStepContent = (step) => {
    const isLandOrCommercial =
      formData.propertyType === "land" ||
      formData.propertyType === "commercial";
    if (step === 2 && isLandOrCommercial) {
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
      case 2: // Features (Standard)
        return (
          <Step3_Features
            features={features}
            handleFeatureChange={handleFeatureChange}
            formData={formData}
          />
        );
      case 3: // Specific Details (BD Context)
        return (
          <Step_Bangladesh_Details
            formData={formData}
            errors={errors.bangladeshDetails || {}}
            handleChange={handleChange}
          />
        );
      case 4: // Upload Photos
        return (
          <Step4_Images
            images={images}
            handleImageUpload={handleImageUpload}
            removeImageByIndex={removeImageByIndex}
            errors={errors}
          />
        );
      case 5: // Description
        return (
          <Step_Description
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            generateDescription={generateDescription}
            loadingAI={loadingAI}
          />
        );
      case 6: // Review
        return (
          <Step5_Review
            formData={formData}
            features={features}
            images={images}
          />
        );
      default:
        console.error("Unknown step index:", step);
        throw new Error("Unknown step");
    }
  };

  // --- REMOVED Conditional Rendering Based on Login ---
  // The `if (!isLoggedIn)` block that showed "Checking authentication..." is removed.
  // ---

  // Render the form stepper (assuming user is authenticated if this page loads)
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
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>
                  {t(`step_${label.toLowerCase().replace(" ", "_")}`, label)}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
          }}
        >
          {/* Back Button - Outlined Primary */}
          <Button
            disabled={activeStep === 0 || loadingSubmit}
            onClick={handleBack}
            variant="outlined"
            // Use primary color outline for better visibility
            color="primary"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            {t("back", "Back")}
          </Button>

          {/* Cancel Button - Outlined Error */}
          <Button
            variant="outlined"
            color="error" // Keep error color for this action
            onClick={handleCancelListing}
            disabled={loadingSubmit || loadingAI}
            sx={{ borderRadius: "8px", textTransform: "none", mx: 2 }}
          >
            {t("cancel_listing", "Cancel Listing")}
          </Button>

          {/* Continue/Submit Button - Contained Primary */}
          <StyledButton
            variant="contained"
            color="primary"
            disabled={loadingSubmit || loadingAI}
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
            sx={{ ml: "auto" }} // Push to the right
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

      <ConfirmationDialog
        open={isCancelConfirmOpen}
        onClose={closeCancelConfirmDialog} // Closes dialog without action
        onConfirm={confirmCancelListing} // Performs the cancel action
        title="Cancel Property Listing"
        message="Are you sure you want to cancel listing this property? Any progress will be lost."
        confirmText="Yes, Cancel Listing"
        cancelText="No, Continue Editing"
        confirmButtonProps={{ color: "error" }} // Make confirm button red
        cancelButtonProps={{ color: "primary" }}
        isConfirming={false} // Not typically needed for cancel, but available
      />
    </Container>
  );
};

export default ListPropertyPage;
