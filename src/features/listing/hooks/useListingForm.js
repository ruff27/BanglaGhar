// src/features/listing/hooks/useListingForm.js
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const steps = [
  "Basic Info",
  "Location",
  "Features",
  "Specific Details",
  "Upload Photos",
  "Description",
  "Review",
];

const initialFormData = {
  title: "",
  propertyType: "apartment",
  listingType: "rent",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  addressLine1: "",
  addressLine2: "",
  cityTown: "",
  upazila: "",
  district: "",
  postalCode: "",
  description: "",
  bangladeshDetails: {
    propertyCondition: "",
    proximityToMainRoad: "",
    publicTransport: "",
    floodProne: "no",
    waterSource: "",
    gasSource: "",
    gasLineInstalled: "no",
    backupPower: "none",
    sewerSystem: "none",
    parkingType: "none",
    nearbySchools: "",
    nearbyHospitals: "",
    nearbyMarkets: "",
    nearbyReligiousPlaces: "",
    nearbyOthers: "",
    securityFeatures: [],
    earthquakeResistance: "unknown",
    roadWidth: "",
    floorNumber: "",
    totalFloors: "",
    balcony: "no",
    rooftopAccess: "no",
    naturalLight: "",
    ownershipPapers: "unknown",
    propertyTenure: "unknown", // Ensure this is the intended default and matches enum if applicable
    recentRenovations: "",
    nearbyDevelopments: "",
    reasonForSelling: "",
    // propertyTenure was duplicated in your original file, ensure this is the correct one.
  },
  createdBy: "",
};

const initialFeatures = {
  parking: false,
  garden: false,
  airConditioning: false,
  furnished: "no",
  pool: false,
};

