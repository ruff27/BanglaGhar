// src/features/home/components/FeaturedProperties.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid2,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext"; // Adjust path if needed
import PropertyCard from "../../properties/components/PropertyCard"; // Path verified

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
      setLoading(true); // Reset loading state
      setError(null); // Reset error state
      console.log(
        // Keep your helpful log
        "FeaturedProperties: Attempting to fetch featured listings..."
      );
      try {
        // --- Ensure correct URL ---
        console.log(
          // Keep your helpful log
          "Requesting URL:",
          `${API_BASE_URL}/properties?featured=true&limit=25`
        );
        const response = await axios.get(
          `${API_BASE_URL}/properties?featured=true&limit=25`
        );
        console.log(
          // Keep your helpful log
          "FeaturedProperties: API Response Received:",
          response.data
        );
        setProperties(response.data || []);
      } catch (err) {
        console.error("Error fetching featured properties:", err);
        setError("Failed to load featured properties."); // Set user-friendly error
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
    // Keep dependency array based on your version
    // If t() is used ONLY for static text like headers, it might not strictly be needed here.
    // If t() is used within error messages set in state, include it. Let's keep it for safety.
  }, [t]);

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
  }, [isLoggedIn, user]); // Dependencies look correct

  // Function to handle wishlist toggle
  const toggleWishlist = async (propertyId) => {
    if (!isLoggedIn || !user?.email) {
      navigate("/login");
      return;
    }
    const isInWishlist = wishlist.includes(propertyId);
    const username = user.email; // Use email as username based on fetch URL
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

  // Function to handle viewing property details - Keep your version
  const handleViewDetails = (property) => {
    const mode = property.listingType || "rent"; // Default to rent if undefined
    navigate(`/properties/${mode}?open=${property._id}`); // Use query param strategy
  };

  return (
    // Section container
    <Box sx={{ py: 6, bgcolor: "rgba(43, 123, 140, 0.03)" }}>
      {/* Main content container - ADD disableGutters */}
      <Container maxWidth="lg" disableGutters>
        {/* Header Box - ADD manual padding */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
            px: { xs: 2, sm: 3 }, // Manual padding: 16px mobile, 24px tablet+
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
            onClick={() => navigate("/properties/rent")} // Navigate to default properties page
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
        {/* Error Message - ADD manual padding */}
        {error && (
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            {" "}
            {/* Add padding */}
            <Typography color="error" sx={{ textAlign: "center", my: 5 }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Property Grid2 */}
        {!loading && !error && properties.length > 0 && (
          <Grid2
            container
            // --- Use Row and Column Spacing ---
            rowSpacing={{ xs: 3, sm: 3 }} // Vertical space: xs=24px, sm+=24px (Adjust xs as needed: 2=16px, 3=24px)
            columnSpacing={{ xs: 0, sm: 3 }} // Horizontal space: xs=0, sm+=24px
            // --- End Spacing ---
            sx={{
              // Apply horizontal padding manually only on xs
              px: { xs: 2, sm: 0 }, // 16px horizontal padding on mobile only
            }}
          >
            {properties.map((property) => (
              <Grid2 item xs={12} sm={6} md={4} lg={3} key={property._id}>
                {/* Render the original PropertyCard */}
                <PropertyCard
                  property={property}
                  isWishlisted={wishlist.includes(property._id)}
                  onWishlistToggle={() => toggleWishlist(property._id)}
                  // onViewDetails is not a prop received by the original PropertyCard
                  // The RouterLink wrapping the card handles navigation
                  // onViewDetails={() => handleViewDetails(property)} // This prop isn't used by the card
                />
              </Grid2>
            ))}
          </Grid2>
        )}

        {/* No Properties Message - ADD manual padding */}
        {!loading && !error && properties.length === 0 && (
          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            {" "}
            {/* Add padding */}
            <Typography
              sx={{ textAlign: "center", my: 5, color: "text.secondary" }}
            >
              No featured properties available at the moment.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default FeaturedProperties;
