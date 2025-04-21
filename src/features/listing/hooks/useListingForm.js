// src/features/listing/hooks/useListingForm.js
// Final fully updated hook with token header and context integration
// citeturn1file0

import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed

// Ensure your API base URL is correctly set, ideally via environment variables
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Define steps - Updated 7-Step Workflow
const steps = [
  "Basic Info",
  "Location",
  "Features",
  "Specific Details",
  "Upload Photos",
  "Description",
  "Review",
];

// --- Initial Form State ---
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
    backupPower: "",
    sewerSystem: "",
    nearbySchools: "",
    nearbyHospitals: "",
    nearbyMarkets: "",
    nearbyReligiousPlaces: "",
    nearbyOthers: "",
    securityFeatures: [],
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
  createdBy: "",
};

const initialFeatures = {
  parking: false,
  garden: false,
  airConditioning: false,
  furnished: "no",
  pool: false,
};

const initialImages = [];

const useListingForm = () => {
  const { user, idToken } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [features, setFeatures] = useState(initialFeatures);
  const [images, setImages] = useState(initialImages);
  const [errors, setErrors] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Update createdBy when context loads
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
    (i) => {
      const errs = {};
      const data = formData;
      const bd = data.bangladeshDetails || {};
      const reqNum = (v) => v == null || v === "" || Number(v) <= 0;
      const reqPos = (v) => v == null || v === "" || Number(v) < 0;
      const needBB =
        data.propertyType !== "land" && data.propertyType !== "commercial";

      switch (i) {
        case 0:
          if (!data.title.trim()) errs.title = "Required";
          if (!data.propertyType) errs.propertyType = "Required";
          if (!data.listingType) errs.listingType = "Required";
          if (reqNum(data.price)) errs.price = "Invalid";
          if (needBB && reqPos(data.bedrooms)) errs.bedrooms = "Invalid";
          if (needBB && reqPos(data.bathrooms)) errs.bathrooms = "Invalid";
          break;
        case 1:
          if (!data.addressLine1.trim()) errs.addressLine1 = "Required";
          if (!data.cityTown.trim()) errs.cityTown = "Required";
          if (!data.upazila.trim()) errs.upazila = "Required";
          if (!data.district.trim()) errs.district = "Required";
          if (!data.postalCode.trim()) errs.postalCode = "Required";
          break;
        case 3:
          errs.bangladeshDetails = {};
          if (!bd.propertyCondition)
            errs.bangladeshDetails.propertyCondition = "Required";
          if (!bd.waterSource) errs.bangladeshDetails.waterSource = "Required";
          if (!bd.gasSource) errs.bangladeshDetails.gasSource = "Required";
          if (Object.keys(errs.bangladeshDetails).length === 0)
            delete errs.bangladeshDetails;
          break;
        default:
          break;
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [formData]
  );

  const generateDescription = useCallback(async () => {
    setLoadingAI(true);
    setErrors((prev) => ({ ...prev, description: null }));
    try {
      const payload = {
        propertyData: {
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
        },
      };
      const res = await axios.post(
        `${API_BASE_URL}/generate-description`,
        payload
      );
      setFormData((prev) => ({ ...prev, description: res.data.description }));
    } catch (_) {
    } finally {
      setLoadingAI(false);
    }
  }, [formData, features]);

  const handleNext = useCallback(() => {
    if (!validateStep(activeStep)) {
      setSnackbar({
        open: true,
        message: "Please fill required fields.",
        severity: "warning",
      });
      return;
    }
    let nxt = activeStep + 1;
    if (
      activeStep === 1 &&
      (formData.propertyType === "land" ||
        formData.propertyType === "commercial")
    )
      nxt = 3;
    if (nxt < steps.length) setActiveStep(nxt);
  }, [activeStep, formData.propertyType, validateStep]);

  const handleBack = useCallback(() => {
    let prev = activeStep - 1;
    if (
      activeStep === 3 &&
      (formData.propertyType === "land" ||
        formData.propertyType === "commercial")
    )
      prev = 1;
    if (prev >= 0) setActiveStep(prev);
  }, [activeStep, formData.propertyType]);

  const handleSubmit = useCallback(async () => {
    let valid = true;
    for (let i = 0; i < steps.length - 1; i++) {
      const skip =
        i === 2 &&
        (formData.propertyType === "land" ||
          formData.propertyType === "commercial");
      if (!skip && !validateStep(i)) {
        valid = false;
        setActiveStep(i);
        setSnackbar({
          open: true,
          message: `Please fix errors in Step ${i + 1}: ${steps[i]}.`,
          severity: "warning",
        });
        break;
      }
    }
    if (!valid) return;

    if (!idToken) {
      console.error("No token");
      setSnackbar({
        open: true,
        message: "Auth error. Please log in.",
        severity: "error",
      });
      return;
    }
    const creator = user?.email;
    if (!creator) {
      console.error("No email");
      setSnackbar({
        open: true,
        message: "User info missing.",
        severity: "error",
      });
      return;
    }

    setLoadingSubmit(true);
    setSnackbar({ open: false });

    const predefined = ["house1.png", "house2.png", "house3.png"];
    const randImg = predefined[Math.floor(Math.random() * predefined.length)];
    const finalData = {
      ...formData,
      features:
        formData.propertyType !== "land" &&
        formData.propertyType !== "commercial"
          ? features
          : {},
      images: [randImg],
      createdBy: creator,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/properties`, finalData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setSnackbar({
        open: true,
        message: "Submitted successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/user-profile"), 1500);
    } catch (err) {
      console.error(err.response?.data || err.message);
      const msg =
        err.response?.status === 401 || err.response?.status === 403
          ? `Not authorized (${err.response.status}).`
          : `Submission failed.`;
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setLoadingSubmit(false);
    }
  }, [activeStep, formData, features, user, idToken, navigate, validateStep]);

  const handleImageUpload = useCallback(
    (files) => {
      setImages((prev) => [...prev, ...files].slice(0, 10));
      if (errors.images) setErrors((prev) => ({ ...prev, images: null }));
    },
    [errors.images]
  );

  const removeImageByIndex = useCallback((idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleCloseSnackbar = useCallback((_, reason) => {
    if (reason === "clickaway") return;
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
    handleImageUpload,
    removeImageByIndex,
    generateDescription,
    handleNext,
    handleBack,
    handleSubmit,
    handleCloseSnackbar,
    validateStep,
  };
};

export default useListingForm;
