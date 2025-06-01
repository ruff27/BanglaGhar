// src/features/listing/hooks/useEditPropertyForm.js (New File)
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; 

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const useEditPropertyForm = (propertyId) => {
  const [propertyData, setPropertyData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); 
  const { idToken } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId || !idToken) {
        setError("Missing property ID or authentication token.");
        setInitialLoading(false);
        return;
      }
      setInitialLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/properties/${propertyId}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        setPropertyData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching property for edit:", err.response || err);
        setError(
          err.response?.data?.error ||
            "Failed to load property data for editing."
        );
        setPropertyData(null);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, idToken]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setPropertyData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [validationErrors]
  );

  const handleFeaturesChange = useCallback((e) => {
    const { name, checked } = e.target;
    setPropertyData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: checked,
      },
    }));
  }, []);

  const handleBangladeshDetailsChange = useCallback((e) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({
      ...prev,
      bangladeshDetails: {
        ...prev.bangladeshDetails,
        [name]: value,
      },
    }));
  }, []);

  const handleSubmit = async () => {
    if (!idToken) {
      setError("Authentication required to update property.");
      return false;
    }
    if (!propertyData) {
      setError("No property data to submit.");
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});


    const payload = { ...propertyData };
    delete payload.createdBy;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload._id; 
    delete payload.__v;

    try {
      await axios.put(`${API_BASE_URL}/properties/${propertyId}`, payload, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setIsSubmitting(false);
      return true; 
    } catch (err) {
      console.error("Error updating property:", err.response || err);
      const errData = err.response?.data;
      if (errData?.details && typeof errData.details === "object") {
        setValidationErrors(errData.details);
        setError(
          errData.error || "Validation failed. Please check the fields."
        );
      } else {
        setError(errData?.error || "Failed to update property.");
      }
      setIsSubmitting(false);
      return false; 
    }
  };

  return {
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
  };
};

export default useEditPropertyForm;
