// src/admin/hooks/useManageListings.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { debounce } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const useManageListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { idToken } = useAuth();
  const { showSnackbar } = useSnackbar();

  // State for Pagination, Sorting, Filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalListings, setTotalListings] = useState(0);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPropertyType, setFilterPropertyType] = useState("");
  const [filterListingType, setFilterListingType] = useState("");
  const [filterVisibility, setFilterVisibility] = useState(""); // Stores "true", "false", or ""
  const [filterFeatured, setFilterFeatured] = useState(""); // Stores "true", "false", or ""

  // State for Actions
  const [actionLoading, setActionLoading] = useState({}); // For individual row actions (hide/feature)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false); // For bulk delete button
  const [selected, setSelected] = useState([]); // Array of selected listing IDs
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Debounced reset page handler
  const debouncedResetPage = useCallback(
    debounce(() => setPage(0), 500),
    [setPage]
  );

  // Filter/Search Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedResetPage();
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    debouncedResetPage();
  };

  // Fetch Listings Effect
  useEffect(() => {
    const fetchListings = async () => {
      if (!idToken) return;
      setLoading(true);
      setFetchError(null);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        sort: orderBy,
        order,
        search: searchTerm,
      });
      if (filterPropertyType) params.append("propertyType", filterPropertyType);
      if (filterListingType) params.append("listingType", filterListingType);
      if (filterVisibility) params.append("isHidden", filterVisibility);
      if (filterFeatured) params.append("isFeatured", filterFeatured);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/admin/listings?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        setListings(response.data.listings || []);
        setTotalListings(response.data.totalListings || 0);
        // Clear selection when data reloads to avoid stale selections
        setSelected([]);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setFetchError(
          err.response?.data?.message || "Failed to fetch listings."
        );
        setListings([]);
        setTotalListings(0);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [
    idToken,
    page,
    rowsPerPage,
    orderBy,
    order,
    searchTerm,
    filterPropertyType,
    filterListingType,
    filterVisibility,
    filterFeatured,
  ]);

  // --- Selection Handlers ---
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = listings.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (event, id) => {
    // Renamed from handleClick for clarity
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0)
      newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1)
      newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // --- Sorting & Pagination Handlers ---
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // --- Individual Action Handlers ---
  const handleVisibilityToggle = useCallback(
    async (id, isHidden) => {
      if (!idToken) {
        showSnackbar("Authentication token missing.", "error");
        return;
      }
      const currentActionKey = `visibility-${id}`;
      setActionLoading((prev) => ({ ...prev, [currentActionKey]: true }));
      try {
        await axios.put(
          `${API_BASE_URL}/admin/listings/${id}/visibility`,
          { isHidden: !isHidden },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        // Update local state
        setListings((lst) =>
          lst.map((l) => (l._id === id ? { ...l, isHidden: !isHidden } : l))
        );
        showSnackbar(`Listing visibility updated successfully.`, "success");
      } catch (err) {
        console.error("Visibility toggle error:", err);
        showSnackbar(
          err.response?.data?.message || "Failed to update visibility.",
          "error"
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [currentActionKey]: false }));
      }
    },
    [idToken, showSnackbar, setListings, setActionLoading]
  );

  const handleFeatureToggle = useCallback(
    async (id, featuredAt) => {
      if (!idToken) {
        showSnackbar("Authentication token missing.", "error");
        return;
      }
      const isCurrentlyFeatured = featuredAt != null;
      const currentActionKey = `feature-${id}`;
      setActionLoading((prev) => ({ ...prev, [currentActionKey]: true }));
      try {
        const resp = await axios.put(
          `${API_BASE_URL}/admin/listings/${id}/feature`,
          { feature: !isCurrentlyFeatured },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        // Update local state
        setListings((lst) =>
          lst.map((l) =>
            l._id === id
              ? { ...l, featuredAt: resp.data.listing.featuredAt }
              : l
          )
        );
        showSnackbar(
          `Listing ${
            !isCurrentlyFeatured ? "featured" : "unfeatured"
          } successfully.`,
          "success"
        );
      } catch (err) {
        console.error("Feature toggle error:", err);
        showSnackbar(
          err.response?.data?.message || "Failed to update feature status.",
          "error"
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [currentActionKey]: false }));
      }
    },
    [idToken, showSnackbar, setListings, setActionLoading]
  );

  // --- Bulk Delete Handlers ---
  const handleDeleteSelected = () => {
    // Just opens the dialog
    if (selected.length === 0 || !idToken) return;
    setConfirmDialogOpen(true);
  };

  const executeBulkDelete = async () => {
    // Called by dialog confirmation
    setBulkDeleteLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/listings`, {
        headers: { Authorization: `Bearer ${idToken}` },
        data: { listingIds: selected }, // Send IDs in the request body
      });
      // Update local state
      setListings((prev) => prev.filter((l) => !selected.includes(l._id)));
      setTotalListings((prev) => prev - response.data.deletedCount);
      setSelected([]); // Clear selection
      showSnackbar(
        `${response.data.deletedCount} listing(s) deleted successfully.`,
        "success"
      );
    } catch (err) {
      console.error("Error deleting selected listings:", err);
      showSnackbar(
        err.response?.data?.message || "Failed to delete selected listings.",
        "error"
      );
    } finally {
      setBulkDeleteLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Return state and handlers
  return {
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
    isSelected, // Pass helper
    handleSearchChange,
    handleFilterChange, // Pass generic filter handler
    handleSelectAllClick,
    handleRowClick,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleVisibilityToggle,
    handleFeatureToggle,
    handleDeleteSelected, // To open dialog
    executeBulkDelete, // To execute delete
    closeConfirmDialog, // To close dialog
    setFilterPropertyType, // Pass setters for filters if needed by ListingFilters
    setFilterListingType,
    setFilterVisibility,
    setFilterFeatured,
  };
};
