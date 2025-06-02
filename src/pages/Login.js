import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Snackbar,
  Avatar,
  styled,
  Button,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import useLogin from "../features/auth/hooks/useLogin"; 
import LoginForm from "../features/auth/components/LoginForm"; 

const LoginPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 8px 24px rgba(43, 123, 140, 0.12)",
  borderRadius: "16px",
  padding: theme.spacing(4),
  marginTop: theme.spacing(8), 
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

const Login = () => {
  const navigate = useNavigate();

  const {
    email,
    password,
    error,
    isSubmitting,
    openSnackbar,
    handleEmailChange,
    handlePasswordChange,
    handleLoginSubmit,
    handleCloseSnackbar,
  } = useLogin();

  const handleCancel = () => {
    navigate("/home"); 
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <LoginPaper elevation={3}>
        {" "}
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>
        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, color: "primary.main" }} 
        >
          Sign In
        </Typography>
        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 2, borderRadius: "8px" }}
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}
        <LoginForm
          email={email}
          password={password}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          onSubmit={handleLoginSubmit}
          isSubmitting={isSubmitting}
        />
        {/* Links for Forgot Password and Sign Up */}
        <Box
          sx={{
            width: "100%",
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">
            <Link
              to="/forgot-password"
              style={{ color: "#2B7B8C", textDecoration: "none" }}
            >
              Forgot Password?
            </Link>
          </Typography>
          <Typography variant="body2">
          Don’t have an account? {" "}
            <Link
              to="/signup"
              style={{ color: "#2B7B8C", textDecoration: "none" }}
            >
             Sign Up
            </Link>
          </Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            mt: 3,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCancel}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Cancel & Go Home
          </Button>
        </Box>
      </LoginPaper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled" 
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          Logged in successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
