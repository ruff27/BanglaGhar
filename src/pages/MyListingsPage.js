import React from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import useMyListings from "../features/profile/hooks/useMyListings";
import PropertyCard from "../features/properties/components/PropertyCard"; 
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useWishlist from "../features/properties/hooks/useWishlist"; 
import { useSnackbar } from "../context/SnackbarContext";


const MyListingsPage = () => {
  const { myListings, loading, error, refetchListings } = useMyListings();
  const { wishlistIds, toggleWishlist, loadingWishlist } = useWishlist();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleEditProperty = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };

  const renderContent = () => {
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
          const isWishlisted = wishlistIds.has(property._id);
          const handleToggle = () => {
            toggleWishlist(property._id, (message, severity) => {
              showSnackbar(message, severity);
            });
          };
          return (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <PropertyCard
                property={property}
                isWishlisted={isWishlisted} 
                onWishlistToggle={handleToggle} 
              />

              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleEditProperty(property._id)}
                >
                  Edit Property
                </Button>
              </Box>
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
      {loadingWishlist && <CircularProgress size={20} sx={{ mb: 1 }} />}
      {renderContent()}
    </Container>
  );
};

export default MyListingsPage;
