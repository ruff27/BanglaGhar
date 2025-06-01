import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardOverview from "./pages/DashboardOverview";
import AdminLayout from "./components/AdminLayout";
import PendingApprovalsPage from "./pages/PendingApprovalsPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ManageListingsPage from "./pages/ManageListingsPage";


const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="pending-approvals" element={<PendingApprovalsPage />} />
        <Route path="users" element={<ManageUsersPage />} />{" "}
        <Route path="listings" element={<ManageListingsPage />} />{" "}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
