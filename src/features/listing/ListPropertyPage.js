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
  useMediaQuery,
  alpha,
  Alert,
  useTheme,
  CircularProgress, // Keep if used for loadingSubmit/loadingAI
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import InfoIcon from "@mui/icons-material/Info"; // Example for Basic Info
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Example for Location
import ListAltIcon from "@mui/icons-material/ListAlt"; // Example for Features
import DescriptionIcon from "@mui/icons-material/Description"; // Example for Description
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"; // Example for Images
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Example for Review
import ArticleIcon from "@mui/icons-material/Article"; // Example for Specific Details

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
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)", // Adjusted shadow slightly
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),

  // --- Apply New Background & Border ---
  backgroundColor: "#D9F2F0", // Soft Teal / Pale Blue-Green (Choose one, e.g., D9F2F0)
  // Or use the other option:rgb(237, 246, 245)

  border: `1px solid #A0DAD6`, // Slightly darker teal border

  // Remove previous background styles if any
  background: "none", // Override potential gradients/images
  "&::before": {
    display: "none", // Ensure pseudo-element background is off
  },
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
  const theme = useTheme();
  // Check if screen is small breakpoint ('sm') or smaller
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const {
    activeStep,
    steps,
    formData,
    features,
    imageUrls, // Should be an empty array [] initially from useListingForm
    imageUploadStates, // Should be an empty object {} initially
    handleImageFileSelected,
    removeImageByUrl,
    errors,
    loadingAI,
    loadingSubmit,
    snackbar,
    handleChange,
    handleFeatureChange,
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
    // validateStep, // This was in the hook but not explicitly destructured here before, add if needed
  } = useListingForm();

  const currentStepLabel =
    activeStep >= 0 && activeStep < steps.length ? steps[activeStep] : "";

  const currentStepTitle = t(
    `step_${currentStepLabel.toLowerCase().replace(/ /g, "_")}`,
    currentStepLabel // Fallback text is the raw label
  );

  const stepIcons = [
    InfoIcon, // Step 0: Basic Info
    LocationOnIcon, // Step 1: Location
    ListAltIcon, // Step 2: Features
    ArticleIcon, // Step 3: Specific Details
    PhotoLibraryIcon, // Step 4: Upload Photos
    DescriptionIcon, // Step 5: Description
    CheckCircleOutlineIcon, // Step 6: Review
  ];
  const CurrentStepIcon = stepIcons[activeStep] || InfoIcon;

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
        console.log(
          "[ListPropertyPage/getStepContent] For Step 4 - imageUrls being passed:",
          imageUrls
        );
        console.log(
          "[ListPropertyPage/getStepContent] For Step 4 - imageUploadStates being passed:",
          imageUploadStates
        );
        console.log(
          "[ListPropertyPage/getStepContent] For Step 4 - typeof handleImageFileSelected:",
          typeof handleImageFileSelected
        );
        console.log(
          "[ListPropertyPage/getStepContent] For Step 4 - typeof removeImageByUrl:",
          typeof removeImageByUrl
        );
        return (
          <Step4_Images
            imageUrls={imageUrls} // Pass the new S3 URLs array
            imageUploadStates={imageUploadStates} // Pass the upload status tracker
            handleImageFileSelected={handleImageFileSelected} // Pass the new S3 upload handler
            removeImageByUrl={removeImageByUrl} // Pass the new S3 URL removal handler
            errors={errors} // Pass errors object (might contain errors.images)
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
            images={imageUrls} // Pass S3 URLs to the review component
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
        <Typography
          component="h1"
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: "#2C3E50", // Deep Teal or Charcoal
            fontWeight: 700,
          }}
        >
          {t("list_your_property")}
        </Typography>
        {isMobile ? (
          // --- Mobile View: Updated Icon & Title ---
          <Box
            sx={{
              my: 3, // Vertical margin
              display: "flex",
              flexDirection: "column", // Stack icon/title
              alignItems: "center",
              gap: 0.5, // Space between icon and title
            }}
          >
            {/* Ensure CurrentStepIcon and currentStepTitle are correctly defined and available in this scope */}
            {CurrentStepIcon && (
              <CurrentStepIcon
                sx={{ fontSize: "2rem", color: "primary.main" }}
              />
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: "#2C3E50", // Deep Teal / Charcoal text color
              }}
            >
              {currentStepTitle}
            </Typography>
          </Box>
        ) : (
          // --- Desktop View: Standard Horizontal Stepper ---
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => {
              return (
                <Step key={label}>
                  <StepLabel>
                    {t(`step_${label.toLowerCase().replace(/ /g, "_")}`, label)}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        )}

        <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
          }}
        >
          {/* Back Button */}
          <Button
            disabled={activeStep === 0 || loadingSubmit || loadingAI}
            onClick={handleBack}
            variant="outlined"
            color="primary"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            {t("back", "Back")}
          </Button>

          {/* Cancel Button */}
          <Button
            variant="outlined"
            color="error"
            onClick={() => setCancelConfirmOpen(true)} // Ensure setCancelConfirmOpen is from useState
            disabled={loadingSubmit || loadingAI}
            sx={{ borderRadius: "8px", textTransform: "none", mx: 2 }}
          >
            {t("cancel_listing", "Cancel Listing")}
          </Button>

          {/* Continue/Submit Button */}
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
        onClose={closeCancelConfirmDialog}
        onConfirm={confirmCancelListing}
        title={t(
          "cancel_listing_confirmation_title",
          "Cancel Property Listing"
        )}
        message={t(
          "cancel_listing_confirmation_message",
          "Are you sure you want to cancel listing this property? Any progress will be lost."
        )}
        confirmText={t("yes_cancel_listing", "Yes, Cancel Listing")}
        cancelText={t("no_continue_editing", "No, Continue Editing")}
        confirmButtonProps={{ color: "error" }}
        cancelButtonProps={{ color: "primary" }}
        isConfirming={false} // Usually false for a cancel dialog, unless there's an async action on confirm
      />
    </Container>
  );
};

export default ListPropertyPage;
