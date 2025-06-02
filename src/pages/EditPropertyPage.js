import React from "react";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useEditPropertyForm from "../features/listing/hooks/useEditPropertyForm"; 
import EditPropertyForm from "../features/listing/components/EditPropertyForm"; 
import { useSnackbar } from "../context/SnackbarContext"; 

const EditPropertyPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const {
    propertyData,
    setPropertyData,
    initialLoading,
    isSubmitting,
    error,
    validationErrors,
    handleInputChange,
    handleFeaturesChange,
    handleBangladeshDetailsChange,
    handleSubmit,
  } = useEditPropertyForm(propertyId);

  const onSubmit = async (event) => {
    event.preventDefault();
    const success = await handleSubmit();
    if (success) {
      showSnackbar(
        t("property_updated_success", "Property updated successfully!"),
        "success"
      );
      navigate("/my-listings");
    } else {
      // Error is handled by the hook and displayed in the form or as a general error
      showSnackbar(
        t(
          "property_update_failed",
          "Failed to update property. Please check errors."
        ),
        "error"
      );
    }
  };

  if (initialLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {t("loading_property_data", "Loading property data...")}
        </Typography>
      </Container>
    );
  }

  if (error && !propertyData) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!propertyData) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 3 }}>
          {t(
            "property_not_found_edit",
            "Property data could not be loaded for editing."
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", mb: 3 }}
        >
          {t("edit_property_title", "Edit Your Property")}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <EditPropertyForm
          formData={propertyData}
          onInputChange={handleInputChange}
          onFeaturesChange={handleFeaturesChange}
          onBangladeshDetailsChange={handleBangladeshDetailsChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          validationErrors={validationErrors}
          setFormDataDirectly={setPropertyData}
        />
      </Paper>
    </Container>
  );
};

export default EditPropertyPage;
