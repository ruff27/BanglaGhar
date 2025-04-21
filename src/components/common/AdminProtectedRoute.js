// src/components/common/AdminProtectedRoute.js
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Adjust path
import { Box, CircularProgress, Typography } from "@mui/material";

const AdminProtectedRoute = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator while auth state is being determined
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
    // User not logged in, redirect to login page
    // Pass the current location so login can redirect back after success
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    // User is logged in but not an admin, redirect to home page
    console.warn("Admin access denied for user:", user?.email);
    // Optionally show an 'Access Denied' message before redirecting
    alert("Access Denied: Administrator privileges required."); // Replace with better UX later
    return <Navigate to="/" replace />;
  }

  // User is logged in AND is an admin, render the nested admin routes
  return <Outlet />;
};

export default AdminProtectedRoute;
