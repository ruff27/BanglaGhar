import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useAuth } from "../context/AuthContext"; // Adjust path if needed
import axios from "axios";
import { Link as RouterLink } from "react-router-dom"; // *** Import RouterLink ***

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

  const removeFromWishlist = async (propertyId) => {
    if (!user?.email) return;
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
    /* ... loading UI ... */
  }
  if (!isLoggedIn) {
    /* ... login prompt ... */
  }
  if (error) {
    /* ... error UI ... */
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Saved Properties
      </Typography>
      {savedProperties.length === 0 ? (
        <Alert severity="info">You haven't saved any properties yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {savedProperties.map((property) =>
            property && property._id ? (
              <Grid item xs={12} sm={6} md={4} key={property._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      property.images?.[0]
                        ? `/pictures/${property.images[0]}`
                        : "/pictures/placeholder.png"
                    }
                    alt={property.title || "Property Image"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/pictures/placeholder.png";
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {property.title || "Untitled Property"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {property.location || "No Location"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ mt: 1, fontWeight: "bold", color: "primary.main" }}
                    >
                      {property.price
                        ? `৳${property.price.toLocaleString()}`
                        : "Price N/A"}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
                    {/* *** FIX: Use RouterLink for View Details *** */}
                    <Button
                      component={RouterLink}
                      to={`/properties/details/${property._id}`} // Link to property detail page
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeFromWishlist(property._id)}
                      fullWidth
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ) : null
          )}
        </Grid>
      )}
      <Snackbar /* ... snackbar code ... */>
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
