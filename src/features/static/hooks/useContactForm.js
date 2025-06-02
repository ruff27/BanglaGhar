import { useState, useCallback } from "react";


/**
 * @hook useContactForm
 * Manages the state and logic for the contact form.
 * @returns {object} - Form data, handlers, submission state, error, and success status.
 */
const useContactForm = () => {
  // State for form input fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", 
    subject: "",
    message: "",
  });

  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  /**
   * Handles changes in form input fields.
   * Updates formData state and clears related validation errors.
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name]; 
          return newErrors;
        });
      }
      if (snackbar.open) {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }
    },
    [formErrors, snackbar.open]
  );

  /**
   * Validates the current form data.
   * @returns {object} - An object containing validation errors, if any.
   */
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      errors.email = "Invalid email address";
    }
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }
    return errors;
  }, [formData]); 

  /**
   * Handles the form submission process.
   * Validates the form, simulates/performs an API call, and updates feedback state.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateForm();
      setFormErrors(errors); 
      if (Object.keys(errors).length > 0) {
        
        setSnackbar({
          open: true,
          severity: "error",
          message: "Please fix the errors in the form.",
        });
        return; 
      }

      setIsSubmitting(true);
      setSnackbar((prev) => ({ ...prev, open: false })); 

      console.log("Submitting form data:", formData);

      // --- Simulate API Call ---
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Mock submission successful.");

        // Show success message
        setSnackbar({
          open: true,
          severity: "success",
          message: "Thank you for contacting us! We will get back to you soon.",
        });

        // Reset form fields
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setFormErrors({}); // Clear errors on success
      } catch (error) {
        console.error("Submission error:", error);
        // Show error message
        setSnackbar({
          open: true,
          severity: "error",
          message: "Failed to send message. Please try again later.",
        });
      } finally {
        setIsSubmitting(false); 
      }
    },
    [formData, validateForm]
  ); 

  /**
   * Closes the snackbar.
   */
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    formData,
    formErrors, 
    isSubmitting,
    snackbar, 
    handleChange,
    handleSubmit,
    handleCloseSnackbar, 
  };
};

export default useContactForm;
