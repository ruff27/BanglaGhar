// src/admin/pages/ManageUsersPage.js
import React from "react";
import { Typography, Container } from "@mui/material";

const ManageUsersPage = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 3 }}>
        Manage Users
      </Typography>
      <Typography>
        User list, search functionality, and controls to block, set admin
        status, and manage listing approval will be implemented here.
      </Typography>
      {/* Placeholder for future User Table/List Component */}
    </Container>
  );
};

export default ManageUsersPage;
