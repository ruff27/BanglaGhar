import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed

// Ensure your API base URL is correctly set, ideally via environment variables
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Define steps - Updated 7-Step Workflow
const steps = [
  "Basic Info", // 0
  "Location", // 1
  "Features", // 2 (Standard - potentially skipped)
  "Specific Details", // 3 (BD Context)
  "Upload Photos", // 4 (UI only for now)
  "Description", // 5
  "Review", // 6
];

// --- Initial Form State - Updated ---
const initialFormData = {
  // Step 0: Basic Info
  title: "",
  propertyType: "apartment",
  listingType: "rent",
  price: "",
  area: "", // Optional
  bedrooms: "", // Conditional
  bathrooms: "", // Conditional

  // Step 1: Location (Bangladesh Format)
  addressLine1: "",
  addressLine2: "",
  cityTown: "",
  upazila: "",
  district: "",
  postalCode: "",

  // Step 5: Description
  description: "",

  // Step 3: Specific Details (BD Context)
  bangladeshDetails: {
    propertyCondition: "",
    proximityToMainRoad: "",
    publicTransport: "",
    floodProne: "no",
    waterSource: "",
    gasSource: "",
    gasLineInstalled: "no",
    backupPower: "",
    sewerSystem: "",
    nearbySchools: "",
    nearbyHospitals: "",
    nearbyMarkets: "",
    nearbyReligiousPlaces: "",
    nearbyOthers: "",
    securityFeatures: [], // Array for multiple checkboxes
    earthquakeResistance: "unknown",
    roadWidth: "",
    parkingType: "",
    floorNumber: "",
    totalFloors: "",
    balcony: "no",
    rooftopAccess: "no",
    naturalLight: "",
    ownershipPapers: "unknown",
    propertyTenure: "",
    recentRenovations: "",
    nearbyDevelopments: "",
    reasonForSelling: "",
  },

  // Step 2: Standard Features (Separate state below, but keep structure here if API expects it flat initially)
  // features: { ... } // This will be handled by the separate `features` state variable

  createdBy: "", // Set from auth context
};

// --- Initial State for Standard Features (Step 2) ---
const initialFeatures = {
  parking: false,
  garden: false,
  airConditioning: false,
  furnished: "no", // 'no', 'semi', 'full'
  pool: false,
  // Add others like 'lift', 'servantRoom' if they are boolean checkboxes/selects
};

// Array for image state (manages File objects in UI even if not uploaded)
const initialImages = [];

/**
 * Custom Hook: useListingForm
 * Manages state, validation, API calls, and stepper navigation for property listing.
 */
const useListingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [features, setFeatures] = useState(initialFeatures); // State for standard features
  const [images, setImages] = useState(initialImages); // State for UI image handling
  const [errors, setErrors] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Update createdBy when user context is available
  useEffect(() => {
    if (user?.email && !formData.createdBy) {
      setFormData((prev) => ({ ...prev, createdBy: user.email }));
    }
  }, [user, formData.createdBy]);

  // --- Handlers ---

  // General Input Change Handler (Handles nested bangladeshDetails)
  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;

      if (name.startsWith("bangladeshDetails.")) {
        const detailKey = name.split(".")[1];

        if (detailKey === "securityFeatures") {
          // Handle multi-checkbox array
          const currentFeatures =
            formData.bangladeshDetails.securityFeatures || [];
          const updatedFeatures = checked
            ? [...currentFeatures, value]
            : currentFeatures.filter((item) => item !== value);
          setFormData((prev) => ({
            ...prev,
            bangladeshDetails: {
              ...prev.bangladeshDetails,
              [detailKey]: updatedFeatures,
            },
          }));
        } else {
          // Handle other nested fields
          setFormData((prev) => ({
            ...prev,
            bangladeshDetails: {
              ...prev.bangladeshDetails,
              [detailKey]: type === "checkbox" ? checked : value,
            },
          }));
        }
        // Clear nested errors
        if (errors.bangladeshDetails?.[detailKey]) {
          setErrors((prev) => ({
            ...prev,
            bangladeshDetails: { ...prev.bangladeshDetails, [detailKey]: null },
          }));
        }
      } else {
        // Handle top-level fields
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
        // Clear top-level errors
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: null }));
        }
      }
    },
    [errors, formData.bangladeshDetails]
  ); // Include dependencies

  // Handler for Standard Features (Step 2)
  const handleFeatureChange = useCallback((event) => {
    const { name, checked, value, type } = event.target;
    const featureValue = name === "furnished" ? value : checked; // Use value for select, checked for checkbox
    setFeatures((prev) => ({ ...prev, [name]: featureValue }));
    // Clear potential errors for features if needed (though Step 2 currently has no validation)
  }, []);

  // --- Validation ---
  const validateStep = useCallback(
    (stepIndex) => {
      const currentErrors = {};
      const data = formData; // Use formData directly, features state is separate
      const bdDetails = data.bangladeshDetails || {};

      const isRequiredNumber = (value) =>
        value === null ||
        value === undefined ||
        value === "" ||
        Number(value) <= 0;
      const isRequiredPositiveNumber = (value) =>
        value === null ||
        value === undefined ||
        value === "" ||
        Number(value) < 0;
      const requiresBedBath =
        data.propertyType !== "land" && data.propertyType !== "commercial";

      switch (stepIndex) {
        case 0: // Basic Info
          if (!data.title.trim()) currentErrors.title = "Title is required";
          if (!data.propertyType)
            currentErrors.propertyType = "Property type is required";
          if (!data.listingType)
            currentErrors.listingType = "Listing type is required";
          if (isRequiredNumber(data.price))
            currentErrors.price = "Valid price is required";
          // Area is optional, no validation needed here
          if (requiresBedBath && isRequiredPositiveNumber(data.bedrooms))
            currentErrors.bedrooms = "Valid bedroom count is required";
          if (requiresBedBath && isRequiredPositiveNumber(data.bathrooms))
            currentErrors.bathrooms = "Valid bathroom count is required";
          break;
        case 1: // Location
          if (!data.addressLine1.trim())
            currentErrors.addressLine1 = "Address Line 1 is required";
          if (!data.cityTown.trim())
            currentErrors.cityTown = "City/Town is required";
          if (!data.upazila.trim())
            currentErrors.upazila = "Upazila/Thana is required";
          if (!data.district.trim())
            currentErrors.district = "District is required";
          if (!data.postalCode.trim())
            currentErrors.postalCode = "Postal Code is required";
          // Add regex for postal code if needed: !/^\d{4}$/.test(data.postalCode.trim())
          break;
        case 2: // Features - No validation defined for this step currently
          break;
        case 3: // Specific Details (BD Context)
          currentErrors.bangladeshDetails = {};
          if (!bdDetails.propertyCondition)
            currentErrors.bangladeshDetails.propertyCondition =
              "Property condition is required";
          if (!bdDetails.waterSource)
            currentErrors.bangladeshDetails.waterSource =
              "Water source is required";
          if (!bdDetails.gasSource)
            currentErrors.bangladeshDetails.gasSource =
              "Gas source is required";
          // Add more required field checks here if needed...
          if (Object.keys(currentErrors.bangladeshDetails).length === 0) {
            delete currentErrors.bangladeshDetails;
          }
          break;
        case 4: // Upload Photos - Validation only for UI feedback
          // if (images.length === 0) currentErrors.images = "At least one image is recommended";
          break;
        case 5: // Description - Optional, no validation unless specified
          break;
        case 6: // Review - No validation needed
          break;
        default:
          break;
      }
      setErrors(currentErrors);
      console.log(
        `Validation Step ${stepIndex + 1}:`,
        currentErrors,
        Object.keys(currentErrors).length === 0
      ); // Debug Validation
      return Object.keys(currentErrors).length === 0;
    },
    [formData]
  ); // Depend only on formData

  // --- AI Description Generation ---
  const generateDescription = useCallback(async () => {
    setLoadingAI(true);
    setErrors((prev) => ({ ...prev, description: null }));
    try {
      const propertyDataForAI = {
        // Structure data clearly for backend
        basicInfo: {
          title: formData.title,
          propertyType: formData.propertyType,
          listingType: formData.listingType,
          price: formData.price,
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
        },
        location: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          cityTown: formData.cityTown,
          upazila: formData.upazila,
          district: formData.district,
          postalCode: formData.postalCode,
        },
        features: features, // Send the separate standard features state
        bangladeshDetails: formData.bangladeshDetails,
      };

      if (!formData.title || !formData.propertyType || !formData.district) {
        throw new Error(
          "Please fill basic info, property type, and location before generating."
        );
      }

      // Backend needs to parse this structure
      const response = await axios.post(
        `${API_BASE_URL}/generate-description`,
        { propertyData: propertyDataForAI }
      );

      setFormData((prev) => ({
        ...prev,
        description: response.data.description,
      }));
    } catch (error) {
      /* ... existing error handling ... */
    } finally {
      setLoadingAI(false);
    }
  }, [formData, features]); // Depend on formData and features

  // --- Stepper Navigation ---
  const handleNext = useCallback(() => {
    if (!validateStep(activeStep)) {
      setSnackbar({
        open: true,
        message: "Please fill required fields.",
        severity: "warning",
      });
      return;
    }
    let nextStepIndex = activeStep + 1;
    const isSkippingFeatures =
      activeStep === 1 &&
      (formData.propertyType === "land" ||
        formData.propertyType === "commercial");
    if (isSkippingFeatures) {
      nextStepIndex = 3;
    } // Skip Step 2 (index 2) -> Go to Step 3 (index 3)
    if (nextStepIndex < steps.length) {
      setActiveStep(nextStepIndex);
    }
  }, [activeStep, formData.propertyType, validateStep]);

  const handleBack = useCallback(() => {
    let prevStepIndex = activeStep - 1;
    const isComingFromSpecifics =
      activeStep === 3 &&
      (formData.propertyType === "land" ||
        formData.propertyType === "commercial");
    if (isComingFromSpecifics) {
      prevStepIndex = 1;
    } // Skip Step 2 (index 2) -> Go back to Step 1 (index 1)
    if (prevStepIndex >= 0) {
      setActiveStep(prevStepIndex);
    }
  }, [activeStep, formData.propertyType]);

  // --- Form Submission ---
  const handleSubmit = useCallback(async () => {
    // Final validation run (optional, can rely on step-by-step validation)
    let formIsValid = true;
    for (let i = 0; i < steps.length - 1; i++) {
      const isSkippedStep =
        i === 2 &&
        (formData.propertyType === "land" ||
          formData.propertyType === "commercial");
      if (!isSkippedStep && !validateStep(i)) {
        formIsValid = false;
        setActiveStep(i);
        setSnackbar({
          open: true,
          message: `Please fix errors in Step ${i + 1}: ${steps[i]}.`,
          severity: "warning",
        });
        break;
      }
    }
    if (!formIsValid) return;

    if (!user?.email) {
      /* ... existing user check ... */ navigate("/login");
      return;
    }

    setLoadingSubmit(true);
    setSnackbar({ open: false });

    // --- TEMPORARY IMAGE HANDLING ---
    const predefinedImages = ["house1.png", "house2.png", "house3.png"];
    const randomImageName =
      predefinedImages[Math.floor(Math.random() * predefinedImages.length)];
    // --- END TEMPORARY IMAGE HANDLING ---

    const finalData = {
      ...formData, // Includes basic, location, description, bangladeshDetails, createdBy
      features:
        formData.propertyType !== "land" &&
        formData.propertyType !== "commercial"
          ? features
          : {}, // Include standard features conditionally
      images: [randomImageName], // Use temporary predefined image name
    };
    // No need to delete finalData.features if formData doesn't contain it initially

    console.log("Submitting Final Data:", JSON.stringify(finalData, null, 2)); // Pretty print for debugging

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
      setTimeout(() => {
        navigate("/user-profile");
      }, 1500);
    } catch (error) {
      console.error(
        "Error submitting property:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message: `Submission failed: ${
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message
        }`,
        severity: "error",
      });
    } finally {
      setLoadingSubmit(false);
    }
  }, [
    activeStep,
    formData,
    features,
    /* images - removed dependency as it's not used */ user,
    navigate,
    validateStep,
  ]); // Adjusted dependencies

  // --- Image Handling (for UI Previews) ---
  const handleImageUpload = useCallback(
    (uploadedFiles) => {
      // uploadedFiles is expected to be an array of File objects
      setImages((prevImages) => {
        const combined = [...prevImages, ...uploadedFiles];
        // Enforce limit (e.g., 10)
        return combined.slice(0, 10);
      });
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: null }));
      }
    },
    [errors.images]
  ); // Removed images from dependency array as we use functional update

  const removeImageByIndex = useCallback((indexToRemove) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  }, []);

  // --- Snackbar close handler ---
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // --- Return values ---
  return {
    activeStep,
    steps,
    formData,
    features, // Return standard features state
    images, // Return images state for UI previews
    errors,
    loadingAI,
    loadingSubmit,
    snackbar,
    handleChange,
    handleFeatureChange, // Return standard features handler
    handleImageUpload, // Handler to add images to state
    removeImageByIndex, // Handler to remove images from state
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
    validateStep,
  };
};

export default useListingForm;
