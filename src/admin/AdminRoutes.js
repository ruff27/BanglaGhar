// src/admin/AdminRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import Admin Layout and Page Components
import DashboardOverview from "./pages/DashboardOverview";
import AdminLayout from "./components/AdminLayout"; // Adjust path if needed
import PendingApprovalsPage from "./pages/PendingApprovalsPage";
// Import the page components from their separate files
import ManageUsersPage from "./pages/ManageUsersPage";
import ManageListingsPage from "./pages/ManageListingsPage";

// --- Ensure the inline const definitions below are DELETED ---

const AdminRoutes = () => {
  return (
    // The AdminLayout provides the structure for all routes defined within
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Define specific admin routes */}
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="pending-approvals" element={<PendingApprovalsPage />} />
        <Route path="users" element={<ManageUsersPage />} />{" "}
        {/* Use imported component */}
        <Route path="listings" element={<ManageListingsPage />} />{" "}
        {/* Use imported component */}
        {/* Default route for "/admin" -> redirect to pending approvals */}
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* Optional: Catch-all for invalid /admin paths */}
        {/* <Route path="*" element={<AdminNotFoundPage />} /> */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

// --- DELETE the const ManageUsersPage = ... and const ManageListingsPage = ... definitions from here down ---
