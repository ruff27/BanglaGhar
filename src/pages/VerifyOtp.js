import React from "react";
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
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import useVerifyOtp from "../features/auth/hooks/useVerifyOtp"; 
import VerifyOtpForm from "../features/auth/components/VerifyOtpForm"; 

const VerifyOtpPaper = styled(Paper)(({ theme }) => ({
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

const ResendButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2, 0, 0),
  padding: theme.spacing(1),
  borderRadius: "8px",
  textTransform: "none",
  fontSize: "0.9rem",
  fontWeight: 500,
  color: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    transform: "translateY(-1px)",
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    cursor: "not-allowed",
  },
}));

const VerifyOtp = () => {
  const {
    otp,
    email,
    error,
    isSubmitting,
    isResending,
    openSnackbar,
    snackbarMessage,
    handleOtpChange,
    handleOtpSubmit,
    handleResendOtp,
    handleCloseSnackbar,
  } = useVerifyOtp();

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <VerifyOtpPaper elevation={3}>
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>

        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
        >
          Verify Your Email
        </Typography>

        {email ? (
          <Typography variant="body1" sx={{ mb: 2, textAlign: "center" }}>
            An OTP has been sent to{" "}
            <Box component="strong" sx={{ fontWeight: "medium" }}>
              {email}
            </Box>
            . Please enter it below.
          </Typography>
        ) : (
          <Typography
            variant="body1"
            color="error"
            sx={{ mb: 2, textAlign: "center" }}
          >
            Loading email address... If this persists, please go back.
          </Typography>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 2, borderRadius: "8px" }}
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}

        {email && (
          <VerifyOtpForm
            otp={otp}
            onOtpChange={handleOtpChange}
            onSubmit={handleOtpSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {email && (
          <ResendButton
            variant="text"
            onClick={handleResendOtp}
            disabled={isSubmitting || isResending}
            startIcon={
              isResending ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </ResendButton>
        )}
      </VerifyOtpPaper>
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
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VerifyOtp;