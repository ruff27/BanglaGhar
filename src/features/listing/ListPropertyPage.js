import React, { useEffect, useState } from "react"; 
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
  CircularProgress, 
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import InfoIcon from "@mui/icons-material/Info"; 
import LocationOnIcon from "@mui/icons-material/LocationOn"; 
import ListAltIcon from "@mui/icons-material/ListAlt"; 
import DescriptionIcon from "@mui/icons-material/Description"; 
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"; 
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; 
import ArticleIcon from "@mui/icons-material/Article"; 


import { useAuth } from "./../../context/AuthContext";


import useListingForm from "./hooks/useListingForm";
import Step1_Details from "./components/Step1_Details";
import Step2_Location from "./components/Step2_Location";
import Step3_Features from "./components/Step3_Features";
import Step_Bangladesh_Details from "./components/Step_Bangladesh_Details";
import Step4_Images from "./components/Step4_Images";
import Step_Description from "./components/Step_Description";
import Step5_Review from "./components/Step5_Review";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)", 
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),

  
  backgroundColor: "#D9F2F0", 

  border: `1px solid #A0DAD6`, 
  
  background: "none", 
  "&::before": {
    display: "none", 
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
  
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const {
    activeStep,
    steps,
    formData,
    features,
    imageUrls, 
    imageUploadStates, 
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
    
  } = useListingForm();

  const currentStepLabel =
    activeStep >= 0 && activeStep < steps.length ? steps[activeStep] : "";

  const currentStepTitle = t(
    `step_${currentStepLabel.toLowerCase().replace(/ /g, "_")}`,
    currentStepLabel 
  );

  const stepIcons = [
    InfoIcon, 
    LocationOnIcon, 
    ListAltIcon, 
    ArticleIcon, 
    PhotoLibraryIcon, 
    DescriptionIcon, 
    CheckCircleOutlineIcon, 
  ];
  const CurrentStepIcon = stepIcons[activeStep] || InfoIcon;

  const handleCancelListing = () => {
    setCancelConfirmOpen(true); 
  };

  const confirmCancelListing = () => {
    setCancelConfirmOpen(false); 
    navigate("/home"); 
  };

  const closeCancelConfirmDialog = () => {
    setCancelConfirmOpen(false);
  };

  
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
            imageUrls={imageUrls} 
            imageUploadStates={imageUploadStates} 
            handleImageFileSelected={handleImageFileSelected} 
            removeImageByUrl={removeImageByUrl} 
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
            images={imageUrls} 
          />
        );
      default:
        console.error("Unknown step index:", step);
        throw new Error("Unknown step");
    }
  };

  
  return (
    <Container maxWidth="md">
      <StyledPaper>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: "#2C3E50", 
            fontWeight: 700,
          }}
        >
          {t("list_your_property")}
        </Typography>
        {isMobile ? (
         
          <Box
            sx={{
              my: 3, 
              display: "flex",
              flexDirection: "column", 
              alignItems: "center",
              gap: 0.5, 
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
                color: "#2C3E50", 
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
            onClick={() => setCancelConfirmOpen(true)} 
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
            sx={{ ml: "auto" }} 
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
        isConfirming={false} 
      />
    </Container>
  );
};

export default ListPropertyPage;
