import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import PropertyCard from "../features/properties/components/PropertyCard";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const Saved = () => {
  const { isLoggedIn, user } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const fetchSavedProperties = useCallback(async () => {
    if (isLoggedIn && user?.email) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/users/${user.email}/wishlist`
        );
        if (response.data && Array.isArray(response.data.wishlist)) {
          setSavedProperties(response.data.wishlist);
        } else {
          console.warn(
            "Unexpected response structure for wishlist:",
            response.data
          );
          setSavedProperties([]);
        }
      } catch (err) {
        console.error("Error fetching saved properties:", err);
        setError("Failed to load saved properties. Please try again later.");
        setSavedProperties([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSavedProperties([]);
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  const handleRemoveFromWishlist = async (propertyId) => {
    if (!user?.email || !propertyId) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/${user.email}/wishlist`, {
        data: { propertyId },
      });
      setSavedProperties((prev) => prev.filter((p) => p._id !== propertyId));
      setSnackbar({
        open: true,
        message: "Property removed from saved list.",
        severity: "success",
      });
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setSnackbar({
        open: true,
        message: "Failed to remove property.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading saved properties...</Typography>
      </Container>
    );
  }
  if (!isLoggedIn) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please <RouterLink to="/login">log in</RouterLink> to view your saved
          properties.
        </Alert>
      </Container>
    );
  }
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Saved Properties
      </Typography>
      {savedProperties.length === 0 && !loading ? (
        <Alert severity="info">You haven't saved any properties yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {savedProperties.map((property) =>
            property && property._id ? (
              <Grid item xs={12} sm={6} md={4} key={property._id}>
                <PropertyCard
                  property={property}
                  isWishlisted={true}
                  onWishlistToggle={() =>
                    handleRemoveFromWishlist(property._id)
                  }
                />
              </Grid>
            ) : null
          )}
        </Grid>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Saved;
