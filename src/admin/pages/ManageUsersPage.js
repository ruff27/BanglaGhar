// src/admin/pages/ManageUsersPage.js
import React from "react";
import { Typography, Container, Alert, TablePagination } from "@mui/material"; // Removed unused imports
import { useManageUsers } from "../hooks/useManageUsers"; // Import the custom hook
import UserFilters from "../components/users/UserFilters"; // Import filter component
import UsersTable from "../components/users/UsersTable"; // Import table component

const ManageUsersPage = () => {
  // Use the custom hook to get state and handlers
  const {
    users,
    loading,
    fetchError,
    page,
    rowsPerPage,
    totalUsers,
    order,
    orderBy,
    searchTerm,
    filterStatus,
    actionLoading,
    loggedInUser,
    handleSearchChange,
    handleFilterStatusChange,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleUserUpdate, // This is the update function from the hook
  } = useManageUsers();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Users
      </Typography>

      {/* Render Filter Component */}
      <UserFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onSearchChange={handleSearchChange}
        onFilterStatusChange={handleFilterStatusChange}
      />

      {/* Display Fetch Errors */}
      {fetchError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            /* Optional: Add way to clear error in hook */
          }}
        >
          {fetchError}
        </Alert>
      )}

      {/* Render Table Component */}
      <UsersTable
        users={users}
        loading={loading}
        order={order}
        orderBy={orderBy}
        actionLoading={actionLoading}
        loggedInUser={loggedInUser}
        onRequestSort={handleRequestSort}
        onUserUpdate={handleUserUpdate} // Pass the handler from the hook
      />

      {/* Render Pagination - Kept here as it directly uses hook state */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        // sx={{ position: 'sticky', bottom: 0, backgroundColor: 'background.paper' }} // Optional: make pagination sticky
      />
      {/* ConfirmationDialog would also be rendered here if needed for bulk actions */}
    </Container>
  );
};

export default ManageUsersPage;
