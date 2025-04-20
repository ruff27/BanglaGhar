import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  CardMedia,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Button,
  IconButton, // For potential wishlist button here
  Tooltip, // For potential wishlist button here
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext"; // Adjust path
import useWishlist from "../hooks/useWishlist"; // Adjust path

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Helper (can be moved to utils)
const formatDisplayPrice = (price, mode) => {
  if (price === null || price === undefined) return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "Invalid Price";
  return `৳ ${numericPrice.toLocaleString()}${mode === "rent" ? "/mo" : ""}`;
};

/**
 * PropertyDetailPage
 * Fetches and displays details for a single property.
 */
const PropertyDetailPage = () => {
  const { propertyId } = useParams(); // Get propertyId from URL
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth(); // Get auth state if needed for wishlist/contact
  const { wishlistIds, toggleWishlist, loadingWishlist } = useWishlist(); // Use wishlist hook

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  }); // For wishlist feedback

  const fetchPropertyDetails = useCallback(async () => {
    if (!propertyId) {
      setError("Property ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching details for property ID: ${propertyId}`); // Debug log
      const response = await axios.get(
        `${API_BASE_URL}/properties/${propertyId}`
      );
      if (response.data) {
        setProperty(response.data);
      } else {
        setError("Property not found.");
      }
    } catch (err) {
      console.error("Error fetching property details:", err);
      setError("Failed to load property details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [propertyId]); // Dependency: propertyId

  useEffect(() => {
    fetchPropertyDetails();
  }, [fetchPropertyDetails]); // Fetch when component mounts or propertyId changes

  // Wishlist toggle handler
  const handleWishlistToggle = () => {
    if (!property || !property._id) return;
    toggleWishlist(property._id, (message, severity) => {
      setSnackbar({ open: true, message, severity });
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Property Details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!property) {
    // This case might be covered by error state, but good to have
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Property data not available.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  // Property data is available, render details
  const placeholderImg = `/pictures/placeholder.png`; // Simpler path assuming public folder setup
  const imgSrc = property.images?.[0]
    ? `/pictures/${property.images[0]}`
    : placeholderImg;
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholderImg;
  };
  const isWishlisted = wishlistIds.has(property._id);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Listings
      </Button>
      <Paper elevation={3} sx={{ borderRadius: "12px", overflow: "hidden" }}>
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={7}>
            <CardMedia
              component="img"
              image={imgSrc}
              alt={property.title || "Property image"}
              onError={handleImageError}
              sx={{
                width: "100%",
                height: { xs: 300, md: 500 },
                objectFit: "cover",
              }}
            />
            {/* TODO: Add Image Carousel/Gallery if multiple images exist */}
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Chip
                  label={
                    property.mode?.charAt(0).toUpperCase() +
                    property.mode?.slice(1)
                  }
                  size="small"
                  color={property.mode === "sold" ? "default" : "primary"}
                  variant="filled"
                />
                {/* Wishlist Button on Detail Page */}
                <Tooltip
                  title={
                    isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                  arrow
                >
                  <IconButton
                    onClick={handleWishlistToggle}
                    size="small"
                    disabled={loadingWishlist}
                  >
                    {isWishlisted ? (
                      <FavoriteIcon color="error" />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography
                variant="h4"
                component="h1"
                fontWeight="600"
                gutterBottom
              >
                {property.title}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                  mb: 2,
                }}
              >
                <LocationOnIcon
                  sx={{ fontSize: "1.1rem", mr: 0.5, color: "primary.main" }}
                />
                <Typography variant="body1">{property.location}</Typography>
              </Box>

              <Typography
                variant="h4"
                color="primary.main"
                fontWeight="700"
                sx={{ mb: 2 }}
              >
                {formatDisplayPrice(property.price, property.mode)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Grid
                container
                spacing={1.5}
                sx={{ mb: 2, color: "text.secondary" }}
              >
                <Grid item xs={6} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BedIcon color="action" />
                    <Typography variant="body1">
                      {property.bedrooms ?? "?"} Beds
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BathtubIcon color="action" />
                    <Typography variant="body1">
                      {property.bathrooms ?? "?"} Baths
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SquareFootIcon color="action" />
                    <Typography variant="body1">
                      {property.area ?? "?"} sqft
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HomeWorkIcon color="action" />
                    <Typography variant="body1">
                      {property.propertyType?.charAt(0).toUpperCase() +
                        property.propertyType?.slice(1) || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  color: "text.secondary",
                  whiteSpace: "pre-wrap",
                  flexGrow: 1,
                  overflowY: "auto",
                  maxHeight: "200px" /* Limit description height if needed */,
                }}
              >
                {property.description || "No description available."}
              </Typography>

              {/* Add Contact Agent section or other details */}
              <Box sx={{ mt: "auto", pt: 2 }}>
                {" "}
                {/* Push contact to bottom */}
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Contact Owner
                </Typography>
                {/* Replace with actual contact logic/info */}
                <Button variant="contained" fullWidth>
                  Contact
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {/* Snackbar for wishlist feedback */}
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

export default PropertyDetailPage;
