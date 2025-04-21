import { useState, useCallback } from "react";
// Import axios if you intend to make a real API call
// import axios from 'axios';

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
    phone: "", // Added phone based on original component
    subject: "",
    message: "",
  });

  // State for validation errors
  const [formErrors, setFormErrors] = useState({});
  // State to track submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for general submission success/error feedback
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

      // Clear validation error for the field being edited
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name]; // Remove the specific error
          return newErrors;
        });
      }
      // Close snackbar if it's open when user starts typing again
      if (snackbar.open) {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }
    },
    [formErrors, snackbar.open]
  ); // Include dependencies

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
    // Optional phone validation can be added here if needed
    // if (formData.phone.trim() && !/^\+?[0-9\s-()]{7,}$/.test(formData.phone)) {
    //   errors.phone = 'Invalid phone number format';
    // }
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }
    return errors;
  }, [formData]); // Depends on formData

  /**
   * Handles the form submission process.
   * Validates the form, simulates/performs an API call, and updates feedback state.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateForm();
      setFormErrors(errors); // Set errors regardless

      if (Object.keys(errors).length > 0) {
        // If there are errors, set an error snackbar message immediately
        setSnackbar({
          open: true,
          severity: "error",
          message: "Please fix the errors in the form.",
        });
        return; // Stop submission if validation fails
      }

      setIsSubmitting(true);
      setSnackbar((prev) => ({ ...prev, open: false })); // Close any previous snackbar

      console.log("Submitting form data:", formData);

      // --- Simulate API Call ---
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
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
        setIsSubmitting(false); // Ensure submission state is reset
      }
    },
    [formData, validateForm]
  ); // Depends on formData and validateForm

  /**
   * Closes the snackbar.
   */
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Return state and handlers needed by the component
  return {
    formData,
    formErrors, // Provide errors for field-level feedback
    isSubmitting,
    snackbar, // Provide snackbar state for page-level feedback
    handleChange,
    handleSubmit,
    handleCloseSnackbar, // Provide handler to close snackbar from page
  };
};

export default useContactForm;
