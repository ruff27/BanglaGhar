import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../aws/CognitoConfig";

const ForgotPasswordPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  boxShadow: "0 8px 24px rgba(43, 123, 140, 0.12)",
  borderRadius: "16px",
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  width: 56,
  height: 56,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: "8px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  boxShadow: "0 4px 10px rgba(43, 123, 140, 0.2)",
  "&:hover": {
    backgroundColor: "#236C7D",
    boxShadow: "0 6px 14px rgba(43, 123, 140, 0.3)",
    transform: "translateY(-2px)",
  },
}));

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [cognitoUser, setCognitoUser] = useState(null);
  const [otp, setOtp] = useState(""); // Store OTP from VerifyOtp

  // Password validation states
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasMinLength, setHasMinLength] = useState(false);

  // Handle state from VerifyOtp redirect
  const { email: initialEmail, step: initialStep, otp: initialOtp } = location.state || {};
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    if (initialStep) setStep(initialStep);
    if (initialOtp) setOtp(initialOtp);
    if (initialStep === 2 && initialEmail && !cognitoUser) {
      const user = new CognitoUser({
        Username: initialEmail,
        Pool: userPool,
      });
      setCognitoUser(user);
    }
  }, [initialEmail, initialStep, initialOtp]);

  const validatePassword = (pwd) => {
    setHasNumber(/\d/.test(pwd));
    setHasSpecial(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd));
    setHasUppercase(/[A-Z]/.test(pwd));
    setHasLowercase(/[a-z]/.test(pwd));
    setHasMinLength(pwd.length >= 8);
  };

  const handlePasswordChange = (e) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);
    validatePassword(newPasswordValue);
  };

  // Send verification code to email and redirect to VerifyOtp
  const handleSendCode = (e) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    setCognitoUser(user);

    user.forgotPassword({
      onSuccess: () => {
        navigate("/verify-otp", { state: { email, from: "forgot-password" } });
        setError("");
      },
      onFailure: (err) => {
        setError(err.message || JSON.stringify(err));
      },
    });
  };

  // Confirm new password with verified OTP from VerifyOtp
  const handleResetPassword = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!hasNumber || !hasSpecial || !hasUppercase || !hasLowercase || !hasMinLength) {
      setError("Password doesn't meet all requirements!");
      return;
    }

    if (!cognitoUser) {
      setError("User session not found. Please try again.");
      return;
    }


    cognitoUser.confirmPassword(otp,newPassword, {
      onSuccess: () => {
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      },
      onFailure: (err) => {
        setError(err.message || JSON.stringify(err));
      },
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <ForgotPasswordPaper>
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>

        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, color: "#2B7B8C" }}
        >
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 2, borderRadius: "8px" }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={step === 1 ? handleSendCode : handleResetPassword}
          sx={{ width: "100%" }}
        >
          {step === 1 && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                autoFocus
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <StyledButton type="submit" fullWidth variant="contained">
                Send Verification Code
              </StyledButton>
            </>
          )}

          {step === 2 && (
            <>
              <Box sx={{ mb: 2, width: "100%" }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#2B7B8C", fontWeight: 600 }}
                >
                  New password must contain:
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon 
                        sx={{ color: hasMinLength ? "green" : "#2B7B8C" }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Minimum 8 characters"
                      sx={{ color: hasMinLength ? "green" : "inherit" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon 
                        sx={{ color: hasNumber ? "green" : "#2B7B8C" }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary="At least 1 number"
                      sx={{ color: hasNumber ? "green" : "inherit" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon 
                        sx={{ color: hasSpecial ? "green" : "#2B7B8C" }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary="At least 1 special character"
                      sx={{ color: hasSpecial ? "green" : "inherit" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon 
                        sx={{ color: hasUppercase ? "green" : "#2B7B8C" }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary="At least 1 uppercase letter"
                      sx={{ color: hasUppercase ? "green" : "inherit" }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon 
                        sx={{ color: hasLowercase ? "green" : "#2B7B8C" }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary="At least 1 lowercase letter"
                      sx={{ color: hasLowercase ? "green" : "inherit" }}
                    />
                  </ListItem>
                </List>
              </Box>

              <TextField
                margin="normal"
                required
                fullWidth
                label="New Password"
                type="password"
                variant="outlined"
                value={newPassword}
                onChange={handlePasswordChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <StyledButton type="submit" fullWidth variant="contained">
                Reset Password
              </StyledButton>
            </>
          )}
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link to="/login" style={{ color: "#2B7B8C" }}>
            Back to Sign In
          </Link>
        </Typography>
      </ForgotPasswordPaper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ borderRadius: "8px" }}
        >
          Password reset successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;