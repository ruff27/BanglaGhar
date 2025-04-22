// src/pages/MyListingsPage.js
import React from "react"; // Make sure React is imported
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import useMyListings from "../features/profile/hooks/useMyListings"; // Adjust path
import PropertyCard from "../features/properties/components/PropertyCard"; // Adjust path
import { Link as RouterLink } from "react-router-dom";
// --- START: Import Wishlist Hook and Snackbar Hook ---
import useWishlist from "../features/properties/hooks/useWishlist"; // <<< Adjust path
import { useSnackbar } from "../context/SnackbarContext"; // <<< Adjust path
// --- END: Import ---

const MyListingsPage = () => {
  const { myListings, loading, error, refetchListings } = useMyListings();
  // --- START: Use Wishlist Hook and Snackbar Hook ---
  const { wishlistIds, toggleWishlist, loadingWishlist } = useWishlist(); // Get wishlist state and toggle function
  const { showSnackbar } = useSnackbar(); // Get snackbar function for feedback
  // --- END: Use Hooks ---

  const renderContent = () => {
    // Use main loading state for initial page load
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
          <Button onClick={refetchListings} size="small" sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      );
    }

    if (myListings.length === 0) {
      return (
        <Box sx={{ textAlign: "center", my: 5 }}>
          <Typography variant="h6" gutterBottom>
            You haven't listed any properties yet.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/list-property"
          >
            List Your First Property
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {myListings.map((property) => {
          // --- START: Determine wishlist status and setup toggle ---
          const isWishlisted = wishlistIds.has(property._id);
          const handleToggle = () => {
            // Pass property ID and the snackbar function as the callback
            toggleWishlist(property._id, (message, severity) => {
              showSnackbar(message, severity);
            });
          };
          // --- END: Wishlist Logic ---

          return (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              {/* --- START: Pass wishlist props to PropertyCard --- */}
              <PropertyCard
                property={property}
                isWishlisted={isWishlisted} // Pass current status
                onWishlistToggle={handleToggle} // Pass toggle handler
              />
              {/* --- END: Pass wishlist props --- */}
              {/* Add Edit/Delete buttons specific to user's own listings here */}
              {/* Example:
                            <Box sx={{mt: 1, display: 'flex', gap: 1}}>
                                <Button size="small" variant="outlined">Edit</Button>
                                <Button size="small" variant="outlined" color="error">Delete</Button>
                            </Box>
                             */}
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Listed Properties
      </Typography>
      {/* Optionally show a small spinner if only the wishlist is loading */}
      {loadingWishlist && <CircularProgress size={20} sx={{ mb: 1 }} />}
      {renderContent()}
    </Container>
  );
};

export default MyListingsPage;
