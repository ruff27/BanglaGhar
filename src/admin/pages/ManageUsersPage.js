import React from "react";
import { Typography, Container, Alert, TablePagination } from "@mui/material"; 
import { useManageUsers } from "../hooks/useManageUsers";
import UserFilters from "../components/users/UserFilters";
import UsersTable from "../components/users/UsersTable";

const ManageUsersPage = () => {
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
    handleUserUpdate,
  } = useManageUsers();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Users
      </Typography>

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
          }}
        >
          {fetchError}
        </Alert>
      )}

      <UsersTable
        users={users}
        loading={loading}
        order={order}
        orderBy={orderBy}
        actionLoading={actionLoading}
        loggedInUser={loggedInUser}
        onRequestSort={handleRequestSort}
        onUserUpdate={handleUserUpdate}
      />

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

export default ManageUsersPage;
