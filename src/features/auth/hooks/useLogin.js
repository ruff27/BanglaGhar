import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; 

/**
 * @hook useLogin
 * Handles the state and logic for the user login process.
 * @returns {object} - Login state, handlers, and form data.
 */
const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for feedback and loading
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);


  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);
      if (error) setError("");
    },
    [error]
  );

  /**
   * Handles changes in the password input field.
   */
  const handlePasswordChange = useCallback(
    (event) => {
      setPassword(event.target.value);
      if (error) setError(""); 
    },
    [error]
  );

  /**
   * Handles the login form submission.
   * Performs basic validation and calls the login function from AuthContext.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleLoginSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(""); 

      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setIsSubmitting(true); // Set loading state

      try {
        console.log(`Attempting login for: ${email}`); 
        await login(email, password); 
        console.log(`Login successful for: ${email}`); 
        setOpenSnackbar(true); 
        setTimeout(() => {
          navigate("/"); 
        }, 1500);
      } catch (err) {
        console.error("Login error:", err); 
        const message =
          err.message ||
          "Login failed. Please check your credentials and try again.";
        if (message.includes("UserNotFoundException")) {
          setError("No account found with this email.");
        } else if (message.includes("NotAuthorizedException")) {
          setError("Incorrect email or password.");
        } else if (message.includes("UserNotConfirmedException")) {
          setError(
            "Account not verified. Please check your email for verification instructions or sign up again."
          );
        } else {
          setError(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, login, navigate]
  ); 

  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  }, []);

  return {
    email,
    password,
    error,
    isSubmitting,
    openSnackbar,
    handleEmailChange,
    handlePasswordChange,
    handleLoginSubmit,
    handleCloseSnackbar,
  };
};

export default useLogin;
