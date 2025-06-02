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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);
      if (error) setError("");
    },
    [error]
  );

  const handlePasswordChange = useCallback(
    (event) => {
      setPassword(event.target.value);
      if (error) setError("");
    },
    [error]
  );

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

      setIsSubmitting(true); //
      let navigatedToChangePassword = false; // Flag to track navigation

      try {
        await login(email, password);
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (err) {
        console.error("Login error:", err);

        if (err.message === "New password required.") {
          //
          localStorage.setItem("pendingChangePasswordEmail", email);
          localStorage.setItem("pendingChangePasswordTempPassword", password);
          navigatedToChangePassword = true;
          navigate("/change-password");
          return;
        }

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
        // Only set isSubmitting to false if we haven't navigated to change password
        if (!navigatedToChangePassword) {
          setIsSubmitting(false);
        }
      }
    },
    [email, password, login, navigate]
  );

  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === "clickaway") {
      //
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