const useListingForm = () => {
  const { user, idToken } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [features, setFeatures] = useState(initialFeatures);

  const [imageUrls, setImageUrls] = useState([]); // Stores S3 URLs
  const [imageUploadStates, setImageUploadStates] = useState({}); // Tracks { [tempId]: { loading, error, url, fileName } }

  const [errors, setErrors] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    if (user?.email && !formData.createdBy) {
      setFormData((prev) => ({ ...prev, createdBy: user.email }));
    }
  }, [user, formData.createdBy]);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      if (name.startsWith("bangladeshDetails.")) {
        const key = name.split(".")[1];
        if (key === "securityFeatures") {
          const list = formData.bangladeshDetails.securityFeatures || [];
          const updated = checked
            ? [...list, value]
            : list.filter((i) => i !== value);
          setFormData((prev) => ({
            ...prev,
            bangladeshDetails: { ...prev.bangladeshDetails, [key]: updated },
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            bangladeshDetails: {
              ...prev.bangladeshDetails,
              [key]: type === "checkbox" ? checked : value,
            },
          }));
        }
        if (errors.bangladeshDetails?.[key]) {
          setErrors((prev) => ({
            ...prev,
            bangladeshDetails: { ...prev.bangladeshDetails, [key]: null },
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors, formData.bangladeshDetails]
  );

  const handleFeatureChange = useCallback((e) => {
    const { name, checked, value } = e.target;
    setFeatures((prev) => ({
      ...prev,
      [name]: name === "furnished" ? value : checked,
    }));
  }, []);

  const validateStep = useCallback(
    (stepIndex) => {
      const newErrors = {};
      const currentFormData = formData;
      const bdDetails = currentFormData.bangladeshDetails || {};
      const isNumericRequired = (val) =>
        val == null || val === "" || Number(val) <= 0;
      const isPositiveNumericRequired = (val) =>
        val == null || val === "" || Number(val) < 0;
      const needsBuildingSpecifics =
        currentFormData.propertyType !== "land" &&
        currentFormData.propertyType !== "commercial";

      switch (stepIndex) {
        case 0: // Basic Info
          if (!currentFormData.title.trim())
            newErrors.title = "Title is required.";
          if (!currentFormData.propertyType)
            newErrors.propertyType = "Property type is required.";
          if (!currentFormData.listingType)
            newErrors.listingType = "Listing type is required.";
          if (isNumericRequired(currentFormData.price))
            newErrors.price = "Price must be a positive number.";
          if (
            needsBuildingSpecifics &&
            isPositiveNumericRequired(currentFormData.bedrooms)
          )
            newErrors.bedrooms = "Bedrooms must be zero or more.";
          if (
            needsBuildingSpecifics &&
            isPositiveNumericRequired(currentFormData.bathrooms)
          )
            newErrors.bathrooms = "Bathrooms must be zero or more.";
          break;
        case 1: // Location
          if (!currentFormData.addressLine1.trim())
            newErrors.addressLine1 = "Address Line 1 is required.";
          if (!currentFormData.cityTown.trim())
            newErrors.cityTown = "City/Town is required.";
          if (!currentFormData.upazila.trim())
            newErrors.upazila = "Upazila is required.";
          if (!currentFormData.district.trim())
            newErrors.district = "District is required.";
          if (!currentFormData.postalCode.trim())
            newErrors.postalCode = "Postal Code is required.";
          break;
        case 3: // Specific Details (Bangladesh Context)
          newErrors.bangladeshDetails = {};

          if (needsBuildingSpecifics) {
            // Only require these if it's not land/commercial
            if (!bdDetails.propertyCondition)
              newErrors.bangladeshDetails.propertyCondition =
                "Property condition is required for buildings.";
            if (!bdDetails.waterSource)
              newErrors.bangladeshDetails.waterSource =
                "Water source is required for buildings.";
            if (!bdDetails.gasSource)
              newErrors.bangladeshDetails.gasSource =
                "Gas source is required for buildings.";
          } else {
          }

          if (Object.keys(newErrors.bangladeshDetails).length === 0) {
            delete newErrors.bangladeshDetails;
          }
          break;
        // Add other case validations as needed for other steps, e.g., images
        case 4: // Upload Photos
          if (imageUrls.length === 0) {
            // Example: require at least one image
            newErrors.images = "At least one image is recommended.";
          }
          break;
        default:
          break;
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData, imageUrls] // Added imageUrls dependency for step 4 validation example
  );

  const generateDescription = useCallback(
    async (language = "en", userPmt = "") => {
      // userPmt is the user's custom prompt
      setLoadingAI(true);
      setErrors((prev) => ({ ...prev, description: null }));
      try {
        const propertyDataForAI = {
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
          features,
          bangladeshDetails: formData.bangladeshDetails,
          userPrompt: userPmt, // Include the user's custom prompt here
        };

        const payload = {
          propertyData: propertyDataForAI,
          language,
        };

        // Debug: Log the payload to ensure it's what you expect
        console.log(
          "[useListingForm] Payload for AI:",
          JSON.stringify(payload, null, 2)
        );

        const res = await axios.post(
          `${API_BASE_URL}/generate-description`,
          payload
        );
        return res.data.description; // Return the description
      } catch (error) {
        console.error(
          "Error generating description:",
          error.response ? error.response.data : error.message
        );
        setSnackbar({
          open: true,
          message: `Failed to generate description. ${
            error.response?.data?.details || ""
          }`,
          severity: "error",
        });
        return null; // Return null on error
      } finally {
        setLoadingAI(false);
      }
    },
    [formData, features, API_BASE_URL] // Added API_BASE_URL to dependencies
  );

  const handleNext = useCallback(() => {
    if (!validateStep(activeStep)) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields correctly before proceeding.",
        severity: "warning",
      });
      return;
    }
    let nextStepIndex = activeStep + 1;
    // Skip 'Features' step for 'land' or 'commercial' property types
    if (
      activeStep === 1 && // If current step is 'Location' (index 1)
      (formData.propertyType === "land" ||
        formData.propertyType === "commercial")
    ) {
      nextStepIndex = 3; // Skip to 'Specific Details' (index 3)
    }
    if (nextStepIndex < steps.length) {
      setActiveStep(nextStepIndex);
    }
  }, [activeStep, formData.propertyType, validateStep, steps.length]);

  const handleBack = useCallback(() => {
    let prevStepIndex = activeStep - 1;
    // If current step is 'Specific Details' (index 3) and property is 'land' or 'commercial', skip back to 'Location' (index 1)
    if (
      activeStep === 3 &&
      (formData.propertyType === "land" ||
        formData.propertyType === "commercial")
    ) {
      prevStepIndex = 1;
    }
    if (prevStepIndex >= 0) {
      setActiveStep(prevStepIndex);
    }
  }, [activeStep, formData.propertyType]);

  const handleImageFileSelected = useCallback(
    async (file) => {
      console.log(
        "[useListingForm] handleImageFileSelected called with file:",
        file.name
      );
      if (!idToken) {
        console.error("[useListingForm] No idToken found for image upload.");
        setSnackbar({
          open: true,
          message: "Authentication session error. Please log in again.",
          severity: "error",
        });
        return;
      }
      if (imageUrls.length >= 10) {
        setSnackbar({
          open: true,
          message: "You can upload a maximum of 10 images.",
          severity: "warning",
        });
        return;
      }

      const tempId = `${file.name}-${Date.now()}`;
      setImageUploadStates((prev) => ({
        ...prev,
        [tempId]: {
          loading: true,
          error: null,
          url: null,
          fileName: file.name,
        },
      }));

      const imageFormData = new FormData();
      imageFormData.append("propertyImage", file);

      try {
        console.log(
          "[useListingForm] Attempting to upload image to backend route: /properties/upload-image"
        );
        const response = await axios.post(
          `${API_BASE_URL}/properties/upload-image`,
          imageFormData,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(
          "[useListingForm] Backend response for image upload:",
          response.data
        );
        if (response.data && response.data.imageUrl) {
          setImageUrls((prevUrls) => [...prevUrls, response.data.imageUrl]);
          setImageUploadStates((prev) => ({
            ...prev,
            [tempId]: {
              ...prev[tempId],
              loading: false,
              url: response.data.imageUrl,
            },
          }));
          if (errors.images) setErrors((prev) => ({ ...prev, images: null }));
        } else {
          throw new Error("Image URL not found in backend response.");
        }
      } catch (uploadError) {
        const errorMsg = uploadError.response
          ? JSON.stringify(uploadError.response.data)
          : uploadError.message;
        console.error(
          "[useListingForm] Error during image upload to backend:",
          errorMsg
        );
        setImageUploadStates((prev) => ({
          ...prev,
          [tempId]: {
            ...prev[tempId],
            loading: false,
            error:
              "Upload failed: " +
              (uploadError.response?.data?.message || "Network error"),
          },
        }));
        setSnackbar({
          open: true,
          message:
            "Image upload failed: " +
            (uploadError.response?.data?.message || "Check console"),
          severity: "error",
        });
      }
    },
    [idToken, imageUrls, errors.images]
  ); // Added imageUrls to dependencies

  const removeImageByUrl = useCallback((urlToRemove) => {
    console.log("[useListingForm] Removing image by URL:", urlToRemove);
    setImageUrls((prevUrls) => prevUrls.filter((url) => url !== urlToRemove));
    setImageUploadStates((prevStates) => {
      const newStates = { ...prevStates };
      Object.keys(newStates).forEach((key) => {
        if (newStates[key].url === urlToRemove) {
          delete newStates[key];
        }
      });
      return newStates;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    console.log("[useListingForm] handleSubmit called.");
    let allStepsValid = true;
    // Validate all steps except the last one (Review step)
    for (let i = 0; i < steps.length - 1; i++) {
      const currentFormData = formData; // Use the formData from the hook's state
      const isLandOrCommercial =
        currentFormData.propertyType === "land" ||
        currentFormData.propertyType === "commercial";
      const skipStep = i === 2 && isLandOrCommercial; // Skip "Features" (index 2) for land/commercial

      if (!skipStep && !validateStep(i)) {
        allStepsValid = false;
        setActiveStep(i); // Navigate to the step with validation errors
        setSnackbar({
          open: true,
          message: `Please review Step ${i + 1}: ${steps[i]} for errors.`,
          severity: "error",
        });
        break; // Stop validation on first error
      }
    }

    if (!allStepsValid) {
      console.log("[useListingForm] Form validation failed before submission.");
      return;
    }

    if (!idToken) {
      console.error("[useListingForm] handleSubmit: No idToken!");
      setSnackbar({
        open: true,
        message: "Authentication error. Please log in again.",
        severity: "error",
      });
      return;
    }
    const creatorEmail = user?.email;
    if (!creatorEmail) {
      console.error("[useListingForm] handleSubmit: User email not found!");
      setSnackbar({
        open: true,
        message: "User information is missing. Please log in again.",
        severity: "error",
      });
      return;
    }

    setLoadingSubmit(true);
    setSnackbar({ open: false }); // Close any existing snackbar

    // Ensure specific undefined/empty optional fields in bangladeshDetails have defaults if necessary
    const finalBangladeshDetails = { ...formData.bangladeshDetails };
    if (finalBangladeshDetails.backupPower === "")
      finalBangladeshDetails.backupPower = "none"; //
    if (finalBangladeshDetails.sewerSystem === "")
      finalBangladeshDetails.sewerSystem = "none"; //
    if (finalBangladeshDetails.parkingType === "")
      finalBangladeshDetails.parkingType = "none"; //
    if (finalBangladeshDetails.propertyTenure === "")
      finalBangladeshDetails.propertyTenure = "unknown"; //

    // Prepare the final data payload
    const finalData = {
      ...formData, // Spread existing formData
      bangladeshDetails: finalBangladeshDetails,
      features:
        formData.propertyType !== "land" &&
        formData.propertyType !== "commercial"
          ? features // Include features state
          : {}, // Send empty object for land/commercial
      images: imageUrls, // Include the array of S3 image URLs
      createdBy: creatorEmail, // Set createdBy from authenticated user
    };

    // Convert numeric fields from string to number, handle optional fields
    if (
      finalData.price !== undefined &&
      String(finalData.price).trim() !== ""
    ) {
      finalData.price = Number(finalData.price);
    } else {
      // Assuming price is required, prior validation should catch empty.
      // If it could be optional & empty, you might delete it: delete finalData.price;
    }

    if (finalData.area !== undefined && String(finalData.area).trim() !== "") {
      finalData.area = Number(finalData.area);
    } else if (String(finalData.area).trim() === "") {
      // If area is optional and submitted as an empty string, remove it from payload
      // so backend doesn't try to validate/convert an empty string to a number.
      delete finalData.area;
    }

    // Handle bedrooms and bathrooms based on property type
    if (
      formData.propertyType === "land" ||
      formData.propertyType === "commercial"
    ) {
      delete finalData.bedrooms; // Remove if land/commercial
      delete finalData.bathrooms; // Remove if land/commercial
    } else {
      // For other types, ensure bedrooms/bathrooms are numbers.
      // Default to 0 if empty or not a valid number, aligning with schema defaults.
      finalData.bedrooms =
        String(formData.bedrooms).trim() === "" ||
        isNaN(Number(formData.bedrooms))
          ? 0
          : Number(formData.bedrooms);
      finalData.bathrooms =
        String(formData.bathrooms).trim() === "" ||
        isNaN(Number(formData.bathrooms))
          ? 0
          : Number(formData.bathrooms);
    }

    console.log(
      "[useListingForm] Final data being submitted to /properties:",
      finalData
    );

    try {
      await axios.post(`${API_BASE_URL}/properties`, finalData, {
        //
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setSnackbar({
        open: true,
        message: "Property listed successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/user-profile"), 1500); // Or '/my-listings' or property detail page
    } catch (err) {
      const errorResponse = err.response;
      console.error(
        "Property submission error:",
        errorResponse ? errorResponse.data : err.message
      );

      let detailedErrorMessages = "";
      // Assuming backend sends validation errors in an 'errors' array like express-validator
      if (
        errorResponse?.data?.errors &&
        Array.isArray(errorResponse.data.errors)
      ) {
        detailedErrorMessages = errorResponse.data.errors
          .map((e) => `${e.path || "General"}: ${e.msg}`)
          .join("; ");
      }

      const errorMessage =
        errorResponse?.status === 401 || errorResponse?.status === 403
          ? `Authorization error (${errorResponse.status}). Please try logging in again.`
          : detailedErrorMessages || // Show detailed validation errors first
            errorResponse?.data?.message || // Then specific backend message
            errorResponse?.data?.error || // Then general backend error
            "Property submission failed. Please check your input and try again."; // Fallback
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoadingSubmit(false);
    }
  }, [
    formData,
    features,
    user,
    idToken,
    navigate,
    validateStep,
    imageUrls,
    steps, // Added 'steps' as it's used in the loop
    activeStep, // Added 'activeStep' for setActiveStep
    setActiveStep, // Added 'setActiveStep'
    setSnackbar, // Added 'setSnackbar'
    setLoadingSubmit, // Added 'setLoadingSubmit'
    // API_BASE_URL is a const, not needed in deps array unless it can change
  ]);

  const handleCloseSnackbar = useCallback((_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    activeStep,
    steps,
    formData,
    features,
    imageUrls, // For Step4_Images to display S3 images
    imageUploadStates, // For Step4_Images to show upload progress/status
    errors,
    loadingAI,
    loadingSubmit,
    snackbar,
    handleChange,
    handleFeatureChange,
    handleImageFileSelected, // Pass this to Step4_Images
    removeImageByUrl, // Pass this to Step4_Images
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
    validateStep,
  };
};

export default useListingForm;
