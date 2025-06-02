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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import useChangePassword from "../features/auth/hooks/useChangePassword";
import ChangePasswordForm from "../features/auth/components/ChangePasswordForm";


const ChangePasswordPaper = styled(Paper)(({ theme }) => ({
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


const ChangePassword = () => {
  const changePasswordProps = useChangePassword();

  if (!changePasswordProps) {
    console.error("useChangePassword returned undefined");
    return (
      <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
        <ChangePasswordPaper elevation={3}>
          <StyledAvatar>
            <LockOutlinedIcon fontSize="large" />
          </StyledAvatar>
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
          >
            Error
          </Typography>
          <Alert
            severity="error"
            sx={{ width: "100%", mb: 2, borderRadius: "8px" }}
            aria-live="assertive"
          >
            Failed to load the form. Please try again.
          </Alert>
        </ChangePasswordPaper>
      </Container>
    );
  }

  const {
    email,
    name,
    temporaryPassword,
    newPassword,
    confirmPassword,
    error,
    isSubmitting,
    openSnackbar,
    handleNameChange,
    handleTemporaryPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleChangePasswordSubmit,
    handleCloseSnackbar,
  } = changePasswordProps;

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <ChangePasswordPaper elevation={3}>
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>
        <Typography
          component="h1"
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
        >
          Change Password
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
        <ChangePasswordForm
          email={email}
          name={name}
          temporaryPassword={temporaryPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onNameChange={handleNameChange}
          onTemporaryPasswordChange={handleTemporaryPasswordChange}
          onNewPasswordChange={handleNewPasswordChange}
          onConfirmPasswordChange={handleConfirmPasswordChange}
          onSubmit={handleChangePasswordSubmit}
          isSubmitting={isSubmitting}
          error={error}
          openSnackbar={openSnackbar}
          handleCloseSnackbar={handleCloseSnackbar}
        />
      </ChangePasswordPaper>

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
          Password changed successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChangePassword;