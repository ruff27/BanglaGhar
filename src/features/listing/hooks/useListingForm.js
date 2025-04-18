import { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed

const API_BASE_URL = "http://localhost:5001/api"; // Use environment variable

// Define steps
const steps = ["Basic Info", "Location", "Features", "Upload Photos", "Review"];

// Initial form state
const initialFormData = {
  title: "",
  propertyType: "apartment", // Default value
  listingType: "rent", // Default value
  price: "",
  address: "",
  city: "",
  state: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  description: "",
  features: {
    // Nested features object
    parking: false,
    garden: false,
    airConditioning: false,
    furnished: false,
    pool: false,
  },
  images: [], // Array to store image file names or URLs
  createdBy: "", // Will be set from auth context
};

/**
 * Custom Hook to manage the multi-step property listing form.
 * Handles state, validation, API calls, and stepper navigation.
 */
const useListingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [features, setFeatures] = useState(initialFormData.features);
  const [images, setImages] = useState([]); // Separate state for image objects/previews if needed
  const [errors, setErrors] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Update createdBy when user context is available
  useState(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, createdBy: user.email }));
    }
  }, [user]);

  // --- Handlers ---
  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear specific error when user types
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const handleFeatureChange = useCallback((event) => {
    const { name, checked } = event.target;
    setFeatures((prev) => ({ ...prev, [name]: checked }));
    // Update formData as well
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [name]: checked },
    }));
  }, []);

  // Basic validation logic (expand as needed)
  const validateStep = (stepIndex) => {
    const currentErrors = {};
    const data = { ...formData, features }; // Combine main data and features

    switch (stepIndex) {
      case 0: // Basic Info
        if (!data.title.trim()) currentErrors.title = "Title is required";
        if (!data.propertyType)
          currentErrors.propertyType = "Property type is required";
        if (!data.listingType)
          currentErrors.listingType = "Listing type is required";
        if (!data.price || data.price <= 0)
          currentErrors.price = "Valid price is required";
        if (!data.area || data.area <= 0)
          currentErrors.area = "Valid area is required";
        if (!data.bedrooms || data.bedrooms < 0)
          currentErrors.bedrooms = "Valid bedroom count is required";
        if (!data.bathrooms || data.bathrooms < 0)
          currentErrors.bathrooms = "Valid bathroom count is required";
        break;
      case 1: // Location
        if (!data.address.trim()) currentErrors.address = "Address is required";
        if (!data.city.trim()) currentErrors.city = "City is required";
        if (!data.state.trim())
          currentErrors.state = "State/Division is required";
        break;
      case 2: // Features - Optional, maybe no validation needed unless specific rules apply
        break;
      case 3: // Upload Photos - Ensure at least one image?
        if (images.length === 0)
          currentErrors.images = "At least one image is recommended";
        break;
      case 4: // Review - No validation here, just submission
        break;
      default:
        break;
    }
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0; // Return true if no errors
  };

  // AI Description Generation
  const generateDescription = useCallback(async () => {
    setLoadingAI(true);
    setErrors((prev) => ({ ...prev, description: null })); // Clear previous description errors
    try {
      // Ensure required fields for prompt exist
      const requiredFields = [
        "title",
        "propertyType",
        "listingType",
        "price",
        "address",
        "city",
        "state",
        "area",
        "bedrooms",
        "bathrooms",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        throw new Error(
          `Missing required fields for description: ${missingFields.join(", ")}`
        );
      }

      const propertyDataForAI = { ...formData, features }; // Send combined data
      const response = await axios.post(
        `${API_BASE_URL}/generate-description`,
        { propertyData: propertyDataForAI }
      );
      setFormData((prev) => ({
        ...prev,
        description: response.data.description,
      }));
    } catch (error) {
      console.error("AI Description Error:", error);
      setErrors((prev) => ({
        ...prev,
        description: `Failed to generate description: ${
          error.message || "Server error"
        }`,
      }));
      setSnackbar({
        open: true,
        message: "Failed to generate description.",
        severity: "error",
      });
    } finally {
      setLoadingAI(false);
    }
  }, [formData, features]); // Dependencies for generation

  // Stepper Navigation
  const handleNext = useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [activeStep]); // Removed validateStep from dependencies to avoid re-creation

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  // Form Submission
  const handleSubmit = useCallback(async () => {
    if (!validateStep(activeStep)) {
      // Final validation before submit attempt
      console.error("Validation failed on final step", errors);
      setSnackbar({
        open: true,
        message: "Please fix errors before submitting.",
        severity: "warning",
      });
      return;
    }
    if (!user?.email) {
      setSnackbar({
        open: true,
        message: "User not identified. Please log in again.",
        severity: "error",
      });
      return;
    }

    setLoadingSubmit(true);
    setSnackbar({ open: false, message: "", severity: "info" }); // Clear previous snackbar

    const finalData = {
      ...formData,
      features: features,
      images: images.map((img) => img.name || img), // Assuming images state holds file objects or just names
      createdBy: user.email, // Ensure createdBy is set
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/properties`,
        finalData
      );
      console.log("Property submitted:", response.data);
      setSnackbar({
        open: true,
        message: "Property submitted successfully!",
        severity: "success",
      });
      // Reset form or navigate away after short delay
      setTimeout(() => {
        // setFormData(initialFormData); // Option 1: Reset form
        // setFeatures(initialFormData.features);
        // setImages([]);
        // setActiveStep(0);
        navigate("/user-profile"); // Option 2: Navigate away
      }, 1500);
    } catch (error) {
      console.error(
        "Error submitting property:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message: `Submission failed: ${
          error.response?.data?.error || error.message
        }`,
        severity: "error",
      });
    } finally {
      setLoadingSubmit(false);
    }
  }, [activeStep, formData, features, images, user, errors, navigate]); // Add dependencies

  // Image handling (basic example, adjust for your upload implementation)
  const handleImageUpload = useCallback(
    (uploadedImages) => {
      // uploadedImages could be File objects, URLs, etc.
      setImages(uploadedImages); // Update image state
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: null })); // Clear image error
      }
    },
    [errors.images]
  );

  // Snackbar close handler
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
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
    handleImageUpload, // Pass image handler
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
    validateStep, // Expose validateStep if needed by steps
  };
};

export default useListingForm;
