// src/features/home/components/FeaturedProperties.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container, // Using standard Container (no disableGutters)
  Typography,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import PropertyCard from "../../properties/components/PropertyCard"; // Using the original reverted version

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const FeaturedProperties = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // --- Fetch featured properties ---
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      console.log(
        "FeaturedProperties: Attempting to fetch featured listings..."
      );
      try {
        const response = await axios.get(
          `${API_BASE_URL}/properties?featured=true&limit=25`
        );
        console.log(
          "FeaturedProperties: API Response Received:",
          response.data
        );
        setProperties(response.data || []);
      } catch (err) {
        console.error("Error fetching featured properties:", err);
        setError("Failed to load featured properties.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [t]); // Keep t if used in error strings potentially

  // Fetch user's wishlist if logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isLoggedIn && user?.email) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/users/${user.email}/wishlist`
          );
          setWishlist(response.data.wishlist.map((item) => item._id || item));
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      } else {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [isLoggedIn, user]);

  // Function to handle wishlist toggle
  const toggleWishlist = async (propertyId) => {
    if (!isLoggedIn || !user?.email) {
      navigate("/login");
      return;
    }
    const isInWishlist = wishlist.includes(propertyId);
    const username = user.email;
    try {
      let updatedWishlist;
      if (isInWishlist) {
        await axios.delete(`${API_BASE_URL}/users/${username}/wishlist`, {
          data: { propertyId },
        });
        updatedWishlist = wishlist.filter((id) => id !== propertyId);
      } else {
        await axios.post(`${API_BASE_URL}/users/${username}/wishlist`, {
          propertyId,
        });
        updatedWishlist = [...wishlist, propertyId];
      }
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  // Function to handle viewing property details
  const handleViewDetails = (property) => {
    const mode = property.listingType || "rent";
    navigate(`/properties/${mode}?open=${property._id}`);
  };

  return (
    // Section container
    <Box sx={{ py: 6, bgcolor: "rgba(43, 123, 140, 0.03)" }}>
      {/* Standard Container - let it handle its default padding */}
      <Container maxWidth="lg">
        {/* Header Box - No manual padding needed */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4, // Margin bottom before the grid
            flexWrap: "wrap",
            gap: 2,
            // Removed manual px padding
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h2"
              fontWeight={700}
              gutterBottom
            >
              {t("featured_properties")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("handpicked_intro")}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/properties/rent")}
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            {t("view_all_properties")}
          </Button>
        </Box>

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
            <CircularProgress />
          </Box>
        )}
        {/* Error Message - No manual padding needed */}
        {error && (
          // <Box sx={{ px: { xs: 2, sm: 3 } }}> Removed padding wrapper
          <Typography color="error" sx={{ textAlign: "center", my: 5 }}>
            {error}
          </Typography>
          // </Box>
        )}

        {/* Property Grid - Use simpler responsive spacing */}
        {!loading && !error && properties.length > 0 && (
          <Grid
            container
            spacing={{ xs: 0, sm: 3 }} // xs=0 removes ALL grid spacing/padding on mobile
            // Removed manual px padding from sx prop here
          >
            {properties.map((property) => (
              // Add Bottom Margin to Grid Item for mobile vertical spacing
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={property._id}
                sx={{ mb: { xs: 3, sm: 0 } }} // Add margin-bottom: 24px (3*8px) on xs only
                                               // Adjust the '3' value for more/less space
              >
                {/* Render the original PropertyCard */}
                <PropertyCard
                  property={property}
                  isWishlisted={wishlist.includes(property._id)}
                  onWishlistToggle={() => toggleWishlist(property._id)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* No Properties Message - No manual padding needed */}
        {!loading && !error && properties.length === 0 && (
          // <Box sx={{ px: { xs: 2, sm: 3 } }}> Removed padding wrapper
          <Typography
            sx={{ textAlign: "center", my: 5, color: "text.secondary" }}
          >
            No featured properties available at the moment.
          </Typography>
          // </Box>
        )}
      </Container>
    </Box>
  );
};

export default FeaturedProperties;
