// src/admin/pages/ManageListingsPage.js
import React from "react";
import { Typography, Container, Alert, TablePagination } from "@mui/material"; // Keep necessary imports
import { useManageListings } from "../hooks/useManageListings";
import ListingFilters from "../components/listings/ListingFilters";
import BulkActionsToolbar from "../components/listings/BulkActionsToolbar";
import ListingsTable from "../components/listings/ListingsTable";
import ConfirmationDialog from "../../components/common/ConfirmationDialog"; // Keep this import

const ManageListingsPage = () => {
  const {
    listings,
    loading,
    fetchError,
    page,
    rowsPerPage,
    totalListings,
    order,
    orderBy,
    searchTerm,
    filterPropertyType,
    filterListingType,
    filterVisibility,
    filterFeatured,
    actionLoading,
    bulkDeleteLoading,
    selected,
    confirmDialogOpen,
    isSelected,
    handleSearchChange,
    handleFilterChange,
    handleSelectAllClick,
    handleRowClick,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleVisibilityToggle,
    handleFeatureToggle,
    handleDeleteSelected,
    executeBulkDelete,
    closeConfirmDialog,
    setFilterPropertyType,
    setFilterListingType,
    setFilterVisibility,
    setFilterFeatured,
  } = useManageListings();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Manage Listings
      </Typography>

      {/* Filters */}
      <ListingFilters
        searchTerm={searchTerm}
        filterPropertyType={filterPropertyType}
        filterListingType={filterListingType}
        filterVisibility={filterVisibility}
        filterFeatured={filterFeatured}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        setFilterPropertyType={setFilterPropertyType}
        setFilterListingType={setFilterListingType}
        setFilterVisibility={setFilterVisibility}
        setFilterFeatured={setFilterFeatured}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        numSelected={selected.length}
        onDeleteSelected={handleDeleteSelected} // Opens confirm dialog
        isLoading={bulkDeleteLoading}
      />

      {/* Fetch Error Display */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}

      {/* Table */}
      <ListingsTable
        listings={listings}
        loading={loading}
        order={order}
        orderBy={orderBy}
        selected={selected}
        actionLoading={actionLoading}
        isSelected={isSelected}
        onSelectAllClick={handleSelectAllClick}
        onRowClick={handleRowClick}
        onRequestSort={handleRequestSort}
        onVisibilityToggle={handleVisibilityToggle}
        onFeatureToggle={handleFeatureToggle}
        bulkDeleteLoading={bulkDeleteLoading}
      />

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalListings}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={executeBulkDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selected.length} selected listing(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonProps={{ color: "error" }}
        isConfirming={bulkDeleteLoading}
      />
    </Container>
  );
};

export default ManageListingsPage;
