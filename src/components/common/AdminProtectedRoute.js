import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path
import { Box, CircularProgress, Typography } from "@mui/material";

const AdminProtectedRoute = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Checking authentication...</Typography>
      </Box>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    console.warn("Admin access denied for user:", user?.email);
    alert("Access Denied: Administrator privileges required.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
